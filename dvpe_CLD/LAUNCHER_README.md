# DVPE Launcher Scripts

This directory contains launcher scripts to start the DVPE application.

## Quick Start

### Option 1: Web Version (No Tauri Required)
Simply double-click **`start-dvpe-web.bat`** to launch:
- Vite development server on http://localhost:1420
- Opens automatically in your default browser

### Option 2: Full Desktop App (Requires Tauri Setup)
- **`start-dvpe.bat`** - Starts both Vite dev server AND Tauri desktop app
- Requires Tauri to be initialized first (see below)

---

## Prerequisites

### For Web Version
1. Install Node.js 20+
2. Run: `cd dvpe_CLD && npm install`
3. Double-click `start-dvpe-web.bat`

### For Desktop App (Tauri)
1. Install Node.js 20+
2. Install Rust: https://rustup.rs/
3. Install Tauri CLI: `npm install -g @tauri-apps/cli`
4. Run: `cd dvpe_CLD && npm install`
5. Initialize Tauri: `cd dvpe_CLD && npx tauri init`
   - App name: DVPE
   - Window title: Daisy Visual Programming Environment
   - Dev URL: http://localhost:1420
   - Dist folder: dist
6. Run `start-dvpe.bat` OR use `npm run tauri:dev`

---

## Building a Standalone .exe

Once Tauri is initialized:

```bash
cd dvpe_CLD
npm run tauri:build
```

The exe will be created in:
`dvpe_CLD/src-tauri/target/release/bundle/nsis/` (Windows installer)
or
`dvpe_CLD/src-tauri/target/release/` (portable exe)

---

## Notes

- The web version runs in browser and uses localStorage for patch saving
- The desktop version has native file dialogs and better OS integration
- Both versions connect to the same localhost:1420 dev server
