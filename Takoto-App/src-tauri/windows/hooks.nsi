; Dieksekusi setelah proses ekstrak file selesai
!macro tauri_app_hook_post_install
  ; 1. Hapus skrip V2 lama jika ada
  Delete "$APPDATA\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility\Takoto V2.lua"

  ; 2. Pastikan direktori utilitas DaVinci Resolve ada (penting untuk instalasi baru Resolve)
  CreateDirectory "$APPDATA\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility"

  ; 3. Salin berkas utama dan folder dari hasil instalasi ke direktori utilitas
  CopyFiles "$INSTDIR\resources\Takoto.lua" "$APPDATA\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility"
  CopyFiles "$INSTDIR\resources\Takoto" "$APPDATA\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility"

  ; 4. Pastikan folder Takoto berhasil disalin/dibuat sebelum menulis file teks
  CreateDirectory "$APPDATA\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility\Takoto"
  
  ; 5. Tulis direktori instalasi aplikasi ke dalam text file untuk referensi Lua
  FileOpen $0 "$APPDATA\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility\Takoto\install_path.txt" w
  FileWrite $0 $INSTDIR
  FileClose $0

  ; 6. Integrasi Plugin Workflow (Membutuhkan akses Administrator / Installer Per-Machine)
  CreateDirectory "$PROGRAMDATA\Blackmagic Design\DaVinci Resolve\Support\Workflow Integration Plugins"
  CopyFiles "$INSTDIR\resources\Takoto.lua" "$PROGRAMDATA\Blackmagic Design\DaVinci Resolve\Support\Workflow Integration Plugins"
!macroend

; Dieksekusi setelah proses uninstall aplikasi oleh pengguna
!macro tauri_app_hook_post_uninstall
  ; Hapus berkas Utility
  Delete "$APPDATA\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility\Takoto.lua"
  
  ; Hapus direktori Takoto beserta seluruh isinya (termasuk install_path.txt) secara rekursif
  RMDir /r "$APPDATA\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility\Takoto"

  ; Hapus integrasi Workflow
  Delete "$PROGRAMDATA\Blackmagic Design\DaVinci Resolve\Support\Workflow Integration Plugins\Takoto.lua"
!macroend