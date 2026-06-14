import * as React from "react"
import {
    ChevronDown as ChevronDownIcon,
    Captions,
    HelpCircle,
    RefreshCcw,
    History,
    LoaderCircle,
    CirclePlay,
    Copy,
    FolderOpen,
    XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useIsMobile } from "@/hooks/use-mobile"
import { MobileSubtitleViewer } from "@/components/mobile-subtitle-viewer"
import { useGlobal } from "@/contexts/GlobalContext"
import { invoke } from "@tauri-apps/api/core"
import { AudioFileCard } from "./settings-cards/audio-file-card"
import { AudioInputCard } from "./settings-cards/audio-input-card"
import { SubtitleSettingsCard } from "./settings-cards/subtitle-settings-card"
import { LanguageSettingsCard } from "@/components/settings-cards/language-settings-card"
import { ModelSelectionCard } from "./settings-cards/model-selection-card"
import { SpeakerLabelingCard } from "./settings-cards/speaker-labeling-card"
import { TextFormattingCard } from "./settings-cards/text-formatting-card"
import { SpeakerEditor } from "./speaker-editor"
import { TranscriptionOptions } from "@/types/interfaces"
import { SurveyNotification } from "./survey-notification"
import { WordTimestampsCard } from "./settings-cards/word-timestamps-card"
import { Gauge } from "lucide-react"
import { writeText } from "@tauri-apps/plugin-clipboard-manager"
import { openPath } from "@tauri-apps/plugin-opener"

interface TranscriptionSettingsProps {
    onShowTutorial?: () => void
}

