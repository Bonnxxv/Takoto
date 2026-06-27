import * as React from "react"
import {
    Captions,
    RefreshCcw,
    LoaderCircle,
    CirclePlay,
    XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
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
import { TextFormattingCard } from "./settings-cards/text-formatting-card"
import { SpeakerEditor } from "./speaker-editor"
import { TranscriptionOptions } from "@/types/interfaces"

interface TranscriptionSettingsProps {}

export const TranscriptionSettings = ({}: TranscriptionSettingsProps) => {
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

    return (
        <>
            <div className="flex flex-col h-full bg-background relative">
                <div className="flex-1 p-4 pt-[69px] space-y-4 overflow-y-auto pb-[88px] no-scrollbar">

                    {/* Sumber — selalu tampil di atas */}
                    {settings.isStandaloneMode ? (
                        <AudioFileCard
                            selectedFile={fileInput}
                            onFileSelect={(file) => setFileInput(file)}
                        />
                    ) : (
                        <div className="rounded-xl border border-border overflow-hidden">
                            <div className="flex items-center gap-2.5 px-3 py-2 bg-secondary">
                                <img
                                    src="/davinci-resolve-logo.png"
                                    alt="DaVinci Resolve"
                                    className="h-4 w-4 flex-shrink-0"
                                    style={{ filter: timelineInfo?.timelineId ? undefined : "grayscale(100%)" }}
                                />
                                <span className="text-xs font-medium font-mono truncate flex-1 text-foreground">
                                    {timelineInfo?.timelineId ? timelineInfo.name : 'Buka timeline di Resolve'}
                                </span>
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${timelineInfo?.timelineId ? 'bg-green-500' : 'bg-red-500'}`} />
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
                                            className="h-6 w-6 p-0 flex-shrink-0"
                                            disabled={isRefreshing}
                                        >
                                            <RefreshCcw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="text-xs">Segarkan</TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="divide-y divide-border">
                                <AudioInputCard
                                    compact
                                    callRefresh={() => refresh()}
                                    selectedTracks={settings.selectedInputTracks}
                                    inputTracks={timelineInfo?.inputTracks || []}
                                    onTracksChange={(tracks) => updateSetting("selectedInputTracks", tracks)}
                                />
                                <SubtitleSettingsCard
                                    compact
                                    selectedTemplate={settings.selectedTemplate}
                                    onTemplateChange={(template) => updateSetting("selectedTemplate", template)}
                                    outputTracks={timelineInfo?.outputTracks || []}
                                    templates={timelineInfo?.templates || []}
                                    selectedOutputTrack={settings.selectedOutputTrack}
                                    onOutputTrackChange={(track) => updateSetting("selectedOutputTrack", track)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Pemrosesan */}
                    <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                        <LanguageSettingsCard
                            compact
                            sourceLanguage={settings.language}
                            translate={settings.translate}
                            onSourceLanguageChange={(language) => updateSetting('language', language)}
                            onTranslateChange={(translate) => updateSetting('translate', translate)}
                        />
                        <ModelSelectionCard
                            compact
                            language={settings.language}
                            selectedModel={settings.model}
                            models={modelsState}
                            downloadingModel={downloadingModel}
                            downloadProgress={downloadProgress}
                            onModelChange={(model) => updateSetting('model', model)}
                            onDeleteModel={(model) => handleDeleteModel(model)}
                        />
                    </div>

                    {/* Format Teks */}
                    <div className="rounded-xl border border-border overflow-hidden">
                        <TextFormattingCard
                            compact
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
                            onResetSettings={resetSettings}
                            isWalkthroughMode={false}
                        />
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t frosted-glass shadow-apple-md space-y-3.5 z-10">

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
