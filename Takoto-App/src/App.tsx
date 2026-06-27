// App.tsx
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Captions, Moon, Sun, LogOut } from "lucide-react"
import { useGlobal } from "@/contexts/GlobalContext";
import { useGoogleAuth } from "@/contexts/GoogleAuthContext";
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import React from "react"
import { TranscriptionSettings } from "@/components/transcription-settings"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import { MobileSubtitleViewer } from "@/components/mobile-subtitle-viewer"
import { DesktopSubtitleViewer } from "@/components/desktop-subtitle-viewer"
import { SetupWalkthrough } from "@/components/setup-walkthrough"
import { LoginScreen } from "@/components/login-screen"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { TooltipProvider } from "@/components/ui/tooltip"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="rounded-full"
    >
      <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 h-4 w-4" />
      <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 h-4 w-4" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

function EditorMenu() {
  const { editorProfile, logout } = useGoogleAuth()
  const [isOpen, setIsOpen] = React.useState(false)
  if (!editorProfile) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0">
          <Avatar className="h-7 w-7">
            <AvatarImage src={editorProfile.picture} />
            <AvatarFallback className="text-xs">{editorProfile.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs p-5 flex flex-col items-center text-center gap-4">
        <DialogHeader className="flex flex-col items-center gap-2">
          <Avatar className="h-16 w-16">
            <AvatarImage src={editorProfile.picture} />
            <AvatarFallback className="text-xl font-bold">{editorProfile.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <DialogTitle className="text-base font-semibold">{editorProfile.name}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground break-all max-w-[240px]">
              {editorProfile.email}
            </DialogDescription>
          </div>
        </DialogHeader>
        <Button 
          variant="outline" 
          onClick={() => {
            logout();
            setIsOpen(false);
          }} 
          className="w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900/50 flex items-center justify-center gap-2 mt-2"
        >
          <LogOut className="h-4 w-4" />
          Keluar dari Akun
        </Button>
      </DialogContent>
    </Dialog>
  )
}

function MainApp() {
  const [showMobileSubtitles, setShowMobileSubtitles] = React.useState(false)
  const [showWalkthrough, setShowWalkthrough] = React.useState(false)
  const { settings, updateSetting } = useGlobal()
  const isMobile = useIsMobile()

  React.useEffect(() => {
    if (!localStorage.getItem('takoto-setup-completed')) {
      setShowWalkthrough(true)
    }
  }, [])

  const handleWalkthroughClose = () => {
    setShowWalkthrough(false)
    localStorage.setItem('takoto-setup-completed', 'true')
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {isMobile && (
        <header className="absolute top-0 left-0 right-0 flex h-[53px] shrink-0 items-center justify-between border-b border-border frosted-glass px-4 py-2.5 z-20 min-w-0 shadow-apple-sm">
          <ThemeToggle />
          <div className="flex-1 flex justify-center px-2">
            <Tabs
              value={settings.isStandaloneMode ? "standalone" : "resolve"}
              onValueChange={(value) => updateSetting("isStandaloneMode", value === "standalone")}
              className="w-full max-w-[400px]"
            >
              <TabsList className="w-full rounded-full bg-secondary">
                <TabsTrigger value="resolve" className="flex-1 rounded-full text-sm">Timeline</TabsTrigger>
                <TabsTrigger value="standalone" className="flex-1 rounded-full text-sm">File</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setShowMobileSubtitles(true)}>
              <Captions className="h-5 w-5" />
            </Button>
            <EditorMenu />
          </div>
        </header>
      )}

      <div className="flex-1 min-h-0">
        {isMobile ? (
          <div className="h-full overflow-hidden pt-[53px]">
            <TranscriptionSettings />
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={55} className="min-w-[360px]">
              <div className="flex flex-col h-full relative">
                <header className="absolute top-0 left-0 right-0 flex h-[53px] shrink-0 items-center justify-between border-b border-border frosted-glass px-4 py-2.5 z-20 min-w-0 shadow-apple-sm">
                  <ThemeToggle />
                  <div className="flex-1 flex justify-center px-2">
                    <Tabs
                      value={settings.isStandaloneMode ? "standalone" : "resolve"}
                      onValueChange={(value) => updateSetting("isStandaloneMode", value === "standalone")}
                      className="w-full max-w-[400px]"
                    >
                      <TabsList className="w-full bg-secondary">
                        <TabsTrigger value="resolve" className="flex-1 text-sm">Timeline</TabsTrigger>
                        <TabsTrigger value="standalone" className="flex-1 text-sm">File</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <EditorMenu />
                </header>
                <div className="flex-1 min-h-0">
                  <TranscriptionSettings />
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={45} minSize={45}>
              <DesktopSubtitleViewer />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      {isMobile && (
        <MobileSubtitleViewer isOpen={showMobileSubtitles} onClose={() => setShowMobileSubtitles(false)} />
      )}
      <SetupWalkthrough isOpen={showWalkthrough} onClose={handleWalkthroughClose} />
    </div>
  );
}

function AppContent() {
  const { editorProfile, isLoading } = useGoogleAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!editorProfile) {
    return <LoginScreen />;
  }

  return <MainApp />;
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