export const TranscriptionSettings = ({
    onShowTutorial
}: TranscriptionSettingsProps) => {
    const isMobile = useIsMobile()
    const {
        settings,
        modelsState,
        timelineInfo,
        updateSetting,
        checkDownloadedModels,
        handleDeleteModel,
        getSourceAudio,
        validateTranscriptionInput,
        createTranscriptionOptions,
        processTranscriptionResults,
        refresh,
        resetSettings,
        setFileInput,
        fileInput,
        transcriptionProgress,
        setTranscriptionProgress,
        downloadingModel,
        isModelDownloading,
        downloadProgress,
        setupEventListeners,
        cancelExport,
        isExporting,
        setIsExporting,
        exportProgress,
        setExportProgress,
        isRefreshing,
        setIsRefreshing,
        isTranscribing,
        setIsTranscribing,
        showMobileSubtitles,
        setShowMobileSubtitles,
        diarizationProgress,
        isDiarizing,
        pushToTimeline,
        cancelRequestedRef,
        clearTranscriptionData,
    } = useGlobal()

    const [showSpeakerEditor, setShowSpeakerEditor] = React.useState(false)
    const [showNonDiarizedDialog, setShowNonDiarizedDialog] = React.useState(false)
    const [copiedLogs, setCopiedLogs] = React.useState(false)
    const [transcriptionError, setTranscriptionError] = React.useState<string | null>(null)

    React.useEffect(() => {
        const cleanup = setupEventListeners();
        return cleanup;
    }, [setupEventListeners]);

    const handleStartTranscription = async () => {
        setTranscriptionError(null)

        if (!validateTranscriptionInput()) {
            return
        }

        const audioInfo = await getSourceAudio(
            settings.isStandaloneMode,
            fileInput,
            settings.selectedInputTracks
        )
        if (!audioInfo) {
            const errorMsg = "Failed to get audio. Please check that your audio source is available."
            console.error(errorMsg)
            setTranscriptionError(errorMsg)
            return
        }

        if (clearTranscriptionData) {
            clearTranscriptionData();
        }

        setIsTranscribing(true)
        setTranscriptionProgress(0)

        try {
            const options: TranscriptionOptions = createTranscriptionOptions(audioInfo)
            console.log("Invoking transcribe_audio with options:", options)

            const transcript = await invoke("transcribe_audio", { options })
            console.log("Transcription successful:", transcript)

            await processTranscriptionResults(transcript as any)

            if (!settings.isStandaloneMode && options.enableDiarize) {
                console.log("Enabling speaker editor")
                setShowSpeakerEditor(true)
            } else if (!settings.isStandaloneMode && !options.enableDiarize) {
                console.log("Showing non-diarized dialog")
                setShowNonDiarizedDialog(true)
            }
        } catch (error) {
            console.error("Transcription failed:", error)
            let errorMsg = "Transcription failed. "

            if (error instanceof Error) {
                errorMsg += error.message
            } else if (typeof error === 'string') {
                errorMsg += error
            } else {
                errorMsg += "Please check the logs for more details."
            }

            if (errorMsg.toLowerCase().includes("ffprobe")) {
                errorMsg += "\n\nThis usually means ffprobe is not installed. Please install ffmpeg (which includes ffprobe) on your system."
            }

            setTranscriptionError(errorMsg)
        } finally {
            setIsTranscribing(false)
            setTranscriptionProgress(0)
            await checkDownloadedModels()
        }
    }

    const resetUIState = () => {
        setIsTranscribing(false)
        setTranscriptionProgress(0)
        setIsExporting(false)
        setExportProgress(0)
    }

    const handleCopyBackendLogs = async () => {
        try {
            const logs = await invoke<string>("get_backend_logs")
            await writeText(logs || "")
            setCopiedLogs(true)
            setTimeout(() => setCopiedLogs(false), 1800)
        } catch (e) {
            console.error("Failed to copy backend logs:", e)
        }
    }

    const handleOpenLogsFolder = async () => {
        try {
            const dir = await invoke<string>("get_log_dir")
            if (dir) {
                await openPath(dir)
            }
        } catch (e) {
            console.error("Failed to open logs folder:", e)
        }
    }

    const handleCancelTranscription = async () => {
        console.log("Cancelling process...")
        cancelRequestedRef.current = true

        try {
            if (isTranscribing) {
                await invoke("cancel_transcription")
                console.log("Transcription cancellation request sent to backend")
            }

            if (isExporting && !isTranscribing) {
                const cancelResult = await cancelExport()
                console.log("Export cancellation result:", cancelResult)
            }

            resetUIState()
        } catch (error) {
            console.error("Failed to cancel process:", error)
            resetUIState()
        } finally {
            cancelRequestedRef.current = true
        }
    }

    function onDismissSurvey() {
        updateSetting("timesDismissedSurvey", settings.timesDismissedSurvey + 1)
        updateSetting("lastSurveyDate", new Date().toISOString())
    }

    return (
        <>
            <div className="flex flex-col h-[calc(100vh-60px)] bg-background">
                <div className="flex-1 p-4 space-y-5 overflow-y-auto">
                    {(() => {
                        const SURVEY_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdt8RyGXsriQA8gH7VVJqua9xPXSuZvjdjH5tKHz8nN3NhT6A/viewform?usp=dialog";
                        const SURVEY_INTERVAL_DAYS = 10;
                        const lastSurveyDate = new Date(settings.lastSurveyDate);
                        const now = new Date();
                        const daysSinceLastSurvey = Math.floor((now.getTime() - lastSurveyDate.getTime()) / (1000 * 60 * 60 * 24));
                        const shouldShowSurvey = settings.timesDismissedSurvey < 3 && (isNaN(daysSinceLastSurvey) || daysSinceLastSurvey >= SURVEY_INTERVAL_DAYS);
                        if (!shouldShowSurvey) return null;
                        return (
                            <SurveyNotification
                                surveyUrl={SURVEY_URL}
                                onDismiss={onDismissSurvey}
                            />
                        );
                    })()}

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                {settings.isStandaloneMode ? "Sumber File" : "DaVinci Resolve"}
                            </h3>
                            {!settings.isStandaloneMode && (
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${!timelineInfo || !timelineInfo.timelineId ? 'bg-red-500' : 'bg-green-500'}`} />
                                    <span className="text-xs font-medium text-muted-foreground truncate max-w-[120px]">
                                        {!timelineInfo || !timelineInfo.timelineId ? 'Terputus' : 'Terhubung'}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1 h-px bg-border ml-1"></div>
                        </div>
                        {settings.isStandaloneMode ? (
                            <div>
                                <AudioFileCard
                                    selectedFile={fileInput}
                                    onFileSelect={(file) => setFileInput(file)}
                                />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Card className="flex items-center gap-2 px-1.5 py-1 shadow-none rounded bg-secondary">
                                    <img
                                        src="/davinci-resolve-logo.png"
                                        alt="DaVinci Resolve Logo"
                                        className="h-5 w-5 mr-0 inline-block"
                                        style={{
                                            verticalAlign: "middle",
                                            filter: timelineInfo && timelineInfo.timelineId ? undefined : "grayscale(100%)",
                                        }}
                                    />
                                    <div className="flex-1">
                                        <div className="text-xs font-medium font-mono truncate dark:text-gray-300 text-gray-700">
                                            {!timelineInfo || !timelineInfo.timelineId ? 'Buka timeline di Resolve.' : timelineInfo.name}
                                        </div>
                                    </div>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                onClick={async () => {
                                                    setIsRefreshing(true);
                                                    await refresh();
                                                    setTimeout(() => setIsRefreshing(false), 400);
                                                }}
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                disabled={isRefreshing}
                                            >
                                                <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="text-xs">
                                            Segarkan
                                        </TooltipContent>
                                    </Tooltip>
                                </Card>
                                <AudioInputCard
                                    callRefresh={() => refresh()}
                                    selectedTracks={settings.selectedInputTracks}
                                    inputTracks={timelineInfo?.inputTracks || []}
                                    onTracksChange={(tracks) => {
                                        updateSetting("selectedInputTracks", tracks)
                                    }}
                                />
                                <SubtitleSettingsCard
                                    selectedTemplate={settings.selectedTemplate}
                                    onTemplateChange={(template) => {
                                        updateSetting("selectedTemplate", template)
                                    }}
                                    outputTracks={timelineInfo?.outputTracks || []}
                                    templates={timelineInfo?.templates || []}
                                    selectedOutputTrack={settings.selectedOutputTrack}
                                    onOutputTrackChange={(track) => {
                                        updateSetting("selectedOutputTrack", track)
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <Collapsible defaultOpen className="space-y-3">
                        <div className="flex items-center gap-4">
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto group">
                                    <ChevronDownIcon className="h-4 w-4 transition-transform duration-200 group-data-[state=closed]:-rotate-90" />
                                    <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                        Pemrosesan
                                    </h3>
                                </Button>
                            </CollapsibleTrigger>
                            <div className="flex-1 h-px bg-border"></div>
                        </div>
                        <CollapsibleContent>
                            <div className="space-y-3">
                                <LanguageSettingsCard
                                    sourceLanguage={settings.language}
                                    translate={settings.translate}
                                    onSourceLanguageChange={(language: string) => {
                                        updateSetting('language', language);
                                    }}
                                    onTranslateChange={(translate: boolean) => {
                                        updateSetting('translate', translate);
                                    }}
                                />

                                <SpeakerLabelingCard
                                    diarize={settings.enableDiarize}
                                    maxSpeakers={settings.maxSpeakers}
                                    onDiarizeChange={(checked) => updateSetting("enableDiarize", checked)}
                                    onMaxSpeakersChange={(value) => updateSetting("maxSpeakers", value)}
                                />

                                <ModelSelectionCard
                                    language={settings.language}
                                    selectedModel={settings.model}
                                    models={modelsState}
                                    downloadingModel={downloadingModel}
                                    downloadProgress={downloadProgress}
                                    onModelChange={(model) => updateSetting('model', model)}
                                    onDeleteModel={(model) => handleDeleteModel(model)}
                                />
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    <Collapsible defaultOpen className="space-y-3">
                        <div className="flex items-center gap-4">
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto group">
                                    <ChevronDownIcon className="h-4 w-4 transition-transform duration-200 group-data-[state=closed]:-rotate-90" />
                                    <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                        Eksperimental
                                    </h3>
                                </Button>
                            </CollapsibleTrigger>
                            <div className="flex-1 h-px bg-border"></div>
                        </div>
                        <CollapsibleContent>
                            <div className="space-y-3">
                                <WordTimestampsCard
                                    enableDTW={settings.enableDTW}
                                    onEnableDTWChange={(checked) => updateSetting("enableDTW", checked)}
                                />

                                <div className="border rounded-lg overflow-hidden">
                                    <div className="p-3.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                                                    <Gauge className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <p className="text-sm font-medium">Akselerasi GPU</p>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Meningkatkan kecepatan transkripsi
                                                    </p>
                                                </div>
                                            </div>
                                            <Switch checked={settings.enableGpu} onCheckedChange={(checked) => updateSetting("enableGpu", checked)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>

                    <Collapsible defaultOpen className="space-y-3">
                        <div className="flex items-center gap-4">
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto group">
                                    <ChevronDownIcon className="h-4 w-4 transition-transform duration-200 group-data-[state=closed]:-rotate-90" />
                                    <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                        Format Teks
                                    </h3>
                                </Button>
                            </CollapsibleTrigger>
                            <div className="flex-1 h-px bg-border"></div>
                        </div>
                        <CollapsibleContent>
                            <TextFormattingCard
                                maxWordsPerLine={settings.maxWordsPerLine}
                                maxCharsPerLine={settings.maxCharsPerLine}
                                maxLinesPerSubtitle={settings.maxLinesPerSubtitle}
                                textCase={settings.textCase}
                                removePunctuation={settings.removePunctuation}
                                splitOnPunctuation={settings.splitOnPunctuation}
                                enableCensor={settings.enableCensor}
                                censoredWords={settings.censoredWords}
                                onMaxWordsPerLineChange={(value) => updateSetting("maxWordsPerLine", value)}
                                onMaxCharsPerLineChange={(value) => updateSetting("maxCharsPerLine", value)}
                                onMaxLinesPerSubtitleChange={(value) => updateSetting("maxLinesPerSubtitle", value)}
                                onTextCaseChange={(textCase) => updateSetting("textCase", textCase)}
                                onRemovePunctuationChange={(checked) => updateSetting("removePunctuation", checked)}
                                onSplitOnPunctuationChange={(checked) => updateSetting("splitOnPunctuation", checked)}
                                onEnableCensorChange={(checked) => updateSetting("enableCensor", checked)}
                                onCensoredWordsChange={(words) => updateSetting("censoredWords", words)}
                                isWalkthroughMode={false}
                            />
                        </CollapsibleContent>
                    </Collapsible>

                    <Collapsible defaultOpen className="space-y-3">
                        <div className="flex items-center gap-4">
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto group">
                                    <ChevronDownIcon className="h-4 w-4 transition-transform duration-200 group-data-[state=closed]:-rotate-90" />
                                    <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                        Tentang
                                    </h3>
                                </Button>
                            </CollapsibleTrigger>
                            <div className="flex-1 h-px bg-border"></div>
                        </div>
                        <CollapsibleContent>
                            <div className="space-y-3.5">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">Developer:</h4>
                                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                        <li>• Bona Tua Briyan Joli Simare Mare</li>
                                        <li>• Yosia Gabriel</li>
                                        <li>• Tsabit Alauddin Kuswandaru</li>
                                    </ul>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={onShowTutorial}
                                    >
                                        <HelpCircle className="h-4 w-4 mr-2" />
                                        Tutorial
                                    </Button>
                                </div>
                                <Button variant="outline" className="w-full" onClick={resetSettings}>
                                    <History className="h-4 w-4 mr-2" />
                                    Reset Pengaturan
                                </Button>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>

                <div className="sticky bottom-0 p-4 border-t bg-background/5 backdrop-blur-lg shadow-2xl space-y-3.5">

                    {isModelDownloading && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Mengunduh {downloadingModel} model...</span>
                                <span>{downloadProgress}%</span>
                            </div>
                            <Progress
                                value={downloadProgress}
                                className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-orange-500"
                            />
                        </div>
                    )}

                    {isExporting && !settings.isStandaloneMode && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Mengekspor Audio dari Timeline</span>
                                <span>{exportProgress}%</span>
                            </div>
                            <Progress
                                value={exportProgress}
                                className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-green-600"
                            />
                        </div>
                    )}

                    {isTranscribing && !isModelDownloading && !isDiarizing && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Kemajuan Transkripsi</span>
                                <span>{transcriptionProgress}%</span>
                            </div>
                            <Progress value={transcriptionProgress} className="h-2" />
                        </div>
                    )}

                    {isDiarizing && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Kemajuan Diarisasi</span>
                                <span>{diarizationProgress}%</span>
                            </div>
                            <Progress value={diarizationProgress} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-purple-400 [&>div]:to-purple-600" />
                        </div>
                    )}

                    {transcriptionError && (
                        <div className="p-3.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20">
                            <div className="flex items-start gap-3">
                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-red-900 dark:text-red-200 whitespace-pre-wrap">
                                        {transcriptionError}
                                    </p>
                                    <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                                        Buka 'Log Folder' di bawah untuk detail lebih lanjut tentang masalah ini.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setTranscriptionError(null)}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0"
                                >
                                    <XCircle className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={handleCopyBackendLogs} className="w-full">
                            <Copy className="h-4 w-4 mr-2" />
                            {copiedLogs ? "Log Disalin" : "Salin Log Backend"}
                        </Button>
                        <Button variant="outline" onClick={handleOpenLogsFolder} className="w-full">
                            <FolderOpen className="h-4 w-4 mr-2" />
                            Buka Folder Log
                        </Button>
                    </div>

                    {isMobile && (
                        <Button onClick={() => setShowMobileSubtitles(true)} variant="secondary" className="w-full">
                            <Captions className="h-5 w-5 mr-2" />
                            Lihat Subtitle
                        </Button>
                    )}

                    <div className="flex gap-2">
                        <Button
                            onClick={handleStartTranscription}
                            disabled={isTranscribing || isExporting || downloadingModel !== null || (settings.selectedInputTracks.length === 0 && !settings.isStandaloneMode) || (fileInput === null && settings.isStandaloneMode)}
                            className="flex-1"
                            size={isMobile ? undefined : "lg"}
                        >
                            {isTranscribing || isExporting ? <LoaderCircle className="mr-2 h-5 w-5 animate-spin" /> : <CirclePlay className="mr-2 h-5 w-5" />}
                            {isExporting ? "Mengekspor Audio..." : isTranscribing ? (isModelDownloading ? "Mengunduh Model..." : "Memproses...") : "Mulai Transkripsi"}
                        </Button>

                        {(isTranscribing || isExporting) && (
                            <Button
                                onClick={handleCancelTranscription}
                                variant="destructive"
                                size={isMobile ? undefined : "lg"}
                                className="px-3"
                            >
                                <XCircle className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div >

            {isMobile && <MobileSubtitleViewer isOpen={showMobileSubtitles} onClose={() => setShowMobileSubtitles(false)} />}

            {
                showSpeakerEditor && (
                    <SpeakerEditor afterTranscription={true} open={showSpeakerEditor} onOpenChange={setShowSpeakerEditor} />
                )
            }

            <AlertDialog open={showNonDiarizedDialog} onOpenChange={setShowNonDiarizedDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Transkripsi Selesai</AlertDialogTitle>
                        <AlertDialogDescription>
                            Jika Anda ingin mengedit subtitle, klik lanjutkan mengedit. Ketika Anda siap, klik tombol oranye untuk menambahkannya ke timeline.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                            <Button variant="outline" onClick={() => setShowNonDiarizedDialog(false)}>
                                Lanjutkan Mengedit
                            </Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <Button onClick={() => {
                                setShowNonDiarizedDialog(false)
                                pushToTimeline()
                            }}>
                                Add to Timeline
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}