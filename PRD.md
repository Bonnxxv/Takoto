# Product Requirements Document (PRD)
# Takoto — Aplikasi Transkripsi Audio Desktop

| | |
|---|---|
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 24 Juni 2026 |
| **Status** | Final (v3.0.8) |
| **Penulis** | Tim Pengembang Takoto |

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Permasalahan](#2-latar-belakang--permasalahan)
3. [Tujuan Produk](#3-tujuan-produk)
4. [Pengguna & Persona](#4-pengguna--persona)
5. [Ruang Lingkup](#5-ruang-lingkup)
6. [Persyaratan Fungsional](#6-persyaratan-fungsional)
7. [Persyaratan Non-Fungsional](#7-persyaratan-non-fungsional)
8. [Arsitektur Sistem](#8-arsitektur-sistem)
9. [Alur Pengguna](#9-alur-pengguna)
10. [Antarmuka Pengguna](#10-antarmuka-pengguna)
11. [Integrasi Eksternal](#11-integrasi-eksternal)
12. [Batasan & Asumsi](#12-batasan--asumsi)
13. [Risiko & Mitigasi](#13-risiko--mitigasi)
14. [Kriteria Keberhasilan](#14-kriteria-keberhasilan)
15. [Glosarium](#15-glosarium)

---

## 1. Ringkasan Eksekutif

**Takoto** adalah aplikasi desktop transkripsi audio berbasis kecerdasan buatan (AI) yang memungkinkan tim produksi konten mentranskripsi audio secara otomatis, cepat, dan akurat — sepenuhnya secara offline tanpa mengirimkan data ke server eksternal. Aplikasi ini dirancang untuk digunakan oleh tim kecil yang terdiri dari beberapa editor dengan satu owner yang perlu memantau hasil transkripsi secara terpusat melalui Google Drive.

Aplikasi menggunakan model **Whisper** (OpenAI) yang dijalankan secara lokal, dikombinasikan dengan teknologi **speaker diarization** untuk mengidentifikasi dan membedakan pembicara yang berbeda dalam satu rekaman audio.

---

## 2. Latar Belakang & Permasalahan

### 2.1 Konteks

Proses transkripsi audio secara manual membutuhkan waktu yang sangat lama — rata-rata 4–6 jam kerja untuk setiap 1 jam rekaman. Tim produksi konten yang menangani banyak rekaman setiap minggu mengalami hambatan signifikan di tahap ini.

Solusi transkripsi berbasis cloud yang ada di pasaran (misalnya Otter.ai, Sonix, Rev) memiliki beberapa masalah:

| Masalah | Dampak |
|---|---|
| Data audio dikirim ke server pihak ketiga | Risiko privasi dan kerahasiaan konten |
| Biaya berlangganan bulanan per pengguna | Beban biaya operasional |
| Kualitas bahasa Indonesia masih rendah | Akurasi transkripsi tidak memuaskan |
| Tidak terintegrasi dengan DaVinci Resolve | Butuh copy-paste manual ke software editing |

### 2.2 Permasalahan Utama

1. **Efisiensi**: Transkripsi manual memakan waktu yang tidak efisien untuk tim yang mengelola banyak konten
2. **Privasi**: Konten sensitif (wawancara eksklusif, rapat internal) tidak boleh diunggah ke server pihak ketiga
3. **Koordinasi Tim**: Owner tidak memiliki visibilitas terpusat atas hasil kerja 4 editor yang bekerja di lokasi berbeda
4. **Integrasi Workflow**: Hasil transkripsi tidak langsung terhubung dengan tools editing video (DaVinci Resolve)

---

## 3. Tujuan Produk

### 3.1 Tujuan Utama

1. Membangun aplikasi desktop yang dapat mentranskripsi audio secara otomatis dengan akurasi tinggi
2. Memproses seluruh data secara lokal tanpa mengirim data ke server eksternal
3. Memberikan mekanisme monitoring terpusat bagi owner melalui Google Drive
4. Mengintegrasikan hasil transkripsi langsung ke DaVinci Resolve

### 3.2 Tujuan Sekunder

1. Mendukung identifikasi pembicara (diarization) untuk rekaman multi-speaker
2. Menyediakan tools editing subtitle yang fleksibel
3. Mendukung berbagai model AI dengan tradeoff kecepatan vs akurasi

### 3.3 Tidak Termasuk dalam Scope

- Transkripsi video (hanya audio)
- Transkripsi real-time/live
- Layanan backend/cloud milik Takoto
- Aplikasi mobile native
- Kolaborasi multi-pengguna secara bersamaan di satu file

---

## 4. Pengguna & Persona

### 4.1 Persona 1 — Editor

**Profil:**
- Anggota tim produksi konten
- Usia 20–35 tahun
- Terbiasa menggunakan software editing (DaVinci Resolve, Adobe Premiere)
- Menggunakan laptop macOS/Windows sehari-hari

**Kebutuhan:**
- Transkripsi audio hasil wawancara atau rekaman podcast dengan cepat
- Tidak ingin repot dengan konfigurasi teknis
- Hasil transkripsi langsung bisa dipakai di software editing
- Login sekali, tidak perlu setup ulang setiap hari

**Frustrasi Saat Ini:**
- Transkripsi manual memakan waktu 4–6 jam per rekaman 1 jam
- Tools berbayar mahal dan kirim data ke server

**Cara Pakai Takoto:**
1. Buka aplikasi → sudah login otomatis
2. Pilih file audio atau ambil dari Resolve
3. Klik Mulai Transkripsi → tunggu selesai
4. Review hasil, edit jika perlu
5. Bagikan ke Drive atau push ke Resolve

---

### 4.2 Persona 2 — Owner / Supervisor

**Profil:**
- Pemilik atau kepala tim produksi
- Perlu memantau progress kerja editor
- Tidak selalu berada di lokasi yang sama dengan editor
- Lebih fokus pada manajemen dibanding teknis

**Kebutuhan:**
- Melihat semua hasil transkripsi dari semua editor di satu tempat
- Tidak perlu install atau belajar cara pakai aplikasi
- Bisa akses kapan saja dari perangkat apapun

**Cara Pakai:**
- Membuka folder Google Drive yang ter-share dari editor
- Melihat file SRT/TXT yang sudah diupload editor
- Memberikan catatan/feedback melalui Google Drive

---

## 5. Ruang Lingkup

### 5.1 Dalam Scope (v3.0.8)

| Kategori | Fitur |
|---|---|
| Transkripsi | Input file audio, 10 pilihan model Whisper, deteksi bahasa otomatis |
| Diarisasi | Identifikasi pembicara, labeling, editor nama speaker |
| Editor Subtitle | Format teks, split baris, sensor kata, edit inline |
| Ekspor | File SRT, JSON, upload ke Google Drive |
| Impor | File SRT |
| Integrasi | DaVinci Resolve (ambil audio, push subtitle) |
| Autentikasi | Login Google OAuth 2.0 untuk identitas editor |
| Monitoring | Upload otomatis ke folder Google Drive owner |
| UI | Tema gelap/terang, layout desktop split-panel, onboarding walkthrough |

### 5.2 Di Luar Scope (v3.0.8)

| Fitur | Alasan |
|---|---|
| Backend cloud Takoto | Keputusan desain: pure desktop, no backend |
| Transkripsi bahasa daerah (Jawa, Sunda) | Keterbatasan model Whisper untuk bahasa daerah |
| Auto-sync / watch folder | Tidak dibutuhkan untuk use case saat ini |
| Dashboard analytics untuk owner | Sudah terpenuhi via Google Drive |
| Verifikasi app Google (publikasi) | App internal, tidak perlu dipublikasi |

---

## 6. Persyaratan Fungsional

### FR-01: Autentikasi Editor

| ID | Persyaratan |
|---|---|
| FR-01.1 | Aplikasi menampilkan halaman login saat pertama kali dibuka atau setelah logout |
| FR-01.2 | Editor dapat login menggunakan akun Google pribadi via OAuth 2.0 PKCE |
| FR-01.3 | Sesi login tersimpan permanen (persistent) hingga editor melakukan logout manual |
| FR-01.4 | Profil editor (nama, email, foto) ditampilkan di header aplikasi |
| FR-01.5 | Editor dapat logout melalui menu dropdown avatar di header |
| FR-01.6 | Token akses Google di-refresh otomatis jika sudah kadaluarsa (>1 jam) |

---

### FR-02: Transkripsi Audio

| ID | Persyaratan |
|---|---|
| FR-02.1 | Aplikasi mendukung input file audio dalam format MP3, WAV, M4A, FLAC, dan format lain yang didukung FFmpeg |
| FR-02.2 | Aplikasi menyediakan 10 varian model Whisper yang dapat dipilih |
| FR-02.3 | Aplikasi mendukung deteksi bahasa otomatis |
| FR-02.4 | Aplikasi mendukung pemilihan bahasa target secara manual |
| FR-02.5 | Aplikasi menyediakan opsi terjemahan ke Bahasa Inggris |
| FR-02.6 | Progress transkripsi ditampilkan secara real-time (persentase) |
| FR-02.7 | Editor dapat membatalkan proses transkripsi yang sedang berjalan |
| FR-02.8 | Hasil transkripsi disimpan otomatis ke storage lokal aplikasi |
| FR-02.9 | Aplikasi mendukung GPU acceleration sesuai platform (CoreML/Metal/Vulkan) |
| FR-02.10 | Aplikasi mendukung Word-level timestamps via DTW (Dynamic Time Warping) |

---

### FR-03: Speaker Diarization

| ID | Persyaratan |
|---|---|
| FR-03.1 | Pengguna dapat mengaktifkan diarisasi saat konfigurasi transkripsi |
| FR-03.2 | Pengguna dapat mengatur maksimal jumlah pembicara |
| FR-03.3 | Pembicara diidentifikasi otomatis dan diberi label (Speaker 0, 1, ...) |
| FR-03.4 | Pengguna dapat mengganti nama setiap pembicara |
| FR-03.5 | Distribusi waktu bicara per pembicara ditampilkan dalam chart |

---

### FR-04: Editor Subtitle

| ID | Persyaratan |
|---|---|
| FR-04.1 | Subtitle ditampilkan sebagai daftar yang dapat diedit secara inline |
| FR-04.2 | Aplikasi mendukung batas jumlah kata per baris |
| FR-04.3 | Aplikasi mendukung batas jumlah karakter per baris |
| FR-04.4 | Aplikasi mendukung batas jumlah baris per subtitle |
| FR-04.5 | Aplikasi mendukung split otomatis pada tanda baca (. ! ? ; :) |
| FR-04.6 | Aplikasi mendukung konversi huruf (UPPERCASE, lowercase, Title Case) |
| FR-04.7 | Aplikasi mendukung penghapusan tanda baca |
| FR-04.8 | Aplikasi mendukung penyensoran kata tertentu yang dikonfigurasi oleh pengguna |

---

### FR-05: Impor & Ekspor

| ID | Persyaratan |
|---|---|
| FR-05.1 | Pengguna dapat mengimpor file `.srt` untuk diedit |
| FR-05.2 | Pengguna dapat mengekspor subtitle ke file `.srt` |
| FR-05.3 | Pengguna dapat mengekspor transcript ke file `.json` |
| FR-05.4 | Ekspor dapat menyertakan atau tidak menyertakan label pembicara |

---

### FR-06: Integrasi DaVinci Resolve

| ID | Persyaratan |
|---|---|
| FR-06.1 | Aplikasi dapat mengambil informasi timeline aktif dari DaVinci Resolve |
| FR-06.2 | Aplikasi dapat menggunakan audio dari timeline Resolve sebagai input transkripsi |
| FR-06.3 | Pengguna dapat memilih input track dan output track |
| FR-06.4 | Hasil subtitle dapat di-push langsung ke timeline DaVinci Resolve |
| FR-06.5 | Mendukung template caption DaVinci Resolve |

---

### FR-07: Bagikan ke Google Drive

| ID | Persyaratan |
|---|---|
| FR-07.1 | Editor dapat mengunggah hasil transkripsi ke folder Google Drive yang ditentukan |
| FR-07.2 | File yang diunggah terdiri dari dua format: `.srt` dan `.txt` |
| FR-07.3 | Folder dibuat otomatis dengan struktur: `transkripsi_{email_slug}/YYYY-MM/DD/` |
| FR-07.4 | Nama file mencerminkan judul sumber audio dan tanggal transkripsi |
| FR-07.5 | Progress upload ditampilkan secara real-time (step-by-step) |
| FR-07.6 | Pengguna mendapatkan notifikasi sukses atau error setelah upload |
| FR-07.7 | Pengguna dapat memilih untuk menyertakan atau tidak menyertakan label pembicara dalam file yang diunggah |

---

### FR-08: Manajemen Model AI

| ID | Persyaratan |
|---|---|
| FR-08.1 | Pengguna dapat mengunduh model Whisper langsung dari dalam aplikasi |
| FR-08.2 | Aplikasi menampilkan progress download model |
| FR-08.3 | Pengguna dapat menghapus model yang sudah tidak diperlukan untuk mengosongkan storage |
| FR-08.4 | Aplikasi menampilkan informasi ukuran dan kebutuhan RAM setiap model |

---

## 7. Persyaratan Non-Fungsional

### NFR-01: Performa

| ID | Persyaratan |
|---|---|
| NFR-01.1 | Waktu startup aplikasi tidak boleh melebihi 3 detik |
| NFR-01.2 | Kecepatan transkripsi minimal sama real-time (1x) pada model tiny/base dengan hardware standar |
| NFR-01.3 | UI tetap responsif selama proses transkripsi berlangsung (tidak freeze) |
| NFR-01.4 | Progress transkripsi diperbarui setiap ≤500ms |

### NFR-02: Keamanan & Privasi

| ID | Persyaratan |
|---|---|
| NFR-02.1 | Tidak ada data audio yang dikirimkan ke server eksternal manapun |
| NFR-02.2 | Credentials OAuth disimpan di memory dan persistent store lokal, bukan dalam format plaintext yang mudah diakses |
| NFR-02.3 | File `.env` berisi credentials tidak boleh di-commit ke repository |
| NFR-02.4 | Token Google digunakan hanya untuk keperluan autentikasi identitas dan upload Drive |

### NFR-03: Ketersediaan & Keandalan

| ID | Persyaratan |
|---|---|
| NFR-03.1 | Aplikasi berjalan sepenuhnya offline (kecuali fitur Google Drive dan download model) |
| NFR-03.2 | Hasil transkripsi tidak hilang jika aplikasi di-restart (tersimpan otomatis) |
| NFR-03.3 | Proses transkripsi dapat dibatalkan kapanpun tanpa merusak state aplikasi |

### NFR-04: Kompatibilitas

| ID | Persyaratan |
|---|---|
| NFR-04.1 | Mendukung macOS 13.0 (Ventura) ke atas |
| NFR-04.2 | Mendukung Windows 10/11 (x86_64) |
| NFR-04.3 | Mendukung Linux (Ubuntu 20.04+, x86_64) |
| NFR-04.4 | Mendukung macOS dengan chip Apple Silicon (M1/M2/M3) dan Intel |

### NFR-05: Usability

| ID | Persyaratan |
|---|---|
| NFR-05.1 | Pengguna baru dapat memulai transkripsi pertama dalam waktu <5 menit setelah instalasi |
| NFR-05.2 | Seluruh teks UI menggunakan Bahasa Indonesia |
| NFR-05.3 | Aplikasi menyediakan walkthrough onboarding untuk pengguna baru |
| NFR-05.4 | Error ditampilkan dengan pesan yang informatif, bukan kode teknis |

---

## 8. Arsitektur Sistem

### 8.1 Gambaran Arsitektur

```
┌────────────────────────────────────────────────────┐
│                 LAPTOP EDITOR                      │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │             APLIKASI TAKOTO                  │  │
│  │                                              │  │
│  │  Frontend (React/TS)  │  Backend (Rust)      │  │
│  │  ─ UI Components      │  ─ Whisper.rs        │  │
│  │  ─ State Management   │  ─ Pyannote.rs       │  │
│  │  ─ Drive API calls    │  ─ FFmpeg             │  │
│  │  ─ OAuth flow         │  ─ OAuth TCP server  │  │
│  └──────────────────────────────────────────────┘  │
│           │                        │               │
│    (file audio)              (model AI)            │
│    (lokal laptop)            (lokal laptop)        │
└───────────┬────────────────────────────────────────┘
            │
            │ (HTTPS — hanya saat upload Drive & OAuth)
            │
            ▼
┌───────────────────────────┐    ┌─────────────────────────┐
│      Google OAuth API     │    │    Google Drive API     │
│  accounts.google.com      │    │   googleapis.com/drive  │
└───────────────────────────┘    └──────────┬──────────────┘
                                            │
                                 ┌──────────▼──────────────┐
                                 │  Google Drive (Owner)   │
                                 │  └ transkripsi_editor/  │
                                 │    └ 2026-06/           │
                                 │      └ 24/              │
                                 │        ├ file.srt       │
                                 │        └ file.txt       │
                                 └─────────────────────────┘
                                            ▲
                                 ┌──────────┴──────────────┐
                                 │    OWNER (monitoring)   │
                                 │  via browser/mobile     │
                                 └─────────────────────────┘
```

### 8.2 Keputusan Arsitektur Kunci

| Keputusan | Pilihan | Alasan |
|---|---|---|
| Framework desktop | Tauri 2 (vs Electron) | Binary lebih kecil, performa lebih baik, Rust backend yang powerful |
| AI inference | On-device (vs cloud API) | Privasi data, tidak perlu internet, tidak ada biaya API |
| Auth model | OAuth 2.0 PKCE (vs server-side) | Tidak perlu backend server, aman untuk desktop app |
| Storage akun | tauri-plugin-store (vs localStorage) | Persistent dan aman, bukan browser storage |
| Upload Drive | Editor's token (vs service account) | Lebih simpel, tidak perlu JWT bearer flow yang kompleks |
| Kredensial | Bundle di .env (vs runtime input) | Konfigurasi sekali oleh developer, transparan untuk editor |

---

## 9. Alur Pengguna

### 9.1 Alur: Pertama Kali Pakai

```
Buka Aplikasi
      │
      ▼
Tampil Login Screen
      │
      ▼
Klik "Masuk dengan Google"
      │
      ▼
Browser terbuka → Login Google
      │
      ▼
Consent screen: izinkan akses Drive
      │
      ▼
Browser menampilkan "Login Berhasil"
      │
      ▼
Aplikasi menampilkan Setup Walkthrough
      │
      ▼
Download model AI (pilih model)
      │
      ▼
Siap transkripsi
```

### 9.2 Alur: Transkripsi & Upload ke Drive

```
[Mode Standalone]               [Mode DaVinci Resolve]
       │                                │
Pilih file audio               Klik "Refresh"
       │                                │
       │                    Pilih input track audio
       │                                │
       └──────────┬─────────────────────┘
                  │
         Konfigurasi:
         - Pilih model
         - Pilih bahasa
         - Aktifkan diarisasi (opsional)
                  │
         Klik "Mulai Transkripsi"
                  │
         Progress bar berjalan
         (bisa dibatalkan kapanpun)
                  │
         Hasil muncul di panel kanan
                  │
         ┌────────┴────────┐
         │                 │
      Edit nama        Edit subtitle
      speaker          (opsional)
         │                 │
         └────────┬────────┘
                  │
         Klik "Impor / Ekspor"
                  │
         Pilih tab "Bagikan"
                  │
         Klik "Bagikan ke Google Drive"
                  │
         Progress: Verifikasi → Buat folder → Upload SRT → Upload TXT
                  │
         Notifikasi "Berhasil dibagikan"
                  │
         [Owner melihat file di Drive]
```

### 9.3 Alur: Token Refresh

```
Klik "Bagikan ke Google Drive"
         │
getValidToken(editorProfile)
         │
tokenExpiry < sekarang + 60 detik?
         │
    YA ──┼── TIDAK
    │         │
Refresh       Pakai token
token         langsung
via /token    │
    │         │
    └────┬────┘
         │
Token valid
Upload dilanjutkan
```

---

## 10. Antarmuka Pengguna

### 10.1 Halaman Login

- Logo Takoto di tengah layar
- Tombol "Masuk dengan Google" dengan ikon Google
- Loading indicator saat proses login berlangsung
- Pesan error jika login gagal

### 10.2 Layar Utama (Desktop)

**Layout split-panel:**

```
┌─────────────────────────────────────────────────────────┐
│ [☀/🌙]  [Resolve | Standalone]              [Avatar ▼] │  ← Header
├───────────────────────────┬─────────────────────────────┤
│                           │                             │
│   PANEL KIRI              │   PANEL KANAN               │
│   TranscriptionSettings   │   SubtitleViewer            │
│                           │                             │
│   ┌─ SUMBER FILE ──────┐  │   ┌─ SUBTITLE ──────────┐  │
│   │ Pilih file audio   │  │   │ 1  00:00:01         │  │
│   └────────────────────┘  │   │    Halo selamat...  │  │
│                           │   │                     │  │
│   ┌─ MODEL ────────────┐  │   │ 2  00:00:05         │  │
│   │ ◉ Small            │  │   │    Terima kasih...  │  │
│   └────────────────────┘  │   └─────────────────────┘  │
│                           │                             │
│   ┌─ BAHASA ───────────┐  │   ┌─ SPEAKERS ──────────┐  │
│   │ Auto Detect        │  │   │ Speaker 0 ██████    │  │
│   └────────────────────┘  │   │ Speaker 1 ████      │  │
│                           │   └─────────────────────┘  │
│   [▶ Mulai Transkripsi ]  │                             │
│                           │                             │
│   [↑↓ Impor / Ekspor  ]   │                             │
└───────────────────────────┴─────────────────────────────┘
```

### 10.3 Popover Impor/Ekspor/Bagikan

```
┌── Impor / Ekspor / Bagikan ───────────────┐
│  [Impor]  [Ekspor]  [Bagikan]             │
│  ─────────────────────────────            │
│  Tab Bagikan:                             │
│                                           │
│  [🖼 Avatar] Nama Editor                  │
│              editor@email.com             │
│                                           │
│  [──] Sertakan label pembicara            │
│                                           │
│  File akan disimpan ke folder             │
│  transkripsi_editor di Google Drive       │
│                                           │
│  [  Bagikan ke Google Drive  ]            │
└───────────────────────────────────────────┘
```

### 10.4 Dropdown Avatar (Header)

```
┌───────────────────────┐
│ Nama Editor           │
│ editor@email.com      │
├───────────────────────┤
│ 🚪 Keluar             │
└───────────────────────┘
```

---

## 11. Integrasi Eksternal

### 11.1 Google OAuth 2.0

| Parameter | Nilai |
|---|---|
| Endpoint | `https://accounts.google.com/o/oauth2/v2/auth` |
| Grant Type | `authorization_code` dengan PKCE |
| Response Type | `code` |
| Scopes | `openid email profile https://www.googleapis.com/auth/drive` |
| Redirect URI | `http://localhost:{dynamic_port}/callback` |
| Access Type | `offline` (untuk mendapatkan refresh_token) |

### 11.2 Google Drive API v3

| Endpoint | Kegunaan |
|---|---|
| `GET /drive/v3/files` | Mencari folder yang sudah ada |
| `POST /drive/v3/files` | Membuat folder baru |
| `POST /upload/drive/v3/files?uploadType=multipart` | Upload file |

### 11.3 DaVinci Resolve

Integrasi via Lua API yang diinstal sebagai script di DaVinci Resolve:
- **macOS**: `/Library/Application Support/Blackmagic Design/DaVinci Resolve/Fusion/Scripts/Utility/`
- **Linux**: `/opt/resolve/Fusion/Scripts/Utility/`

Script Lua (`Takoto.lua`) menerima command dari Takoto via localhost HTTP.

---

## 12. Batasan & Asumsi

### 12.1 Batasan Teknis

| Batasan | Detail |
|---|---|
| Platform target utama | macOS (deployment ke editor menggunakan MacBook) |
| Model AI | Hanya Whisper OpenAI; tidak mendukung model lain (Vosk, Faster-Whisper, dll) |
| Google OAuth Test User | Maksimal 100 pengguna tanpa verifikasi Google |
| Token OAuth | Access token berlaku 1 jam; refresh token berlaku sampai dicabut |
| Upload Drive | Hanya ke satu folder utama yang dikonfigurasi di `.env` |
| Transkripsi simultan | Hanya satu proses transkripsi berjalan dalam satu waktu |

### 12.2 Asumsi

1. Setiap editor memiliki akun Google pribadi yang bisa digunakan untuk login
2. Owner memiliki Google Drive dan bersedia men-share folder ke masing-masing editor
3. Developer (pengembang) yang menginstal aplikasi di setiap laptop editor dan mendaftarkan email mereka sebagai test user
4. Setiap laptop editor memiliki koneksi internet saat pertama kali login dan saat upload ke Drive
5. Editor tidak perlu mengakses Drive secara langsung — hanya upload melalui aplikasi
6. Tidak ada kebutuhan kolaborasi real-time antara editor (masing-masing bekerja di file berbeda)

---

## 13. Risiko & Mitigasi

| Risiko | Level | Mitigasi |
|---|---|---|
| Google mencabut access token editor | Medium | Refresh token otomatis; jika refresh gagal, tampilkan pesan untuk login ulang |
| Model AI tidak terinstal / korup | Low | Validasi ketersediaan model sebelum transkripsi; tampilkan pesan download |
| FFmpeg binary tidak kompatibel dengan OS | Low | Bundle FFmpeg per platform; deteksi platform saat build |
| Editor lupa logout di laptop umum | Medium | Tampilkan peringatan saat pertama login bahwa sesi tersimpan |
| Folder Drive belum di-share ke editor | Medium | Tampilkan pesan error yang informatif jika mendapat 403 dari Drive API |
| Kapasitas Drive penuh | Low | Error dari Drive API akan ditampilkan sebagai notifikasi |
| Perubahan Google OAuth policy | Low | Monitor kebijakan Google; scope `drive` saat ini tidak memerlukan verifikasi untuk test user |
| Build credentials masuk ke repository | High | `.env` di-gitignore; `.env.example` tanpa nilai aktual di-commit |

---

## 14. Kriteria Keberhasilan

### 14.1 Fungsional

| Kriteria | Target |
|---|---|
| Editor dapat login dengan akun Google | ✓ 100% berhasil untuk akun yang terdaftar sebagai test user |
| Transkripsi audio 1 menit | ✓ Selesai dalam <5 menit pada model small |
| Upload ke Drive berhasil | ✓ File SRT dan TXT muncul di folder Drive dengan struktur yang benar |
| Owner dapat melihat hasil dari semua editor | ✓ Semua upload terpusat di satu folder Drive |
| Token refresh transparan (tidak mengganggu UX) | ✓ Editor tidak perlu login ulang karena token expired |

### 14.2 Kualitas Transkripsi

| Bahasa | Model | Target Word Error Rate (WER) |
|---|---|---|
| Bahasa Indonesia | small | < 25% |
| Bahasa Indonesia | large-v3-turbo | < 15% |
| Bahasa Inggris | small | < 15% |
| Bahasa Inggris | large-v3 | < 10% |

### 14.3 Adopsi

| Kriteria | Target |
|---|---|
| Semua 4 editor berhasil login | 4/4 editor |
| Upload pertama berhasil tanpa bantuan | Semua editor setelah onboarding |
| Waktu onboarding editor baru | < 15 menit (install + login + download model + transkripsi pertama) |

---

## 15. Glosarium

| Istilah | Definisi |
|---|---|
| **Whisper** | Model AI transkripsi audio open-source dari OpenAI |
| **Diarisasi (Speaker Diarization)** | Proses identifikasi otomatis "siapa berbicara kapan" dalam rekaman audio |
| **SRT** | SubRip Subtitle — format file teks untuk subtitle video yang paling umum |
| **PKCE** | Proof Key for Code Exchange — ekstensi keamanan OAuth 2.0 untuk aplikasi publik (desktop/mobile) |
| **Access Token** | Token sementara (berlaku 1 jam) untuk mengakses API Google atas nama pengguna |
| **Refresh Token** | Token jangka panjang untuk mendapatkan access token baru tanpa login ulang |
| **Tauri** | Framework open-source untuk membangun aplikasi desktop menggunakan teknologi web dengan backend Rust |
| **DTW** | Dynamic Time Warping — algoritma untuk menghasilkan word-level timestamps yang akurat |
| **DaVinci Resolve** | Software editing video profesional dari Blackmagic Design |
| **Test User** | Email yang didaftarkan di Google Cloud Console untuk bisa menggunakan app OAuth yang belum diverifikasi |
| **Editor Slug** | Bagian email sebelum `@` yang digunakan sebagai nama folder di Drive (contoh: `transkripsi_john`) |
| **On-device AI** | Inferensi model AI yang berjalan sepenuhnya di perangkat lokal tanpa internet |
