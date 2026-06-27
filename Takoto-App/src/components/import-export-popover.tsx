import * as React from "react"
import { Download, Upload, FileUp, FileJson, Captions, Speech, Share2, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { open } from '@tauri-apps/plugin-dialog'
import { downloadDir } from "@tauri-apps/api/path"
import { getCurrentWebview } from "@tauri-apps/api/webview"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useGlobal } from "@/contexts/GlobalContext"
import { useGoogleAuth } from "@/contexts/GoogleAuthContext"
import { shareToGoogleDrive, isDriveConfigured } from "@/utils/googleDriveUtils"
import { toast } from "sonner"

type ExportFormat = 'srt' | 'json';

interface ImportExportPopoverProps {
    onImport: () => Promise<void>
    onExport: (format: ExportFormat, includeSpeakerLabels: boolean) => Promise<void>
    hasSubtitles: boolean
}

export function ImportExportPopover({ onImport, onExport, hasSubtitles }: ImportExportPopoverProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [selectedFile, setSelectedFile] = React.useState<string | null>(null)
    const [exportFormat, setExportFormat] = React.useState<ExportFormat>('srt')
    const [includeSpeakerLabels, setIncludeSpeakerLabels] = React.useState(false)
    const [shareProgress, setShareProgress] = React.useState<string | null>(null)
    const [shareSuccess, setShareSuccess] = React.useState(false)

    const { subtitles, speakers, settings, fileInput, timelineInfo } = useGlobal()
    const { editorProfile, updateProfile } = useGoogleAuth()
    const driveConfigured = isDriveConfigured()

    React.useEffect(() => {
        let unlisten: (() => void) | undefined;
        (async () => {
            const webview = await getCurrentWebview();
            unlisten = await webview.onDragDropEvent((event: any) => {
                if (event.payload.type === 'drop') {
                    const files = event.payload.paths as string[] | undefined;
                    if (files && files.length > 0) {
                        const file = files[0];
                        if (file.endsWith('.srt')) setSelectedFile(file);
                    }
                }
            });
        })();
        return () => { if (unlisten) unlisten(); };
    }, []);

    const handleFileSelect = async () => {
        const file = await open({
            multiple: false,
            directory: false,
            filters: [{ name: 'Subtitle Files', extensions: ['srt'] }],
            defaultPath: await downloadDir()
        });
        if (file) setSelectedFile(file as string);
    };

    const handleImportFile = async () => {
        if (selectedFile) {
            try { 
                await onImport(); 
                setIsOpen(false);
            } catch (error) { 
                console.error("Failed to import file:", error); 
            }
        }
    };

    const handleExportFile = async () => {
        try { 
            await onExport(exportFormat, includeSpeakerLabels); 
            setIsOpen(false);
        } catch (error) { 
            console.error("Failed to export file:", error); 
        }
    };

    const handleShareToDrive = async () => {
        if (!editorProfile || !subtitles.length) return;
        setShareSuccess(false);

        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const baseName = settings.isStandaloneMode
            ? (fileInput?.split('/').pop()?.replace(/\.[^/.]+$/, '') ?? 'transkripsi')
            : (timelineInfo.name || 'transkripsi');
        const filename = `${baseName}_${dateStr}`;

        try {
            await shareToGoogleDrive(
                subtitles,
                speakers,
                includeSpeakerLabels,
                editorProfile,
                filename,
                (step) => setShareProgress(step),
                (accessToken, tokenExpiry) => updateProfile({ accessToken, tokenExpiry })
            );
            setShareSuccess(true);
            setShareProgress(null);
            toast.success('Berhasil dibagikan ke Google Drive');
        } catch (err: any) {
            console.error('Drive share error:', err);
            setShareProgress(null);
            const msg = typeof err === 'string' ? err : (err?.message ?? JSON.stringify(err));
            toast.error('Gagal mengunggah ke Drive', { description: msg || 'Terjadi kesalahan' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(val) => { setIsOpen(val); setShareProgress(null); setShareSuccess(false); }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <Upload className="h-4 w-4" />
                    Impor / Ekspor
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-5">
                <DialogHeader className="mb-2">
                    <DialogTitle>Impor / Ekspor / Bagikan Subtitle</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Pilih opsi di bawah untuk mengimpor file subtitle baru, mengekspor subtitle yang ada, atau membagikannya ke Google Drive.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="import" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="import">Impor</TabsTrigger>
                        <TabsTrigger value="export">Ekspor</TabsTrigger>
                        <TabsTrigger value="share">Bagikan</TabsTrigger>
                    </TabsList>

                    {/* Tab Impor */}
                    <TabsContent value="import" className="space-y-3">
                        <div
                            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors mt-3 flex flex-col items-center justify-center h-36"
                            onClick={handleFileSelect}
                        >
                            <FileUp className="h-8 w-8 mb-2 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Tarik file di sini atau klik untuk memilih</span>
                            <span className="text-xs text-muted-foreground mt-1">Mendukung file <span className="font-mono">.srt</span></span>
                        </div>
                        {selectedFile && (
                            <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-muted/40 rounded-lg">
                                <span className="text-sm text-muted-foreground">Dipilih:</span>
                                <span className="font-mono text-xs bg-background px-2 py-0.5 rounded border border-muted-foreground/10 max-w-[220px] truncate">
                                    {selectedFile.split('/').pop()}
                                </span>
                            </div>
                        )}
                        <Button onClick={handleImportFile} className="w-full mt-2" disabled={!selectedFile}>
                            Impor File
                        </Button>
                    </TabsContent>

                    {/* Tab Ekspor */}
                    <TabsContent value="export" className="space-y-3">
                        <Card className="flex items-center justify-between p-2 mt-3 shadow-none">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                    <Speech className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <p className="text-sm font-medium">Sertakan label pembicara</p>
                            </div>
                            <Switch checked={includeSpeakerLabels} onCheckedChange={setIncludeSpeakerLabels} />
                        </Card>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className={`flex-1 flex flex-col items-center justify-center h-32 border-2 rounded-xl ${exportFormat === 'srt' ? 'border-primary bg-primary/10' : 'bg-transparent'}`}
                                onClick={() => setExportFormat("srt")}
                                type="button"
                            >
                                <Captions className="!h-6 !w-6 mb-2" />
                                <span className="text-base">SRT</span>
                            </Button>
                            <Button
                                variant="outline"
                                className={`flex-1 flex flex-col items-center justify-center h-32 border-2 rounded-xl ${exportFormat === 'json' ? 'border-primary bg-primary/10' : 'bg-transparent'}`}
                                onClick={() => setExportFormat("json")}
                                type="button"
                            >
                                <FileJson className="!h-6 !w-6 mb-2" />
                                <span className="text-base">JSON</span>
                            </Button>
                        </div>
                        <Button onClick={handleExportFile} className="w-full mt-4" disabled={!hasSubtitles}>
                            <Download className="h-4 w-4 mr-2" />
                            Download {exportFormat.toUpperCase()}
                        </Button>
                    </TabsContent>

                    {/* Tab Bagikan ke Drive */}
                    <TabsContent value="share" className="space-y-3 mt-3">
                        {/* Info editor */}
                        {editorProfile && (
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={editorProfile.picture} />
                                    <AvatarFallback>{editorProfile.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{editorProfile.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{editorProfile.email}</p>
                                </div>
                            </div>
                        )}

                        {/* Label pembicara */}
                        <Card className="flex items-center justify-between p-2 shadow-none">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                    <Speech className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <p className="text-sm font-medium">Sertakan label pembicara</p>
                            </div>
                            <Switch checked={includeSpeakerLabels} onCheckedChange={setIncludeSpeakerLabels} />
                        </Card>

                        {/* Info folder */}
                        {editorProfile && driveConfigured && (
                            <p className="text-xs text-muted-foreground text-center px-1">
                                File akan disimpan ke folder{' '}
                                <span className="font-mono text-foreground">
                                    transkripsi_{editorProfile.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_')}
                                </span>{' '}
                                di Google Drive owner.
                            </p>
                        )}

                        {!driveConfigured && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 text-center px-1">
                                Google Drive belum dikonfigurasi. Hubungi admin.
                            </p>
                        )}

                        {/* Progress */}
                        {shareProgress && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                                <span className="truncate">{shareProgress}</span>
                            </div>
                        )}

                        {shareSuccess && (
                            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                <span>Berhasil diunggah ke Google Drive</span>
                            </div>
                        )}

                        <Button
                            onClick={handleShareToDrive}
                            className="w-full"
                            disabled={!hasSubtitles || !editorProfile || !driveConfigured || !!shareProgress}
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            {shareProgress ? 'Mengunggah...' : 'Bagikan ke Google Drive'}
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
