import * as React from "react"
import { Brain, Check, ChevronsUpDown, Download, HardDrive, MemoryStick, Trash2, AlertTriangle, Zap, Layers, Scale, Crosshair, Flame, Crown } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Model } from "@/types/interfaces"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

interface ModelSelectionCardProps {
  language: string
  selectedModel: number
  models: Model[]
  downloadingModel?: string | null
  downloadProgress?: number
  onModelChange: (model: number) => void
  onDeleteModel?: (modelValue: string) => void
  compact?: boolean
}

type ModelIconConfig = { icon: LucideIcon; color: string; bg: string }

const modelIconMap: Record<string, ModelIconConfig> = {
  tiny:            { icon: Zap,       color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  "tiny.en":       { icon: Zap,       color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  base:            { icon: Layers,    color: "text-blue-500",   bg: "bg-blue-100 dark:bg-blue-900/30" },
  "base.en":       { icon: Layers,    color: "text-blue-500",   bg: "bg-blue-100 dark:bg-blue-900/30" },
  small:           { icon: Scale,     color: "text-green-500",  bg: "bg-green-100 dark:bg-green-900/30" },
  "small.en":      { icon: Scale,     color: "text-green-500",  bg: "bg-green-100 dark:bg-green-900/30" },
  medium:          { icon: Crosshair, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
  "medium.en":     { icon: Crosshair, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },
  "large-v3-turbo":{ icon: Flame,     color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
  "large-v3":      { icon: Crown,     color: "text-amber-500",  bg: "bg-amber-100 dark:bg-amber-900/30" },
}

const ModelIcon = ({ value, size = "md" }: { value: string; size?: "sm" | "md" | "lg" }) => {
  const cfg = modelIconMap[value] ?? { icon: Brain, color: "text-muted-foreground", bg: "bg-muted" }
  const Icon = cfg.icon
  const boxSize = size === "sm" ? "p-1.5" : size === "lg" ? "p-3" : "p-2"
  const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5"
  return (
    <div className={`${boxSize} rounded-xl ${cfg.bg} flex items-center justify-center`}>
      <Icon className={`${iconSize} ${cfg.color}`} />
    </div>
  )
}

export const ModelSelectionCard = ({
  language,
  selectedModel,
  models,
  downloadingModel = null,
  downloadProgress = 0,
  onModelChange,
  onDeleteModel = () => { },
  compact = false,
}: ModelSelectionCardProps) => {
  const [openModelSelector, setOpenModelSelector] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('all')

  React.useEffect(() => {
    setActiveTab(language === 'en' ? 'en' : 'all')
  }, [language])

  const modelPopoverContent = (
    <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[300px] p-2" align="start">
      <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">Semua Bahasa</TabsTrigger>
          <TabsTrigger value="en">Hanya Bahasa Inggris</TabsTrigger>
        </TabsList>
        <ScrollArea className="h-[200px] mt-1">
          <div className="space-y-1 pr-0">
            {models.filter(model => activeTab === 'all' ? !model.value.includes('.en') : (model.value.includes('.en') || model.value === 'large-v3' || model.value === 'large-v3-turbo'))
              .map((model) => {
                const originalIndex = models.findIndex(m => m.value === model.value);
                return (
                  <div key={originalIndex} className={`flex items-center justify-between p-3 cursor-pointer rounded-lg transition-colors duration-200 ${selectedModel === originalIndex ? "bg-purple-50 dark:bg-purple-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
                    onClick={() => { onModelChange(originalIndex); setOpenModelSelector(false); }}>
                    <div className="flex items-center gap-3">
                      <ModelIcon value={model.value} size="md" />
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{model.label}</span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1"><HardDrive className="h-3 w-3" /><span>{model.size}</span></div>
                          <div className="flex items-center gap-1"><MemoryStick className="h-3 w-3" /><span>{model.ram}</span></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {downloadingModel === model.value ? (
                        <div className="flex items-center gap-2"><Progress value={downloadProgress} className="h-2 w-16" /><span className="text-xs text-blue-600">{downloadProgress}%</span></div>
                      ) : model.isDownloaded ? (
                        <span className="text-xs font-medium px-2 py-1 ml-6 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Tersimpan</span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-1 ml-6 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Tersedia</span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </ScrollArea>
      </Tabs>
    </PopoverContent>
  )

  const deleteDialog = (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Hapus Model">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:w-[70vw] w-[90vw] p-4 flex flex-col gap-6" onOpenAutoFocus={e => e.preventDefault()}>
        <DialogTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span className="font-semibold text-red-700 dark:text-red-400">Apakah Anda yakin?</span>
        </DialogTitle>
        <span className="text-sm text-muted-foreground">
          Ini akan menghapus <span className="font-bold">{models[selectedModel].label}</span> model dari perangkat Anda. Jika dibutuhkan lagi, perlu diunduh ulang.
        </span>
        <div className="flex justify-end gap-2">
          <DialogClose asChild><Button variant="ghost" size="sm">Batal</Button></DialogClose>
          <Button variant="destructive" size="sm" onClick={() => onDeleteModel(models[selectedModel].value)}>Hapus</Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  if (compact) {
    return (
      <div className="bg-card flex items-center gap-3 px-3.5 py-3">
        <Brain className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm flex-1">Model</span>
        {downloadingModel === models[selectedModel].value && (
          <div className="flex items-center gap-1.5">
            <Progress value={downloadProgress} className="h-1.5 w-12" />
            <span className="text-xs text-blue-600">{downloadProgress}%</span>
          </div>
        )}
        <Popover open={openModelSelector} onOpenChange={setOpenModelSelector}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" role="combobox" className="w-[140px] h-8 justify-between font-normal text-xs">
              <span className="truncate">{models[selectedModel].label}</span>
              <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          {modelPopoverContent}
        </Popover>
        {models[selectedModel].isDownloaded && !downloadingModel && deleteDialog}
      </div>
    )
  }

  return (
    <Card className="p-3.5 shadow-none relative dark:from-gray-900 dark:to-purple-950/20">
      <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Model Transkripsi AI</p>
              <p className="text-xs text-muted-foreground">Pilih model ucapan-ke-teks</p>
            </div>
          </div>
          {downloadingModel === models[selectedModel].value ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <Progress value={downloadProgress} className="h-2 w-16" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{downloadProgress}%</span>
            </div>
          ) : models[selectedModel].isDownloaded ? deleteDialog : null}
        </div>

        <Popover open={openModelSelector} onOpenChange={setOpenModelSelector}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={openModelSelector} className="w-full justify-between font-normal h-auto p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/20">
              <div className="flex items-center gap-4">
                <ModelIcon value={models[selectedModel].value} size="lg" />
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-base">{models[selectedModel].label}</span>
                    {models[selectedModel].isDownloaded ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                        <Check className="h-3 w-3 inline" /> Tersimpan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                        <Download className="h-3 w-3 inline" /> Tidak Tersimpan
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded"><HardDrive className="h-3 w-3" /><span className="font-medium">{models[selectedModel].size}</span></div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded"><MemoryStick className="h-3 w-3" /><span className="font-medium">{models[selectedModel].ram} RAM</span></div>
                  </div>
                </div>
              </div>
              <ChevronsUpDown className="mx-1 h-5 w-5 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          {modelPopoverContent}
        </Popover>

        <div className="mt-3 p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-lg border border-purple-100 dark:border-purple-900/30">
          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{models[selectedModel].details}</p>
        </div>
    </Card>
  )
}
