# Dokumentasi Teknis — Takoto

> Versi 3.0.8 | Tauri 2 + React + Rust

---

## Daftar Isi

1. [Gambaran Umum](#1-gambaran-umum)
2. [Fitur Aplikasi](#2-fitur-aplikasi)
3. [Arsitektur Teknis](#3-arsitektur-teknis)
4. [Struktur Proyek](#4-struktur-proyek)
5. [Prasyarat & Instalasi](#5-prasyarat--instalasi)
6. [Konfigurasi Environment](#6-konfigurasi-environment)
7. [Menjalankan Aplikasi (Development)](#7-menjalankan-aplikasi-development)
8. [Build Produksi](#8-build-produksi)
9. [Alur Kerja Transkripsi](#9-alur-kerja-transkripsi)
10. [Integrasi Google Drive](#10-integrasi-google-drive)
11. [Manajemen Model AI](#11-manajemen-model-ai)
12. [Sistem Autentikasi](#12-sistem-autentikasi)
13. [Struktur Data](#13-struktur-data)
14. [Komponen UI](#14-komponen-ui)
15. [Tauri Commands (Rust)](#15-tauri-commands-rust)
16. [Catatan Deployment ke Editor](#16-catatan-deployment-ke-editor)

---

## 1. Gambaran Umum

**Takoto** adalah aplikasi desktop transkripsi audio berbasis AI yang dibangun dengan Tauri 2 (Rust backend) dan React/TypeScript (frontend). Aplikasi ini memungkinkan pengguna mentranskripsi file audio secara lokal menggunakan model **Whisper** dari OpenAI yang dijalankan sepenuhnya di perangkat (offline/on-device), tanpa mengirim data ke server eksternal.

Aplikasi ini dirancang untuk kebutuhan tim produksi konten yang terdiri dari beberapa editor, dengan satu owner yang perlu memantau hasil transkripsi. Hasil transkripsi dapat diekspor ke file SRT/JSON atau langsung diunggah ke Google Drive milik owner secara otomatis.

### Konteks Penggunaan

| Peran | Jumlah | Akses |
|---|---|---|
| Editor | 4 orang | Transkripsi + upload ke Drive |
| Owner/Pemilik | 1 orang | Monitoring folder Drive |

---

## 2. Fitur Aplikasi

### 2.1 Transkripsi Audio

- Transkripsi audio lokal menggunakan **Whisper.rs** (binding Rust untuk Whisper)
- Dukungan 10 varian model: `tiny`, `tiny.en`, `base`, `base.en`, `small`, `small.en`, `medium`, `medium.en`, `large-v3-turbo`, `large-v3`
- Deteksi bahasa otomatis atau pemilihan bahasa manual
- Opsi terjemahan ke Bahasa Inggris
- Word-level timestamps via Dynamic Time Warping (DTW)
- Progress transkripsi real-time via event Tauri

### 2.2 Speaker Diarization

- Identifikasi siapa berbicara kapan menggunakan **Pyannote.rs**
- Batas jumlah pembicara dapat dikonfigurasi
- Labeling otomatis pembicara (Speaker 0, 1, 2, ...)
- Editor nama pembicara dengan visualisasi distribusi waktu bicara (chart)
- Warna dan gaya teks per pembicara untuk ekspor DaVinci Resolve

### 2.3 Editor Subtitle

- Tampilan daftar subtitle yang dapat diedit secara inline
- Format teks: `UPPERCASE`, `lowercase`, `Title Case`, `none`
- Hapus tanda baca
- Sensor kata (kata yang diblacklist otomatis disensor)
- Batas karakter per baris dan kata per baris
- Batas jumlah baris per subtitle
- Split otomatis pada tanda baca

### 2.4 Mode Operasi

**Standalone Mode:**
- Input file audio langsung (MP3, WAV, dll via FFmpeg)
- Output berupa file SRT/JSON yang diunduh ke lokal

**DaVinci Resolve Mode:**
- Integrasi dengan DaVinci Resolve melalui Lua API
- Ambil audio langsung dari timeline Resolve
- Push subtitle hasil transkripsi langsung ke timeline Resolve

### 2.5 Import / Ekspor

| Format | Import | Ekspor |
|---|---|---|
| `.srt` | ✓ | ✓ |
| `.json` (Transcript) | ✓ | ✓ |
| Google Drive (SRT + TXT) | — | ✓ |

### 2.6 Bagikan ke Google Drive

- Login dengan akun Google personal editor (OAuth 2.0 PKCE)
- Upload otomatis file `.srt` dan `.txt` ke folder Drive milik owner
- Struktur folder otomatis: `transkripsi_{email_slug}/YYYY-MM/DD/`
- Token refresh otomatis jika token expired (setelah 1 jam)
- Progress upload ditampilkan real-time

### 2.7 UI/UX

- Tema terang/gelap (sistem-adaptive)
- Responsif: layout desktop (split panel) dan mobile
- Setup walkthrough untuk pengguna baru
- Toast notification untuk feedback aksi
- Avatar + dropdown menu untuk info dan logout akun

---

## 3. Arsitektur Teknis

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND (React)                   │
│  TypeScript + Vite + Tailwind CSS + shadcn/ui         │
│                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │GlobalContext│  │GoogleAuth    │  │  Components │  │
│  │ (app state) │  │Context       │  │  (UI layer) │  │
│  └─────────────┘  └──────────────┘  └─────────────┘  │
└────────────────────────┬─────────────────────────────┘
                         │ Tauri IPC (invoke / events)
┌────────────────────────▼─────────────────────────────┐
│                   BACKEND (Rust)                      │
│  Tauri 2 + Tokio async runtime                        │
│                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ transcribe  │  │   oauth.rs   │  │   audio.rs  │  │
│  │    .rs      │  │  (TCP OAuth  │  │ (FFmpeg/WAV │  │
│  │(Whisper.rs  │  │   callback)  │  │  conversion)│  │
│  │Pyannote.rs) │  └──────────────┘  └─────────────┘  │
│  └─────────────┘                                      │
│  ┌─────────────┐  ┌──────────────┐                    │
│  │ transcript  │  │  models.rs   │                    │
│  │    .rs      │  │(HuggingFace  │                    │
│  │(JSON store) │  │  download)   │                    │
│  └─────────────┘  └──────────────┘                    │
└──────────────────────────────────────────────────────┘
          │                    │
  ┌───────▼──────┐    ┌────────▼────────┐
  │  Whisper.rs  │    │  Google APIs    │
  │  (on-device  │    │  - OAuth2       │
  │   AI model)  │    │  - Drive v3     │
  └──────────────┘    └─────────────────┘
```

### Stack Teknologi

| Layer | Teknologi |
|---|---|
| Framework Desktop | Tauri 2 |
| Frontend | React 18, TypeScript, Vite |
| UI Library | shadcn/ui (Radix UI + Tailwind CSS) |
| Backend | Rust (Tokio async) |
| AI Transkripsi | whisper-rs 0.15 (binding OpenAI Whisper) |
| AI Diarisasi | pyannote-rs (custom fork) |
| Audio Processing | FFmpeg (binary bundled), Hound (WAV) |
| Model Download | HuggingFace Hub (hf-hub) |
| HTTP Client | reqwest 0.11 |
| Persistence | tauri-plugin-store (JSON file) |
| Notifikasi | Sonner (toast) |

---

## 4. Struktur Proyek

```
Takoto-App/
├── src/                          # Frontend React/TypeScript
│   ├── App.tsx                   # Root component (auth gate + layout)
│   ├── main.tsx                  # Entry point, provider wrapping
│   ├── api/
│   │   └── resolveAPI.ts         # DaVinci Resolve Lua API bridge
│   ├── components/
│   │   ├── login-screen.tsx      # Halaman login Google
│   │   ├── import-export-popover.tsx  # Popover Import/Ekspor/Bagikan
│   │   ├── transcription-settings.tsx # Panel pengaturan transkripsi
│   │   ├── desktop-subtitle-viewer.tsx # Panel subtitle (desktop)
│   │   ├── mobile-subtitle-viewer.tsx  # Panel subtitle (mobile)
│   │   ├── speaker-editor.tsx    # Editor speaker + chart
│   │   ├── subtitle-list.tsx     # Daftar subtitle yang dapat diedit
│   │   ├── setup-walkthrough.tsx # Onboarding carousel
│   │   ├── settings-cards/       # Kartu pengaturan individual
│   │   └── ui/                   # Komponen shadcn/ui
│   ├── contexts/
│   │   ├── GlobalContext.tsx     # State global aplikasi
│   │   └── GoogleAuthContext.tsx # State autentikasi Google
│   ├── lib/
│   │   ├── models.ts             # Definisi model Whisper
│   │   └── utils.ts              # Utilitas Tailwind (cn)
│   ├── types/
│   │   └── interfaces.ts         # TypeScript interfaces
│   └── utils/
│       ├── googleAuthUtils.ts    # OAuth PKCE flow
│       ├── googleDriveUtils.ts   # Drive API (upload, folder)
│       ├── srtUtils.ts           # Generate & parse SRT
│       ├── subtitleFormatter.ts  # Format & split subtitle
│       └── fileUtils.ts          # Manajemen file transcript
│
├── src-tauri/                    # Backend Rust
│   ├── src/
│   │   ├── main.rs               # Entry point, command registration
│   │   ├── lib.rs                # Library root
│   │   ├── transcribe.rs         # Whisper + Pyannote pipeline
│   │   ├── audio.rs              # Audio conversion (FFmpeg)
│   │   ├── models.rs             # Download & manajemen model
│   │   ├── transcript.rs         # Struktur data transcript
│   │   ├── oauth.rs              # OAuth TCP server + token exchange
│   │   ├── config.rs             # Konfigurasi transkrip/diarize
│   │   └── logging.rs            # Logging (tracing)
│   ├── capabilities/
│   │   └── default.json          # Tauri permission/capability config
│   ├── Cargo.toml                # Rust dependencies
│   └── tauri.conf.json           # Konfigurasi aplikasi Tauri
│
├── .env                          # Kredensial (gitignored)
├── .env.example                  # Template environment variables
└── package.json                  # Node dependencies & scripts
```

---

## 5. Prasyarat & Instalasi

### 5.1 Prasyarat Sistem

| Komponen | Versi / Syarat |
|---|---|
| macOS | 13.0 (Ventura) atau lebih baru |
| Rust | 1.80+ (via `rustup`) |
| Node.js | 18+ |
| npm | 9+ |
| Tauri CLI | 2.x |
| Xcode Command Line Tools | (macOS) |

### 5.2 Instalasi Dependencies

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Node dependencies
npm install

# Install Tauri CLI (jika belum)
npm install -g @tauri-apps/cli
```

### 5.3 FFmpeg

FFmpeg sudah di-bundle dalam direktori `src-tauri/binaries/`. Pastikan binary tersedia:
- `binaries/ffmpeg-aarch64-apple-darwin` (macOS Apple Silicon)
- `binaries/ffmpeg-x86_64-apple-darwin` (macOS Intel)
- `binaries/ffmpeg-x86_64-pc-windows-msvc.exe` (Windows)

---

## 6. Konfigurasi Environment

Buat file `.env` di root proyek (jangan di-commit ke git):

```env
# Google OAuth 2.0 — untuk login editor
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret

# ID folder Google Drive milik owner
# Ambil dari URL folder: https://drive.google.com/drive/folders/{FOLDER_ID}
VITE_GOOGLE_DRIVE_FOLDER_ID=your_folder_id
```

### 6.1 Setup Google Cloud Console

1. Buka [console.cloud.google.com](https://console.cloud.google.com)
2. Buat atau pilih project yang ada
3. Aktifkan **Google Drive API**: APIs & Services → Library → cari "Google Drive API" → Enable
4. Buat OAuth Client: APIs & Services → Credentials → Create Credentials → OAuth Client ID
   - Application type: **Desktop app**
   - Salin `Client ID` dan `Client Secret` ke `.env`
5. Konfigurasi OAuth consent screen:
   - Scopes: `openid`, `email`, `profile`, `https://www.googleapis.com/auth/drive`
   - Status: **Testing** (tidak perlu publikasi untuk penggunaan internal)
6. Tambahkan email setiap editor sebagai **Test User**: APIs & Services → OAuth consent screen → Audience → Test users

### 6.2 Setup Google Drive

1. Owner membuat folder utama di Google Drive-nya
2. Owner men-share folder tersebut ke setiap email editor dengan role **"Editor"**
3. Salin ID folder dari URL ke `VITE_GOOGLE_DRIVE_FOLDER_ID`

---

## 7. Menjalankan Aplikasi (Development)

```bash
npm run tauri dev
```

Perintah ini akan:
1. Menjalankan Vite dev server di `http://localhost:1420`
2. Kompilasi Rust backend
3. Membuka window aplikasi Tauri

---

## 8. Build Produksi

### macOS Apple Silicon (M1/M2/M3)
```bash
npm run build:mac:arm64
```

### macOS Intel
```bash
npm run build:mac:x86_64
```

### Windows
```bash
npm run build:win
```

### Linux
```bash
npm run build:linux
```

Output build tersedia di `src-tauri/target/release/bundle/`.

> **Catatan:** Credentials `.env` di-embed ke binary pada saat build via Vite (`import.meta.env`). Pastikan `.env` sudah berisi nilai yang benar sebelum build.

---

## 9. Alur Kerja Transkripsi

```
Input Audio (file / Resolve timeline)
        │
        ▼
  [audio.rs] Konversi ke WAV 16kHz mono (via FFmpeg)
        │
        ▼
  [transcribe.rs] Whisper inference
  - Load model dari disk
  - Full params (bahasa, mode, DTW)
  - Progress event ke frontend
        │
        ├──── Diarisasi diaktifkan? ────────────────────┐
        │                                               │
        │ Tidak                               Ya        │
        │                              [transcribe.rs]  │
        ▼                              Pyannote diarize │
  Transcript tanpa                     - ONNX model    │
  speaker label                        - Output: siapa │
        │                              bicara kapan    │
        │                                    │         │
        │                              Merge Whisper + │
        │                              Pyannote segments
        │                                    │         │
        └────────────────────────────────────┘         │
                         │                             │
                         ▼                             │
              [transcript.rs] Simpan ke JSON           │
              di Application Data folder               │
                         │
                         ▼
              [GlobalContext] Proses subtitle:
              - Split & format (subtitleFormatter.ts)
              - Tampilkan di UI
                         │
               ┌─────────┴──────────┐
               ▼                    ▼
          Export SRT/JSON     Push ke Resolve
          atau Upload Drive   timeline
```

### 9.1 Lokasi Penyimpanan Transcript

Transcript disimpan sebagai file JSON di:
- macOS: `~/Library/Application Support/com.takoto/transcripts/`
- Windows: `%APPDATA%\com.takoto\transcripts\`

---

## 10. Integrasi Google Drive

### 10.1 Alur Login (OAuth 2.0 PKCE)

```
Frontend                    Rust Backend             Google
    │                           │                      │
    │─── invoke oauth_start ───▶│                      │
    │                           │── Bind TCP port 0 ──▶│
    │◀── return port ───────────│                      │
    │                           │                      │
    │── openUrl (browser) ─────────────────────────────▶
    │                           │         [Editor login di browser]
    │                           │◀── GET /callback?code=... ──────
    │                           │── Send 200 HTML ────────────────▶
    │                           │── emit "oauth-callback" ─▶│      
    │◀── event "oauth-callback"─│                      │
    │                           │                      │
    │── fetch /token ──────────────────────────────────▶
    │◀── access_token + refresh_token ─────────────────│
    │                           │                      │
    │── fetch /userinfo ───────────────────────────────▶
    │◀── email, name, picture ─────────────────────────│
    │                           │                      │
    │── store ke takoto-store.json                     │
```

### 10.2 Alur Upload ke Drive

```
handleShareToDrive()
        │
        ▼
getValidToken(editorProfile)
  - Token masih valid? → pakai langsung
  - Token expired? → refresh via /token endpoint
        │
        ▼
findOrCreateFolder("transkripsi_{slug}", mainFolderId)
        │
        ▼
findOrCreateFolder("YYYY-MM", editorFolderId)
        │
        ▼
findOrCreateFolder("DD", monthFolderId)
        │
        ├── uploadFile("{filename}.srt", dayFolderId)
        └── uploadFile("{filename}.txt", dayFolderId)
```

### 10.3 Struktur Folder di Google Drive

```
[Folder Utama Owner]
└── transkripsi_19221559/          ← berdasarkan email prefix
    └── 2026-06/                   ← bulan transkripsi
        └── 24/                    ← tanggal transkripsi
            ├── interview_2026-06-24.srt
            └── interview_2026-06-24.txt
```

### 10.4 Scopes OAuth yang Diminta

| Scope | Kegunaan |
|---|---|
| `openid` | Identifikasi pengguna |
| `email` | Mendapatkan alamat email editor |
| `profile` | Nama dan foto profil |
| `https://www.googleapis.com/auth/drive` | Buat folder & upload file ke Drive |

---

## 11. Manajemen Model AI

### 11.1 Daftar Model

| Model | Ukuran | RAM | Kecepatan | Akurasi |
|---|---|---|---|---|
| tiny | 80 MB | 1 GB | ★★★★★ | ★ |
| tiny.en | 80 MB | 1 GB | ★★★★★ | ★★ |
| base | 150 MB | 1 GB | ★★★★ | ★★ |
| base.en | 150 MB | 1 GB | ★★★★ | ★★★ |
| small | 480 MB | 2 GB | ★★★ | ★★★ |
| small.en | 480 MB | 2 GB | ★★★ | ★★★ |
| medium | 1.5 GB | 5 GB | ★★ | ★★★★ |
| medium.en | 1.5 GB | 5 GB | ★★ | ★★★★ |
| large-v3-turbo | 1.6 GB | 6 GB | ★★★ | ★★★★★ |
| large-v3 | 3.1 GB | 10 GB | ★ | ★★★★★ |

### 11.2 Download Model

Model diunduh dari **HuggingFace Hub** (`hf-hub`) saat pertama kali digunakan. Disimpan di:
- macOS: `~/Library/Application Support/com.takoto/models/`

### 11.3 Akselerasi Hardware

| Platform | Akselerasi |
|---|---|
| macOS (Apple Silicon) | CoreML + Metal |
| macOS (Intel) | Metal |
| Windows | Vulkan + DirectML |
| Linux | Vulkan |

---

## 12. Sistem Autentikasi

### 12.1 Penyimpanan Profil

Profil editor disimpan di `takoto-store.json` via `tauri-plugin-store`:
```json
{
  "editor-profile": {
    "email": "editor@gmail.com",
    "name": "Nama Editor",
    "picture": "https://...",
    "sub": "google_user_id",
    "accessToken": "ya29...",
    "refreshToken": "1//0...",
    "tokenExpiry": 1750000000
  }
}
```

Lokasi file:
- macOS: `~/Library/Application Support/com.takoto/takoto-store.json`

### 12.2 Logout

Klik **avatar foto profil** di pojok kanan atas header → **Keluar**.

Atau manual:
```bash
rm ~/Library/Application\ Support/com.takoto/takoto-store.json
```

### 12.3 Token Refresh

`access_token` Google berlaku selama 1 jam. Saat editor mencoba upload setelah 1 jam:
1. `getValidToken()` mendeteksi `tokenExpiry < now + 60s`
2. Kirim request refresh ke `https://oauth2.googleapis.com/token`
3. Token baru disimpan ke store via `updateProfile()`
4. Upload dilanjutkan dengan token baru

---

## 13. Struktur Data

### 13.1 EditorProfile

```typescript
interface EditorProfile {
    email: string;
    name: string;
    picture: string;
    sub: string;           // Google User ID
    accessToken: string;
    refreshToken?: string;
    tokenExpiry: number;   // Unix timestamp (detik)
}
```

### 13.2 Subtitle

```typescript
interface Subtitle {
    id: number;
    start: number;    // detik
    end: number;      // detik
    text: string;
    words: Word[];
    speaker_id?: string;
}

interface Word {
    word: string;
    start: number;
    end: number;
    line_number: number;
    probability?: number;
}
```

### 13.3 Speaker

```typescript
interface Speaker {
    name: string;
    fill: ColorModifier;
    outline: ColorModifier;
    border: ColorModifier;
    sample: { start: number; end: number };
    track?: string;   // DaVinci Resolve output track
}
```

### 13.4 Settings

```typescript
interface Settings {
    isStandaloneMode: boolean;
    model: number;              // index ke array models
    language: string;           // "auto", "id", "en", dll
    translate: boolean;
    enableDiarize: boolean;
    maxSpeakers: number | null;
    enableDTW: boolean;
    enableGpu: boolean;
    maxWordsPerLine: number;
    maxCharsPerLine: number;
    maxLinesPerSubtitle: number;
    splitOnPunctuation: boolean;
    textCase: "none" | "uppercase" | "lowercase" | "titlecase";
    removePunctuation: boolean;
    enableCensor: boolean;
    censoredWords: string[];
    selectedInputTracks: string[];
    selectedOutputTrack: string;
    selectedTemplate: Template;
    animationType: "none" | "pop-in" | "fade-in" | "slide-in" | "typewriter";
    highlightType: "none" | "outline" | "fill" | "bubble";
    highlightColor: string;
}
```

---

## 14. Komponen UI

### 14.1 Hierarki Komponen

```
main.tsx
└── GoogleAuthProvider
    └── GlobalProvider
        └── App (ThemeProvider + TooltipProvider)
            └── AppContent
                ├── [Loading spinner]
                ├── LoginScreen          ← jika belum login
                └── MainApp             ← jika sudah login
                    ├── Header
                    │   ├── ThemeToggle
                    │   ├── Mode tabs (Resolve / Standalone)
                    │   └── EditorMenu (avatar + dropdown logout)
                    ├── TranscriptionSettings (panel kiri)
                    │   ├── ModelSelectionCard
                    │   ├── LanguageSettingsCard
                    │   ├── AudioFileCard / AudioInputCard
                    │   ├── SpeakerLabelingCard
                    │   ├── SubtitleSettingsCard
                    │   ├── TextFormattingCard
                    │   ├── WordTimestampsCard
                    │   └── ImportExportPopover
                    │       ├── Tab Impor
                    │       ├── Tab Ekspor
                    │       └── Tab Bagikan (Drive)
                    └── DesktopSubtitleViewer (panel kanan)
                        ├── SubtitleList
                        └── SpeakerEditor
```

### 14.2 Deskripsi Komponen Kunci

| Komponen | Deskripsi |
|---|---|
| `LoginScreen` | Halaman login dengan tombol "Masuk dengan Google" |
| `EditorMenu` | Avatar dropdown: nama, email, tombol keluar |
| `TranscriptionSettings` | Panel kiri berisi semua kontrol transkripsi |
| `ImportExportPopover` | Popover 3 tab: impor SRT, ekspor SRT/JSON, bagikan ke Drive |
| `SpeakerEditor` | Edit nama speaker, lihat distribusi waktu bicara |
| `SubtitleList` | Daftar subtitle yang bisa diedit inline |
| `SetupWalkthrough` | Carousel onboarding untuk pengguna baru |

---

## 15. Tauri Commands (Rust)

### 15.1 Transkripsi

| Command | Deskripsi |
|---|---|
| `transcribe_audio` | Mulai transkripsi audio dengan opsi tertentu |
| `cancel_transcription` | Batalkan transkripsi yang sedang berjalan |

### 15.2 Model

| Command | Deskripsi |
|---|---|
| `download_model` | Unduh model Whisper dari HuggingFace |
| `check_downloaded_models` | Cek model mana saja yang sudah diunduh |
| `delete_model` | Hapus model dari disk |

### 15.3 Audio

| Command | Deskripsi |
|---|---|
| `prepare_audio` | Konversi audio ke WAV 16kHz via FFmpeg |

### 15.4 OAuth & Token

| Command | Deskripsi |
|---|---|
| `oauth_start_server` | Buka TCP server untuk callback OAuth, return port |

### 15.5 Logging

| Command | Deskripsi |
|---|---|
| `get_log_path` | Lokasi file log aplikasi |
| `copy_backend_logs` | Salin log backend ke clipboard |

---

## 16. Catatan Deployment ke Editor

### Langkah per Editor

1. **Build aplikasi** dengan `.env` yang sudah berisi kredensial:
   ```bash
   npm run build:mac:arm64
   ```

2. **Install** aplikasi dari `src-tauri/target/release/bundle/dmg/` ke laptop editor

3. **Buka Google Cloud Console** → OAuth consent screen → Test users → Tambahkan email editor

4. **Owner men-share** folder Google Drive ke email editor (role: Editor)

5. **Editor login** pertama kali: buka app → "Masuk dengan Google" → akan ada consent screen dengan warning "app belum diverifikasi" → klik "Advanced" → "Go to Takoto-App" → allow akses Drive

6. Setelah login, tab **Bagikan** di Impor/Ekspor sudah siap digunakan

### Catatan Penting

- Maksimal **100 test user** dalam mode testing Google OAuth (cukup untuk 4 editor)
- `access_token` berlaku 1 jam, refresh otomatis saat upload
- `refresh_token` tersimpan lokal di `takoto-store.json` — tidak perlu login ulang kecuali logout manual
- Semua pemrosesan AI berjalan **lokal** di laptop editor, tidak ada data audio yang dikirim ke internet
- Model Whisper perlu diunduh sekali saat pertama pakai (~80MB - 3.1GB tergantung model)
