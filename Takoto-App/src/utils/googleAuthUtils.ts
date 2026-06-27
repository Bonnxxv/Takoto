import { invoke } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import { listen } from '@tauri-apps/api/event';
import { EditorProfile } from '@/types/interfaces';

export function isAuthConfigured(): boolean {
    return !!import.meta.env.VITE_GOOGLE_CLIENT_ID;
}

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
    const random = new Uint8Array(32);
    crypto.getRandomValues(random);
    const verifier = base64UrlEncode(random);
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    const challenge = base64UrlEncode(hash);
    return { verifier, challenge };
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; tokenExpiry: number }> {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
    const params: Record<string, string> = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
    };
    if (clientSecret) params.client_secret = clientSecret;

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params),
    });
    if (!res.ok) throw new Error(`Token refresh gagal: ${await res.text()}`);
    const data = await res.json();
    return {
        accessToken: data.access_token,
        tokenExpiry: Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
    };
}

export async function startGoogleLogin(): Promise<EditorProfile> {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error('VITE_GOOGLE_CLIENT_ID tidak dikonfigurasi');

    const { verifier, challenge } = await generatePKCE();
    const stateBytes = new Uint8Array(16);
    crypto.getRandomValues(stateBytes);
    const state = base64UrlEncode(stateBytes);

    const port = await invoke<number>('oauth_start_server');
    const redirectUri = `http://localhost:${port}/callback`;

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        // Tambah drive scope agar bisa upload ke Drive
        scope: 'openid email profile https://www.googleapis.com/auth/drive',
        code_challenge: challenge,
        code_challenge_method: 'S256',
        state,
        access_type: 'offline',
        prompt: 'consent', // paksa tampil consent screen agar dapat refresh_token
    });

    await openUrl(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);

    return new Promise((resolve, reject) => {
        let cleanup: (() => void) | undefined;
        const timeout = setTimeout(() => {
            cleanup?.();
            reject(new Error('Login timeout - tidak ada respons dalam 5 menit'));
        }, 5 * 60 * 1000);

        listen<string>('oauth-callback', async (event) => {
            clearTimeout(timeout);
            cleanup?.();
            try {
                const url = new URL(event.payload);
                const code = url.searchParams.get('code');
                const returnedState = url.searchParams.get('state');
                const error = url.searchParams.get('error');

                if (error) throw new Error(`Login ditolak: ${error}`);
                if (!code) throw new Error('Tidak ada authorization code');
                if (returnedState !== state) throw new Error('State tidak cocok');

                const tokenParams: Record<string, string> = {
                    code,
                    client_id: clientId,
                    redirect_uri: redirectUri,
                    grant_type: 'authorization_code',
                    code_verifier: verifier,
                };
                const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
                if (clientSecret) tokenParams.client_secret = clientSecret;

                const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(tokenParams),
                });
                if (!tokenRes.ok) throw new Error(`Token exchange gagal: ${await tokenRes.text()}`);
                const tokenData = await tokenRes.json();

                const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenData.access_token}` },
                });
                if (!userRes.ok) throw new Error('Gagal mengambil info pengguna');
                const userInfo = await userRes.json();

                resolve({
                    email: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture,
                    sub: userInfo.sub,
                    accessToken: tokenData.access_token,
                    refreshToken: tokenData.refresh_token,
                    tokenExpiry: Math.floor(Date.now() / 1000) + (tokenData.expires_in ?? 3600),
                });
            } catch (err) {
                reject(err);
            }
        }).then(fn => { cleanup = fn; });
    });
}
