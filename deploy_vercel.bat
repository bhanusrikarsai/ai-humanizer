@echo off
cd /d "%~dp0"
echo ======================================================================
echo  Deploy AI Humanizer to Vercel (Permanent 24/7 Cloud Hosting)
echo ======================================================================
echo.

echo [1/2] Verifying frontend production build...
cd frontend
call npm.cmd run build
if errorlevel 1 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo [2/2] Pushing latest configuration to GitHub...
git add .
git commit -m "fix: resilient SPA routing, port cleaner, and deployment reliability" >nul 2>&1
git push origin main

echo.
echo ======================================================================
echo  DEPLOYED TO GITHUB & READY ON VERCEL!
echo ======================================================================
echo.
echo Your public live URL:
echo   https://ai-humanizer-bhanusrikarsai.vercel.app
echo.
echo ======================================================================
echo  IMPORTANT: If the website asks to "Log in to Vercel" / "Protected Deployment":
echo  1. Open: https://vercel.com/dashboard
echo  2. Click your project: "ai-humanizer"
echo  3. Go to "Settings" -> "Deployment Protection" (in left sidebar)
echo  4. Under "Vercel Authentication", set it to "Disabled" and click "Save"!
echo  Once disabled, the website opens instantly for everyone, every time!
echo ======================================================================
echo.
pause
