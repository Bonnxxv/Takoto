import React from 'react';
import { Button } from '@/components/ui/button';
import { useGoogleAuth } from '@/contexts/GoogleAuthContext';
import { isAuthConfigured } from '@/utils/googleAuthUtils';
import { Captions, LogIn, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function LoginScreen() {
    const { login } = useGoogleAuth();
    const [isLoggingIn, setIsLoggingIn] = React.useState(false);
    const configured = isAuthConfigured();

    async function handleLogin() {
        setIsLoggingIn(true);
        try {
            await login();
        } catch (err: any) {
            console.error('Login error:', err);
            const msg = typeof err === 'string' ? err : (err?.message ?? JSON.stringify(err));
            toast.error('Login gagal', { description: msg || 'Terjadi kesalahan' });
        } finally {
            setIsLoggingIn(false);
        }
    }

    return (
        /* canvas-soft background — ex-auth-form-card pattern */
        <div className="flex flex-col items-center justify-center h-screen bg-background gap-6 px-8">
            {/* Brand mark */}
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                    <Captions className="h-8 w-8 text-primary" />
                </div>
                <span className="text-3xl font-bold tracking-tight">Takoto</span>
            </div>

            {/* Auth card — feature-card chrome */}
            <div className="w-full max-w-sm bg-card rounded-xl border border-border shadow-apple-md p-6 flex flex-col gap-5">
                <div className="text-center space-y-1">
                    <p className="text-sm font-medium">Masuk untuk melanjutkan</p>
                    <p className="text-xs text-muted-foreground">
                        Diperlukan untuk mengaktifkan fitur berbagi ke Google Drive.
                    </p>
                </div>

                {!configured && (
                    <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2">
                        <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>Google Client ID belum dikonfigurasi. Hubungi admin untuk setup.</span>
                    </div>
                )}

                {/* Primary pill CTA */}
                <Button
                    onClick={handleLogin}
                    disabled={isLoggingIn || !configured}
                    className="w-full"
                    size="lg"
                >
                    {isLoggingIn ? (
                        <>
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            Menunggu login...
                        </>
                    ) : (
                        <>
                            <LogIn className="h-4 w-4 mr-2" />
                            Masuk dengan Google
                        </>
                    )}
                </Button>

                {isLoggingIn && (
                    <p className="text-xs text-muted-foreground text-center">
                        Browser akan terbuka. Setelah login, kembali ke aplikasi ini secara otomatis.
                    </p>
                )}
            </div>
        </div>
    );
}
