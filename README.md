# Takoto – Subtitles Made Simple
Create high‑quality subtitles with **one click**. Takoto delivers **fast, accurate, and fully customisable** subtitles in a sleek, intuitive interface. Now works with Davinci Resolve and standalone.

### 📥 One-Click Installer: [Windows ](https://github.com/tmoroney/auto-subs/releases/latest/download/Takoto-windows-x86_64.exe) ✨ [MacOS (ARM)](https://github.com/tmoroney/auto-subs/releases/latest/download/Takoto-Mac-ARM.pkg) ✨ [MacOS (Intel)](https://github.com/tmoroney/auto-subs/releases/latest/download/Takoto-Mac-Intel.pkg)
**💡 100,000+ downloads so far!**

<a href="https://www.buymeacoffee.com/tmoroney" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## 🚀 What’s New in V3
- **Complete UI Overhaul** — Cleaner, more consistent, and more discoverable controls.
- **Performance Improvements** — Faster speaker diarization/labeling with negligible added time; ~3× lower idle memory via the Rust backend.
- **Expanded Model Management** — More model options, easy in‑UI deletion, clearer status indicators.
- **Timing Fixes** — Correct subtitle timing for variable frame rates and drop‑frame scenarios.
- **Rust Backend (replaces Python)** — Faster, leaner, and more reliable foundation for future features.
- **Standalone Mode** — Use Takoto on any audio/video file without DaVinci Resolve.
- **New Subtitle Editor** — Modern, responsive editor with a resizable caption viewer.
- **Advanced Speaker Editor** — Per‑speaker styles (fill/outline/border) with live preview; choose different output track per speaker.
- **Multi‑line Subtitles** — Pick how many lines to show per subtitle.
- **Resizable Subtitle Viewer** — Desktop layout supports side‑by‑side editing and review.

## ⭐ Core Capabilities
- **Blazing Fast Transcription** in many languages.
- **Speaker Diarization & Labeling** with automatic color coding.
- **English Translation** (more languages coming soon).
- **Modern, Creator‑Focused UI** with thoughtful defaults and power‑user controls.

Generate Subtitles & Label Speakers |  Advanced Settings
:-------------------------:|:-------------------------:
<img width="800" alt="Transcription Page" src="https://github.com/user-attachments/assets/ca00769b-93e2-4127-b604-a9108bf8451a"> | <img width="800" alt="Advanced Settings" src="https://github.com/user-attachments/assets/be1a111a-71c5-4d8d-ad8c-d9e889e3e7ab">


## Quick Start
### 1) Download & Install
- Use the installer links above for your OS.
- Open the installer and follow the prompts.

### 2) Choose a Workflow
#### Standalone Mode (no Resolve required)
1. Launch Takoto.
2. Select an audio/video file.
3. Pick your model and language/translation options.

4. Click Transcribe. Edit speakers/subtitles as needed.
5. Export subtitles (e.g., to files) or copy text.

#### DaVinci Resolve Mode
1. Open **DaVinci Resolve**.
2. Go to **Workspace → Scripts → Takoto**.
3. In Takoto, select your timeline/audio source and settings.
4. Click Transcribe. Edit speakers/subtitles as needed.
5. Send styled subtitles back to Resolve.

# Contribute to Takoto
PRs are welcome!

## Dev Setup (brief)
1. Clone the repo.
2. Install prerequisites for a Tauri app (Node.js + Rust toolchain). See: https://tauri.app
3. Run the UI:
   ```bash
   cd Takoto-App
   npm install
   npm run tauri dev
   ```
4. For Resolve integration during development, copy the Lua (Takoto.lua) script from `Takoto-App/src-tauri/resources/` into your Resolve scripts folder so Resolve can launch/connect to the dev app. Open the lua script and set it to dev mode via the variable at the top, then set the location where the git repo was cloned:
   - Windows: `%appdata%/Blackmagic Design/DaVinci Resolve/Support/Fusion/Scripts/Utility`
   - macOS: `/Library/Application Support/Blackmagic Design/DaVinci Resolve/Fusion/Scripts/Utility`
   Then open it from Resolve via **Workspace → Scripts → Takoto**.

If you’re contributing to the backend, the Rust code lives under `Takoto-App/src-tauri/`.
