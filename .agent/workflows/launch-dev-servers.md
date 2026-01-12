---
description: How to launch the DVPE frontend and backend development servers
---
// turbo-all

# Launching DVPE Development Servers

## Prerequisites

- Node.js 18+ installed
- Rust toolchain installed (for Tauri backend)
- Dependencies installed: `cd dvpe_CLD && npm install`

---

## Option 1: Frontend Only (Browser Mode)

For development without native desktop features, run the Vite dev server:

```bash
cd dvpe_CLD
npm run dev
```

**Access:** http://localhost:1420

This is the fastest way to develop and test UI changes.

---

## Option 2: Full Desktop App (Tauri)

To run the complete desktop application with native features (file dialogs, etc.):

```bash
cd dvpe_CLD
npm run tauri:dev
```

This starts:
1. Vite dev server (frontend) on http://localhost:1420
2. Tauri Rust backend (compiles and launches native window)

**First run may take 3-5 minutes** to compile Rust dependencies.

---

## Troubleshooting

### Windows File Locking Errors

If you see errors like:
```
error: could not compile `tar` (lib) due to 1 previous error
The process cannot access the file because it is being used by another process (os error 32)
```

**Cause:** Windows Defender or antivirus is scanning Rust build artifacts.

**Solutions:**
1. **Add exclusion** in Windows Security → Virus & threat protection → Exclusions:
   - Add folder: `dvpe_CLD/src-tauri/target/`
2. **Retry the build** — sometimes locks clear after a few seconds
3. **Clean and rebuild:**
   ```bash
   cd dvpe_CLD/src-tauri
   cargo clean
   cd ..
   npm run tauri:dev
   ```

### Port Already in Use

If port 1420 is occupied:

```bash
# Find process using port
netstat -ano | findstr :1420

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

Or modify `vite.config.ts` to use a different port.

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend only (fast) |
| `npm run tauri:dev` | Start full desktop app |
| `npm run build` | Build frontend for production |
| `npm run tauri:build` | Build distributable desktop app |
| `npm run test` | Run Vitest tests |
