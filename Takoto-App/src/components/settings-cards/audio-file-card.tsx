import * as React from "react"
import { Upload, FolderOpen, X } from "lucide-react"
import { revealItemInDir } from "@tauri-apps/plugin-opener"
import { Button } from "@/components/ui/button"

import { Card } from "@/components/ui/card"
import { open } from '@tauri-apps/plugin-dialog'
import { downloadDir } from "@tauri-apps/api/path"
import { getCurrentWebview } from "@tauri-apps/api/webview"

interface AudioFileCardProps {
  selectedFile: string | null
  onFileSelect: (file: string | null) => void
}

export const AudioFileCard = ({ selectedFile, onFileSelect }: AudioFileCardProps) => {
  React.useEffect(() => {
    let unlisten: (() => void) | undefined;
    (async () => {
      const webview = await getCurrentWebview();
      unlisten = await webview.onDragDropEvent((event: any) => {
        if (event.payload.type === 'drop') {
          const files = event.payload.paths as string[] | undefined;
          if (files && files.length > 0) {
            const file = files[0];
            // Accept all common audio and video file types supported by ffmpeg
            // Backend will validate actual support
            onFileSelect(file);
          }
        }
      });
    })();
    return () => {
      if (unlisten) unlisten();
    };
  }, [onFileSelect]);
  const handleFileSelect = async () => {
    try {
      let defaultPath: string | undefined
      try { defaultPath = await downloadDir() } catch {}

      const file = await open({
        multiple: false,
        directory: false,
        filters: [{
          name: 'Media Files (ffmpeg-supported)',
          extensions: [
            'wav', 'mp3', 'm4a', 'flac', 'ogg', 'aac', 'mp4', 'mov', 'mkv', 'webm', 'avi', 'wmv', 'mpeg', 'mpg', 'm4v', '3gp', 'aiff', 'opus', 'alac'
          ]
        }],
        defaultPath
      })
      onFileSelect(file as string | null)
    } catch (e) {
      console.error("Failed to open file dialog:", e)
    }
  }

  return (
    <Card className="p-3.5 shadow-none relative">
      {/* Compact drop zone — icon + text inline, no separate header */}
      <div
        className="flex items-center gap-3 border-2 border-dashed rounded-lg px-3 py-3 cursor-pointer transition-colors bg-muted/10 hover:bg-muted/60 hover:dark:bg-muted/20 outline-none"
        tabIndex={0}
        role="button"
        aria-label="Drop audio file here or click to select"
        onClick={handleFileSelect}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleFileSelect(); }}
      >
        <Upload className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">Letakkan file atau klik untuk memilih</p>
          <p className="text-xs text-muted-foreground/70">Audio atau video — sebagian besar format didukung</p>
        </div>
      </div>

      {selectedFile && (
        <div className="flex gap-2 mt-3 items-center w-full">
          <div 
            onClick={async () => {
              try {
                await revealItemInDir(selectedFile);
              } catch (err) {
                console.error("Failed to open directory:", err);
              }
            }}
            className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-lg cursor-pointer transition-colors group/file text-left flex-1 truncate"
            role="button"
            tabIndex={0}
            title="Buka Folder di Finder/File Explorer"
            onKeyDown={async (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                try {
                  await revealItemInDir(selectedFile);
                } catch (err) {
                  console.error("Failed to open directory:", err);
                }
              }
            }}
          >
            <FolderOpen className="h-4 w-4 text-muted-foreground group-hover/file:text-primary transition-colors shrink-0" />
            <span className="text-xs text-muted-foreground font-medium flex-1 truncate">
              {selectedFile.split('/').pop()?.split('\\').pop()}
            </span>
            <span className="text-[10px] text-muted-foreground/60 group-hover/file:text-primary font-medium shrink-0">
              Buka Folder
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg shrink-0"
            onClick={() => onFileSelect(null)}
            title="Hapus file"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </Card>
  )
}
