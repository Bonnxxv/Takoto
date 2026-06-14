import { AArrowUp, Signature, ShieldX, WholeWord, CircleX, Settings, CircleFadingArrowUp } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  onEnableCensorChange: (checked: boolean) => void
  onCensoredWordsChange: (words: string[]) => void
  isWalkthroughMode: boolean
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
  isWalkthroughMode
}: TextFormattingCardProps) => {
  const [newCensoredWord, setNewCensoredWord] = useState("");
  const { reformatSubtitles } = useGlobal();
  return (
    <div className="space-y-3">
      {/* Formatting Controls Popover */}
      <div className="border rounded-lg overflow-hidden">
        <div className="p-3.5">
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

        </div>
      </div>

      {/* Text Case */}
      <div className="border rounded-lg overflow-hidden">
        <div className="p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                <AArrowUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium">Kasus Teks</p>
                <p className="text-xs text-muted-foreground">Ubah kasus subtitle</p>
              </div>
            </div>
            <div className="w-36">
              <Select
                value={textCase}
                onValueChange={(val) => onTextCaseChange(val as "none" | "uppercase" | "lowercase" | "titlecase")}
              >
                <SelectTrigger className="">
                  <SelectValue placeholder="Pilih kasus teks" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="none">Normal</SelectItem>
                  <SelectItem value="lowercase">huruf kecil</SelectItem>
                  <SelectItem value="uppercase">HURUF BESAR</SelectItem>
                  <SelectItem value="titlecase">Kasus Judul</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Punctuation */}
      <div className="flex items-center justify-between p-3.5 border rounded-lg">
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
      </div>

      {/* Censored Words */}
      <div className="border rounded-lg overflow-hidden">
        <div className="p-3.5">
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
        </div>
      </div>
      {isWalkthroughMode ? null : (
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
      )}
    </div>
  )
}
