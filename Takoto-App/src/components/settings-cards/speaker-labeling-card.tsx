import { Speech, Info, ShieldAlert } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Card } from "@/components/ui/card"

interface SpeakerLabelingCardProps {
  diarize: boolean
  maxSpeakers: number | null
  onDiarizeChange: (checked: boolean) => void
  onMaxSpeakersChange: (value: number | null) => void
  compact?: boolean
}

export const SpeakerLabelingCard = ({
  diarize,
  maxSpeakers,
  onDiarizeChange,
  onMaxSpeakersChange,
  compact = false,
}: SpeakerLabelingCardProps) => {
  if (compact) {
    return (
      <div className="bg-card">
        <div className="flex items-center gap-3 px-3.5 py-3">
          <Speech className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm flex-1">Labeling Pembicara</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-pointer mr-1" />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="w-56 p-3">
              <p className="text-xs">Mengidentifikasi pembicara berbeda dan memberi label pada subtitle.</p>
            </TooltipContent>
          </Tooltip>
          <Switch checked={diarize} onCheckedChange={onDiarizeChange} />
        </div>
        {diarize && (
          <div className="px-3.5 py-3 border-t border-border space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground font-normal">Deteksi Otomatis</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ShieldAlert className="h-3 w-3 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="w-[220px] p-3">
                    <p className="text-xs">Disarankan menentukan jumlah pembicara untuk hasil lebih baik.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Switch checked={maxSpeakers === null} onCheckedChange={(checked) => onMaxSpeakersChange(checked ? null : 2)} />
            </div>
            {maxSpeakers !== null && (
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground font-normal">Max Speakers</Label>
                <Input type="number" min="1" value={maxSpeakers} onChange={(e) => onMaxSpeakersChange(Number(e.target.value))} className="w-16 h-7 text-xs" />
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="p-3.5 shadow-none relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Speech className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium">Labeling Pembicara</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" tabIndex={0} className="rounded-full hover:bg-muted focus:outline-none inline-flex items-center justify-center h-4 w-4 text-slate-700 dark:text-slate-300">
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start" className="w-56 p-3">
                    <p className="text-xs text-left">Mengidentifikasi pembicara berbeda berdasarkan pola suara dan memberi label pada subtitle.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-muted-foreground">Subtitle unik untuk setiap pembicara.</p>
            </div>
          </div>
          <Switch checked={diarize} onCheckedChange={onDiarizeChange} />
        </div>
        {diarize && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label className="text-sm font-normal">Deteksi Otomatis Pembicara</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" tabIndex={0} className="rounded-full focus:outline-none text-slate-700 dark:text-slate-300">
                      <ShieldAlert className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="center" className="w-[220px] p-3">
                    <p className="text-xs text-left">Disarankan untuk menentukan jumlah maksimum pembicara untuk mendapatkan hasil yang lebih baik.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Switch checked={maxSpeakers === null} onCheckedChange={(checked) => onMaxSpeakersChange(checked ? null : 2)} />
            </div>
            {maxSpeakers !== null && (
              <div className="flex items-center justify-between mt-2">
                <Label className="text-sm font-normal">Max Speakers</Label>
                <Input type="number" min="1" value={maxSpeakers} onChange={(e) => onMaxSpeakersChange(Number(e.target.value))} className="w-20" />
              </div>
            )}
          </div>
        )}
    </Card>
  )
}
