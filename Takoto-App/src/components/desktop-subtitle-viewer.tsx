import * as React from "react"
import { Layers2, Users, X, Loader2, Trash2, Captions, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SubtitleList } from "@/components/subtitle-list"
import { useGlobal } from "@/contexts/GlobalContext"
import { ImportExportPopover } from "@/components/import-export-popover"
import { SpeakerEditor } from "@/components/speaker-editor"
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
  
  // State untuk dialog konfirmasi hapus
  const [showClearConfirm, setShowClearConfirm] = React.useState(false)

  return (
    <div className="flex flex-col h-full border-l bg-sidebar relative">

      {/* Symmetrical Header */}
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
        </div>
      </header>

      {/* Scrollable Viewport Container */}
      <div className="flex-1 overflow-y-auto min-h-0 px-0 pt-[53px] pb-[68px] no-scrollbar flex flex-col">
        
        {/* Action Buttons Area */}
        <div className="shrink-0 px-4 pt-4 pb-0 flex flex-col gap-3">
          <div className="flex gap-2">
            <ImportExportPopover
              onImport={importSubtitles}
              onExport={exportSubtitlesAs}
              hasSubtitles={subtitles.length > 0}
            />
            <Button variant="outline" className="w-full" onClick={() => setShowSpeakerEditor(true)}>
              <Users className="w-4 h-4 mr-2" />
              Speakers
            </Button>
          </div>
          
          {/* Tombol Hapus List Sub di bawah Impor/Ekspor & Speakers */}
          <Button
            variant="outline"
            className="w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900/50"
            onClick={() => setShowClearConfirm(true)}
            disabled={subtitles.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus List Sub
          </Button>
          
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
            size="default"
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