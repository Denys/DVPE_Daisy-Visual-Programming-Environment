@echo off
REM ============================================
REM DVPE Launcher Script
REM Starts both Vite dev server and Tauri app
REM ============================================

echo Starting DVPE - Daisy Visual Programming Environment...
echo.

REM Change to the DVPE_CLD directory
cd /d "%~dp0dvpe_CLD"

REM Check if node_modules exists
if not exist node_modules (
    echo [ERROR] node_modules not found. Please run: npm install
    pause
    exit /b 1
)

REM Start Vite dev server in background
echo [1/2] Starting Vite dev server on http://localhost:1420 ...
start "DVPE Dev Server" cmd /k "npm run dev"

REM Wait for Vite to start
timeout /t 5 /nobreak > nul

REM Start Tauri dev (this opens the desktop app)
echo [2/2] Starting Tauri desktop app...
start "" npm run tauri:dev

echo.
echo DVPE is starting up!
echo - Dev server: http://localhost:1420
echo - Desktop app: Should open automatically
echo.
echo Press any key to close this window (servers will keep running)...
pause > nul
