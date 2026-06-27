import * as React from "react"
import { Layers2, Users, X, Loader2, Trash2, Captions, Search, ChevronRight, MoreHorizontal, Copy, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SubtitleList } from "@/components/subtitle-list"
import { useGlobal } from "@/contexts/GlobalContext"
import { ImportExportPopover } from "@/components/import-export-popover"
import { SpeakerEditor } from "@/components/speaker-editor"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { invoke } from "@tauri-apps/api/core"
import { writeText } from "@tauri-apps/plugin-clipboard-manager"
import { openPath } from "@tauri-apps/plugin-opener"
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

export function DesktopSubtitleViewer() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  
  // Tambahkan clearTranscriptionData di sini
  const { subtitles, exportSubtitlesAs, importSubtitles, pushToTimeline, settings, clearTranscriptionData } = useGlobal()
  
  const [showSpeakerEditor, setShowSpeakerEditor] = React.useState(false)
  const [isPushing, setIsPushing] = React.useState(false)
  const [showClearConfirm, setShowClearConfirm] = React.useState(false)
  const [copiedLogs, setCopiedLogs] = React.useState(false)

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
      if (dir) await openPath(dir)
    } catch (e) {
      console.error("Failed to open logs folder:", e)
    }
  }

  return (
    <div className="flex flex-col h-full border-l bg-sidebar relative">

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 flex h-[53px] shrink-0 items-center justify-between border-b border-border frosted-glass px-4 py-2.5 z-20 min-w-0 shadow-apple-sm">
        <span className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <Captions className="h-4.5 w-4.5 text-primary" />
          Daftar Subtitle
        </span>
        <div className="flex items-center gap-2">
          {subtitles.length > 0 && (
            <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full font-medium">
              {subtitles.length} Baris
            </span>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 overflow-hidden" align="end">
              {/* Logo + App info */}
              <div className="flex flex-col items-center px-5 pt-5 pb-4 text-center">
                <img src="/takoto-logo.png" alt="Takoto" className="w-16 h-16 rounded-2xl mb-3 shadow-apple-md" />
                <p className="text-base font-bold tracking-tight">Takoto</p>
                <p className="text-xs text-muted-foreground mt-0.5">Versi 3.5</p>
              </div>
              {/* Key-value rows */}
              <div className="border-t border-border px-4 py-3 space-y-1.5">
                <div className="flex gap-3 text-xs">
                  <span className="text-muted-foreground font-medium shrink-0 w-16 text-right">Dibuat oleh</span>
                  <span className="text-foreground">Bona Tua, Tsabit, dan Yosia Gabriel</span>
                </div>
              </div>
              {/* Log buttons */}
              <div className="border-t border-border divide-y divide-border">
                <button
                  onClick={handleCopyBackendLogs}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors text-left"
                >
                  <Copy className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  {copiedLogs ? "Log Disalin!" : "Salin Log Backend"}
                </button>
                <button
                  onClick={handleOpenLogsFolder}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors text-left"
                >
                  <FolderOpen className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  Buka Folder Log
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      {/* Scrollable Viewport Container */}
      <div className="flex-1 overflow-y-auto min-h-0 px-0 pt-[53px] pb-[68px] no-scrollbar flex flex-col">
        
        {/* Action Buttons Area */}
        <div className="shrink-0 px-4 pt-4 pb-0">
          <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
            <ImportExportPopover
              compact
              onImport={importSubtitles}
              onExport={exportSubtitlesAs}
              hasSubtitles={subtitles.length > 0}
            />
            <button
              className="bg-card w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-muted/50 transition-colors"
              onClick={() => setShowSpeakerEditor(true)}
            >
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm flex-1">Speakers</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </button>
            <button
              className="bg-card w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => setShowClearConfirm(true)}
              disabled={subtitles.length === 0}
            >
              <Trash2 className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span className="text-sm flex-1 text-red-600 dark:text-red-400">Hapus List Sub</span>
            </button>
          </div>
          <SpeakerEditor afterTranscription={false} open={showSpeakerEditor} onOpenChange={() => setShowSpeakerEditor(false)} />
        </div>

        {/* Search */}
        <div className="shrink-0 px-4 py-3.5 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search subtitles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-10 rounded-full"
              aria-label="Search subtitles"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {subtitles.length > 0 ? (
            <SubtitleList
              searchQuery={searchQuery}
              itemClassName="hover:bg-sidebar-accent px-4 py-3.5 transition-colors"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-8">
              <p className="text-lg font-medium mb-2">No subtitles found</p>
              <p className="text-sm">
                {searchQuery
                  ? 'Try a different search term'
                  : 'No subtitles available. Try importing some first.'}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      {!settings.isStandaloneMode && (
        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-end gap-2 border-t frosted-glass shadow-apple-md z-10">
          <Button
            variant="default"
            size="lg"
            className="w-full"
            disabled={isPushing}
            onClick={async () => {
              try {
                setIsPushing(true)
                await pushToTimeline()
              } finally {
                setIsPushing(false)
              }
            }}
          >
            {isPushing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Layers2 className="w-4 h-4 mr-2" />
                Add to Timeline
              </>
            )}
          </Button>
        </div>
      )}

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Hasil Transkripsi?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan membersihkan seluruh daftar subtitle yang ada di panel preview. Data pada timeline Resolve tidak akan terpengaruh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (clearTranscriptionData) clearTranscriptionData();
                setShowClearConfirm(false);
              }}
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}