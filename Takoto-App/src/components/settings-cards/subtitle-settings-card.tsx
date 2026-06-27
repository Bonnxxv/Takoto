import * as React from "react"
import { Captions, Check, ChevronsUpDown, LayoutTemplate, MonitorPlay } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Template } from "@/types/interfaces"

interface SubtitleSettingsCardProps {
  selectedTemplate: Template
  onTemplateChange: (template: Template) => void
  outputTracks?: { label: string; value: string }[]
  templates?: { label: string; value: string }[]
  selectedOutputTrack?: string
  onOutputTrackChange?: (track: string) => void
  compact?: boolean
}

const defaultTemplates = [
  { value: "minimal", label: "Minimal" },
  { value: "modern", label: "Modern" },
  { value: "classic", label: "Classic" },
  { value: "bold", label: "Bold" },
  { value: "elegant", label: "Elegant" },
]

export const SubtitleSettingsCard = ({
  selectedTemplate,
  onTemplateChange,
  outputTracks = [],
  templates = defaultTemplates,
  selectedOutputTrack = "1",
  onOutputTrackChange = () => { },
  compact = false,
}: SubtitleSettingsCardProps) => {
  const [openTemplates, setOpenTemplates] = React.useState(false)

  const templatePopover = (triggerClassName: string) => (
    <Popover open={openTemplates} onOpenChange={setOpenTemplates}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-between font-normal", triggerClassName)}>
          {selectedTemplate?.label || "Pilih template..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="end">
        <Command>
          <CommandInput placeholder="Cari template..." />
          <CommandList>
            <CommandEmpty>Tidak ada template yang ditemukan.</CommandEmpty>
            <CommandGroup>
              {templates.map((template) => (
                <CommandItem key={template.value} value={template.value} onSelect={() => { onTemplateChange(template); setOpenTemplates(false) }}>
                  <Check className={cn("mr-2 h-4 w-4", selectedTemplate?.value === template.value ? "opacity-100" : "opacity-0")} />
                  {template.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )

  if (compact) {
    return (
      <div>
        <div className="bg-card flex items-center gap-3 px-3.5 py-3">
          <MonitorPlay className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm flex-1">Trek Keluaran</span>
          <Select value={selectedOutputTrack} onValueChange={onOutputTrackChange}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {outputTracks.length > 0 ? outputTracks.map((track) => (
                <SelectItem key={track.value} value={track.value}>{track.label}</SelectItem>
              )) : (
                <SelectItem value="1">Video Track 1</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="bg-card flex items-center gap-3 px-3.5 py-3 border-t border-border">
          <LayoutTemplate className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm flex-1">Template</span>
          {templatePopover("w-[140px] h-8 text-xs")}
        </div>
      </div>
    )
  }

  return (
    <Card className="p-4 shadow-none">
      <div className="space-y-3.5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
            <Captions className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Pengaturan Subtitle</p>
            <p className="text-xs text-muted-foreground">Konfigurasi trek, template, dan gaya</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Trek Keluaran</Label>
            <Select value={selectedOutputTrack} onValueChange={onOutputTrackChange}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {outputTracks.length > 0 ? outputTracks.map((track) => (
                  <SelectItem key={track.value} value={track.value}>{track.label}</SelectItem>
                )) : (
                  <SelectItem value="1">Video Track 1</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Template Dasar</Label>
            {templatePopover("w-[180px] h-9")}
          </div>
        </div>
      </div>
    </Card>
  )
}
