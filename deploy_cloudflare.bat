@echo off
cd /d "%~dp0frontend"
echo ======================================================================
echo  Cloudflare Pages Direct Deployment
echo ======================================================================
echo.

echo [1/3] Building latest production assets...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Checking Cloudflare Authentication...
call npx wrangler whoami >nul 2>&1
if errorlevel 1 (
    echo.
    echo Cloudflare login required! Opening browser to authorize Wrangler...
    echo Please click "Allow" in your browser window.
    echo.
    call npx wrangler login
)

echo.
echo [3/3] Deploying to Cloudflare Pages...
call npx wrangler pages deploy dist --project-name=ai-humanizer

echo.
echo ======================================================================
echo Deployment Complete! Check the URL above to view your live app.
echo ======================================================================
pause
