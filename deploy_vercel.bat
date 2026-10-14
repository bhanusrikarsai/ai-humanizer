@echo off
cd /d "%~dp0"
echo ======================================================================
echo  Deploy AI Humanizer to Vercel (Permanent 24/7 Cloud Hosting)
echo ======================================================================
echo.

echo [1/2] Verifying frontend production build...
cd frontend
call npm run build
if errorlevel 1 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b 1
)
cd ..

echo.
echo [2/2] Pushing latest configuration to GitHub...
git add .
git commit -m "deploy: update vercel deployment configuration" >nul 2>&1
git push origin main

echo.
echo ======================================================================
echo  READY FOR VERCEL DEPLOYMENT!
echo ======================================================================
echo.
echo Quick 1-Click Import:
echo 1. Open your browser to: https://vercel.com/new
echo 2. Sign in with GitHub and click "Import" next to "ai-humanizer"
echo 3. Click "Deploy" (vercel.json handles everything automatically!)
echo.
echo Once deployed, your site will be permanently live 24/7 at:
echo   https://ai-humanizer-bhanusrikarsai.vercel.app
echo ======================================================================
echo.
pause
