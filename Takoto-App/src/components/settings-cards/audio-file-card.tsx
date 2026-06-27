import * as React from "react"
import { FileUp, Upload, FolderOpen, X } from "lucide-react"
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
    const file = await open({
      multiple: false,
      directory: false,
      filters: [{
        name: 'Media Files (ffmpeg-supported)',
        extensions: [
          'wav', 'mp3', 'm4a', 'flac', 'ogg', 'aac', 'mp4', 'mov', 'mkv', 'webm', 'avi', 'wmv', 'mpeg', 'mpg', 'm4v', '3gp', 'aiff', 'opus', 'alac'
        ]
      }],
      defaultPath: await downloadDir()
    })
    onFileSelect(file)
  }

  return (
    <Card
      className="p-3.5 shadow-none relative"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
          <FileUp className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <p className="text-sm font-medium">Transkrip File</p>
          <p className="text-xs text-muted-foreground">Buat subtitle dari audio atau video apa pun</p>
        </div>
      </div>
      {/* Drag and Drop Area */}
      <div
        className="h-[120px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg py-5 px-2 mt-4 bg-muted/10 cursor-pointer transition-colors hover:bg-muted/60 hover:dark:bg-muted/20 outline-none"
        tabIndex={0}
        role="button"
        aria-label="Drop audio file here or click to select"
        onClick={handleFileSelect}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleFileSelect(); }}
      >
        <Upload className="h-7 w-7 mb-1 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Letakkan file di sini atau klik untuk memilih</span>
        <span className="text-xs text-muted-foreground mt-1">Mendukung sebagian besar format media</span>
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
