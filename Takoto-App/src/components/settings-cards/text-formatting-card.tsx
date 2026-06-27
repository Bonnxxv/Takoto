import { AArrowUp, Signature, ShieldX, WholeWord, CircleX, Settings, CircleFadingArrowUp, History, Type, CaseLower, CaseUpper, CaseSensitive } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const textCaseConfig: Record<string, { icon: LucideIcon; label: string }> = {
  none:      { icon: Type,          label: "Normal" },
  lowercase: { icon: CaseLower,     label: "Kecil" },
  uppercase: { icon: CaseUpper,     label: "Besar" },
  titlecase: { icon: CaseSensitive, label: "Judul" },
}
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card } from "@/components/ui/card"
 
import { useState } from "react";
import { useGlobal } from "@/contexts/GlobalContext";

interface TextFormattingCardProps {
  maxWordsPerLine: number
  maxCharsPerLine: number
  maxLinesPerSubtitle: number
  textCase: "none" | "uppercase" | "lowercase" | "titlecase"
  removePunctuation: boolean
  splitOnPunctuation: boolean
  enableCensor: boolean
  censoredWords: string[]
  onMaxWordsPerLineChange: (value: number) => void
  onMaxCharsPerLineChange: (value: number) => void
  onMaxLinesPerSubtitleChange: (value: number) => void
  onTextCaseChange: (textCase: "none" | "uppercase" | "lowercase" | "titlecase") => void
  onRemovePunctuationChange: (checked: boolean) => void
  onSplitOnPunctuationChange: (checked: boolean) => void
  onEnableCensorChange: (value: boolean) => void
  onCensoredWordsChange: (words: string[]) => void
  onResetSettings?: () => void
  isWalkthroughMode?: boolean
  compact?: boolean
}

