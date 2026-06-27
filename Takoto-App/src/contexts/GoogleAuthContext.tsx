import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { load, Store } from '@tauri-apps/plugin-store';
import { EditorProfile } from '@/types/interfaces';
import { startGoogleLogin } from '@/utils/googleAuthUtils';

interface GoogleAuthContextType {
    editorProfile: EditorProfile | null;
    isLoading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<EditorProfile>) => Promise<void>;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | null>(null);

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
    const [editorProfile, setEditorProfile] = useState<EditorProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [store, setStore] = useState<Store | null>(null);

    useEffect(() => {
        async function init() {
            try {
                const s = await load('takoto-store.json', { autoSave: false });
                setStore(s);
                const profile = await s.get<EditorProfile>('editor-profile');
                if (profile) setEditorProfile(profile);
            } catch (e) {
                console.error('Gagal memuat profil editor:', e);
            } finally {
                setIsLoading(false);
            }
        }
        init();
    }, []);

    async function login() {
        const profile = await startGoogleLogin();
        setEditorProfile(profile);
        if (store) {
            await store.set('editor-profile', profile);
            await store.save();
        }
    }

    async function logout() {
        setEditorProfile(null);
        if (store) {
            await store.delete('editor-profile');
            await store.save();
        }
    }

    async function updateProfile(updates: Partial<EditorProfile>) {
        if (!editorProfile) return;
        const newProfile = { ...editorProfile, ...updates };
        setEditorProfile(newProfile);
        if (store) {
            await store.set('editor-profile', newProfile);
            await store.save();
        }
    }

    return (
        <GoogleAuthContext.Provider value={{ editorProfile, isLoading, login, logout, updateProfile }}>
            {children}
        </GoogleAuthContext.Provider>
    );
}

export function useGoogleAuth() {
    const ctx = useContext(GoogleAuthContext);
    if (!ctx) throw new Error('useGoogleAuth must be used within GoogleAuthProvider');
    return ctx;
}
