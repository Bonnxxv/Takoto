import { EditorProfile } from '@/types/interfaces';
import { Subtitle, Speaker } from '@/types/interfaces';
import { generateSrt } from '@/utils/srtUtils';
import { refreshAccessToken } from '@/utils/googleAuthUtils';

export function isDriveConfigured(): boolean {
    return !!import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;
}

function getMainFolderId(): string {
    const id = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;
    if (!id) throw new Error('VITE_GOOGLE_DRIVE_FOLDER_ID tidak dikonfigurasi');
    return id;
}

async function getValidToken(
    profile: EditorProfile,
    onTokenRefresh?: (accessToken: string, tokenExpiry: number) => void
): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    if (now < profile.tokenExpiry - 60) return profile.accessToken;

    if (!profile.refreshToken) throw new Error('Token kadaluarsa dan tidak ada refresh token. Silakan login ulang.');

    const refreshed = await refreshAccessToken(profile.refreshToken);
    onTokenRefresh?.(refreshed.accessToken, refreshed.tokenExpiry);
    return refreshed.accessToken;
}

async function findOrCreateFolder(name: string, parentId: string, token: string): Promise<string> {
    const q = `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`;
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Gagal mencari folder: ${await res.text()}`);
    const data = await res.json();
    if (data.files?.length > 0) return data.files[0].id;

    const create = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] }),
    });
    if (!create.ok) throw new Error(`Gagal membuat folder: ${await create.text()}`);
    return (await create.json()).id;
}

async function uploadFile(name: string, content: string, folderId: string, token: string): Promise<void> {
    const boundary = 'takoto_boundary';
    const metadata = JSON.stringify({ name, parents: [folderId] });
    const body = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${content}\r\n--${boundary}--`;
    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
        body,
    });
    if (!res.ok) throw new Error(`Gagal mengupload ${name}: ${await res.text()}`);
}

export async function shareToGoogleDrive(
    subtitles: Subtitle[],
    speakers: Speaker[],
    includeSpeakerLabels: boolean,
    editorProfile: EditorProfile,
    baseFilename: string,
    onProgress: (step: string) => void,
    onTokenRefresh?: (accessToken: string, tokenExpiry: number) => void
): Promise<void> {
    onProgress('Memverifikasi akses Drive...');
    const token = await getValidToken(editorProfile, onTokenRefresh);
    const mainFolderId = getMainFolderId();

    onProgress('Menyiapkan folder editor...');
    const editorSlug = editorProfile.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');
    const editorFolderId = await findOrCreateFolder(`transkripsi_${editorSlug}`, mainFolderId, token);

    onProgress('Menyiapkan folder tanggal...');
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const dayStr = String(now.getDate()).padStart(2, '0');
    const monthFolderId = await findOrCreateFolder(monthStr, editorFolderId, token);
    const dayFolderId = await findOrCreateFolder(dayStr, monthFolderId, token);

    onProgress('Mengupload file SRT...');
    const srtContent = generateSrt(subtitles, includeSpeakerLabels, speakers);
    await uploadFile(`${baseFilename}.srt`, srtContent, dayFolderId, token);

    onProgress('Mengupload file TXT...');
    const txtContent = subtitles.map(sub => {
        const speaker = includeSpeakerLabels && sub.speaker_id
            ? `[${speakers[Number(sub.speaker_id)]?.name ?? sub.speaker_id}]: `
            : '';
        return `${speaker}${sub.text.trim()}`;
    }).join('\n');
    await uploadFile(`${baseFilename}.txt`, txtContent, dayFolderId, token);

    onProgress('Selesai!');
}