export const TextFormattingCard = ({
  maxWordsPerLine,
  maxCharsPerLine,
  maxLinesPerSubtitle,
  textCase,
  removePunctuation,
  splitOnPunctuation,
  enableCensor,
  censoredWords,
  onMaxWordsPerLineChange,
  onMaxCharsPerLineChange,
  onMaxLinesPerSubtitleChange,
  onTextCaseChange,
  onRemovePunctuationChange,
  onSplitOnPunctuationChange,
  onEnableCensorChange,
  onCensoredWordsChange,
  onResetSettings,
  isWalkthroughMode = false,
  compact = false,
}: TextFormattingCardProps) => {
  const [newCensoredWord, setNewCensoredWord] = useState("");
  const { reformatSubtitles } = useGlobal();

  const lineSummary = [
    `${maxLinesPerSubtitle}L`,
    maxCharsPerLine > 0 ? `${maxCharsPerLine}c` : null,
    maxWordsPerLine > 0 ? `${maxWordsPerLine}w` : null,
    splitOnPunctuation ? 'split' : null,
  ].filter(Boolean).join(' • ')

  const formatPopover = (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 flex-shrink-0">
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[320px] p-5" onOpenAutoFocus={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Aturan Baris</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Batas Karakter</p>
              {maxCharsPerLine === 0 ? <p className="text-xs text-orange-500 flex items-center gap-1"><CircleX className="w-3 h-3" /> Nonaktif</p> : <p className="text-xs text-muted-foreground">Per baris (0 = tanpa batas)</p>}
            </div>
            <Input type="number" min="0" value={maxCharsPerLine} onChange={(e) => onMaxCharsPerLineChange(Number(e.target.value))} className="w-20" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Batas Kata</p>
              {maxWordsPerLine === 0 ? <p className="text-xs text-orange-500 flex items-center gap-1"><CircleX className="w-3 h-3" /> Nonaktif</p> : <p className="text-xs text-muted-foreground">Per baris (0 = tanpa batas)</p>}
            </div>
            <Input type="number" min="0" value={maxWordsPerLine} onChange={(e) => onMaxWordsPerLineChange(Number(e.target.value))} className="w-20" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Jumlah Baris</p>
              <p className="text-xs text-muted-foreground">Baris maksimal per subtitle</p>
            </div>
            <Input type="number" min="1" value={maxLinesPerSubtitle} onChange={(e) => onMaxLinesPerSubtitleChange(Number(e.target.value))} className="w-20" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Pisahkan pada Tanda Baca</p>
              <p className="text-xs text-muted-foreground">Pemisahan baris alami</p>
            </div>
            <Switch checked={splitOnPunctuation} onCheckedChange={onSplitOnPunctuationChange} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  if (compact) {
    return (
      <div>
        {/* Aturan Baris */}
        <div className="bg-card flex items-center gap-3 px-3.5 py-3">
          <WholeWord className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-sm">Aturan Baris</span>
            <span className="text-xs text-muted-foreground ml-2">{lineSummary}</span>
          </div>
          {formatPopover}
        </div>
        {/* Format Teks */}
        <div className="bg-card flex items-center gap-3 px-3.5 py-3 border-t border-border">
          <AArrowUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm flex-1">Format Teks</span>
          <Select value={textCase} onValueChange={(val) => onTextCaseChange(val as "none" | "uppercase" | "lowercase" | "titlecase")}>
            <SelectTrigger className="w-[100px] h-8 text-xs">
              {(() => { const cfg = textCaseConfig[textCase] ?? textCaseConfig.none; const Icon = cfg.icon; return <div className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" /><span>{cfg.label}</span></div> })()}
            </SelectTrigger>
            <SelectContent align="end">
              {Object.entries(textCaseConfig).map(([val, { icon: Icon, label }]) => (
                <SelectItem key={val} value={val}>
                  <div className="flex items-center gap-2"><Icon className="h-4 w-4" /><span>{label}</span></div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Hapus Tanda Baca */}
        <div className="bg-card flex items-center gap-3 px-3.5 py-3 border-t border-border">
          <Signature className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm flex-1">Hapus Tanda Baca</span>
          <Switch checked={removePunctuation} onCheckedChange={onRemovePunctuationChange} />
        </div>
        {/* Sensor */}
        <div className="bg-card border-t border-border">
          <div className="flex items-center gap-3 px-3.5 py-3">
            <ShieldX className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm flex-1">Sensor Kata Sensitif</span>
            <Switch checked={enableCensor} onCheckedChange={onEnableCensorChange} />
          </div>
          {enableCensor && (
            <div className="px-3.5 pb-3 space-y-2">
              <form className="flex gap-2" onSubmit={e => { e.preventDefault(); if (!newCensoredWord.trim() || censoredWords.includes(newCensoredWord.trim())) return; onCensoredWordsChange([...censoredWords, newCensoredWord.trim()]); setNewCensoredWord(""); }}>
                <Input value={newCensoredWord} onChange={e => setNewCensoredWord(e.target.value)} placeholder="Tambah kata" className="h-8 text-xs flex-1" />
                <Button type="submit" size="sm" disabled={!newCensoredWord.trim() || censoredWords.includes(newCensoredWord.trim())}>Tambah</Button>
              </form>
              <ScrollArea className="max-h-[100px]">
                {censoredWords.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">Belum ada kata.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {censoredWords.map((word, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center px-2 py-0.5 text-xs gap-1">
                        {word}
                        <button type="button" onClick={() => onCensoredWordsChange(censoredWords.filter((_, i) => i !== index))} className="hover:text-destructive">×</button>
                      </Badge>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
        {/* Buttons */}
        {!isWalkthroughMode && (
          <div className="flex gap-2 p-3 border-t border-border bg-card">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="secondary" size="sm" className="flex-1 text-xs">
                  <CircleFadingArrowUp className="w-3.5 h-3.5 mr-1.5" />
                  Perbarui Subtitle
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>Ini akan membuang semua pengeditan subtitle manual dan membuat ulang subtitle menggunakan opsi pemformatan baru.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={reformatSubtitles}>Perbarui Subtitle</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {onResetSettings && (
              <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={onResetSettings}>
                <History className="h-3.5 w-3.5 mr-1.5" />
                Reset
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Formatting Controls Popover */}
      <Card className="p-3.5 shadow-none relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                <WholeWord className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Aturan Baris Subtitle</p>
                <p className="text-xs text-muted-foreground">
                  {`${maxLinesPerSubtitle} line${maxLinesPerSubtitle !== 1 ? 's' : ''}`}
                  {maxWordsPerLine === 0 ? '' : ` • ${maxWordsPerLine} word${maxWordsPerLine !== 1 ? 's' : ''}`}
                  {maxCharsPerLine === 0 ? '' : ` • ${maxCharsPerLine} char${maxCharsPerLine !== 1 ? 's' : ''}`}
                  {splitOnPunctuation ? ' • split on punctuation' : ''}
                </p>
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="center">
                <div className="space-y-4">
                  {/* Max Chars */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Batas Karakter</p>
                      {maxCharsPerLine === 0 ? (
                        <p className="text-xs font-semibold text-orange-500 flex items-center gap-1">
                          <CircleX className="w-3 h-3 inline-block" /> Nonaktif (tanpa batas karakter)
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Per baris (0 = tanpa batas)</p>
                      )}
                    </div>
                    <Input
                      type="number"
                      min="0"
                      value={maxCharsPerLine}
                      onChange={(e) => onMaxCharsPerLineChange(Number(e.target.value))}
                      className="w-20"
                    />
                  </div>

                  {/* Max Words */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Batas Kata</p>
                      {maxWordsPerLine === 0 ? (
                        <p className="text-xs text-orange-500 flex items-center gap-1">
                          <CircleX className="w-3 h-3 inline-block" /> Nonaktif (tanpa batas kata)
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Per baris (0 = tanpa batas)</p>
                      )}
                    </div>
                    <Input
                      type="number"
                      min="0"
                      value={maxWordsPerLine}
                      onChange={(e) => onMaxWordsPerLineChange(Number(e.target.value))}
                      className="w-20"
                    />
                  </div>

                  {/* Jumlah Baris */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Jumlah Baris</p>
                      <p className="text-xs text-muted-foreground">Baris maksimal yang ditampilkan per subtitle</p>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      value={maxLinesPerSubtitle}
                      onChange={(e) => onMaxLinesPerSubtitleChange(Number(e.target.value))}
                      className="w-20"
                    />
                  </div>

                  {/* Pisahkan pada Tanda Baca */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Pisahkan pada Tanda Baca</p>
                      <p className="text-xs text-muted-foreground">Pemisahan baris alami pada tanda baca</p>
                    </div>
                    <Switch
                      checked={splitOnPunctuation}
                      onCheckedChange={onSplitOnPunctuationChange}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
      </Card>

      {/* Text Case */}
      <Card className="p-3.5 shadow-none relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                <AArrowUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Format Teks</p>
                <p className="text-xs text-muted-foreground">Ubah kasus subtitle</p>
              </div>
            </div>
            <div className="w-36">
              <Select
                value={textCase}
                onValueChange={(val) => onTextCaseChange(val as "none" | "uppercase" | "lowercase" | "titlecase")}
              >
                <SelectTrigger className="">
                  {(() => { const cfg = textCaseConfig[textCase] ?? textCaseConfig.none; const Icon = cfg.icon; return <div className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" /><span>{cfg.label}</span></div> })()}
                </SelectTrigger>
                <SelectContent align="end">
                  {Object.entries(textCaseConfig).map(([val, { icon: Icon, label }]) => (
                    <SelectItem key={val} value={val}>
                      <div className="flex items-center gap-2"><Icon className="h-4 w-4" /><span>{label}</span></div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
      </Card>

      {/* Remove Punctuation */}
      <Card className="flex items-center justify-between p-3.5 shadow-none relative">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
            <Signature className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-medium">Hapus Tanda Baca</p>
            <p className="text-xs text-muted-foreground">Menghapus semua koma, titik, dll.</p>
          </div>
        </div>
        <Switch
          checked={removePunctuation}
          onCheckedChange={onRemovePunctuationChange}
        />
      </Card>

      {/* Censored Words */}
      <Card className="p-3.5 shadow-none relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                <ShieldX className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Sensor Kata-kata Sensitif</p>
                <p className="text-xs text-muted-foreground">
                  Example: <span className="font-mono bg-muted px-1 rounded">kill</span> → <span className="font-mono bg-muted px-1 rounded">k*ll</span>
                </p>
              </div>
            </div>
            <Switch checked={enableCensor} onCheckedChange={onEnableCensorChange} />
          </div>
          {enableCensor && (
            <div className="mt-3 pt-2 border-t">
              <div className="flex flex-col gap-3">
                {/* Add new censored word input */}
                <form
                  className="flex gap-2 items-center mt-1"
                  onSubmit={e => {
                    e.preventDefault();
                    if (!newCensoredWord.trim() || censoredWords.includes(newCensoredWord.trim())) return;
                    onCensoredWordsChange([...censoredWords, newCensoredWord.trim()]);
                    setNewCensoredWord("");
                  }}
                >
                  <Input
                    value={newCensoredWord}
                    onChange={e => setNewCensoredWord(e.target.value)}
                    placeholder="Tambahkan kata untuk disensor"
                    className="w-full"
                  />
                  <Button
                    type="submit"
                    size="default"
                    disabled={!newCensoredWord.trim() || censoredWords.includes(newCensoredWord.trim())}
                  >
                    Tambahkan
                  </Button>
                </form>
                <ScrollArea className="max-h-[150px]">
                  {censoredWords.length === 0 ? (
                    <div className="text-xs text-muted-foreground p-4 text-center">
                      Tidak ada kata yang dipilih untuk disensor.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {censoredWords.map((word: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center px-2 py-1 text-xs font-normal gap-1"
                        >
                          <span>{word}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${word}`}
                            className="ml-1 focus:outline-none hover:text-destructive"
                            onClick={() => {
                              const newWords = censoredWords.filter((_, i) => i !== index);
                              onCensoredWordsChange(newWords);
                            }}
                          >
                            <span className="text-lg leading-none">×</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
      </Card>
      {isWalkthroughMode ? null : (
        <div className="space-y-2 mt-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="secondary"
                size="default"
                className="w-full"
              >
                <CircleFadingArrowUp className="w-5 h-5 mr-2" />
                Perbarui Subtitle
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ini akan membuang semua pengeditan subtitle manual dan membuat ulang subtitle menggunakan opsi pemformatan baru.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={reformatSubtitles}>Perbarui Subtitle</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {onResetSettings && (
            <Button variant="outline" className="w-full" onClick={onResetSettings}>
              <History className="h-4 w-4 mr-2" />
              Reset Pengaturan
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
