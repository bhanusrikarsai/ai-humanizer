@echo off
cd /d "%~dp0"
echo ======================================================================
echo Starting AI Humanizer with Public Cloudflare Tunnel...
echo ======================================================================
echo.

:: Launch local server in background if not already running
curl.exe -s http://127.0.0.1:8000/api/health >nul 2>&1
if errorlevel 1 (
    echo Starting local server first...
    start "AI Humanizer Backend" cmd /c "call run.bat"
    echo Waiting for server to initialize...
    :wait_loop
    ping 127.0.0.1 -n 2 >nul
    curl.exe -s http://127.0.0.1:8000/api/health >nul 2>&1
    if errorlevel 1 goto wait_loop
)

echo.
echo Local server is healthy! Starting public tunnel...
echo ======================================================================
echo Look for your public URL below (https://*.trycloudflare.com):
echo ======================================================================
echo.

.\cloudflared.exe tunnel --url http://127.0.0.1:8000
pause
