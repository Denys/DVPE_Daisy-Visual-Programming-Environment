@echo off
REM ============================================
REM DVPE Web Launcher (No Tauri required)
REM Starts Vite dev server and opens browser
REM ============================================

echo Starting DVPE Web - Daisy Visual Programming Environment...
echo.

REM Change to the DVPE_CLD directory
cd /d "%~dp0"

REM Check if node_modules exists
if not exist node_modules (
    echo [ERROR] node_modules not found. Please run: npm install
    pause
    exit /b 1
)

REM Start Vite dev server
echo Starting Vite dev server on http://localhost:1420 ...
echo Opening browser...
start "" http://localhost:1420

REM Start Vite in current terminal
npm run dev

echo.
echo DVPE is running at http://localhost:1420
echo Press Ctrl+C to stop the server
