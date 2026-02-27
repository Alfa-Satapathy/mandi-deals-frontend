@echo off
REM MANDI DEALS - GITHUB SETUP EASY SCRIPT
REM This script automates pushing to GitHub

color 0A
cls

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║    MANDI DEALS - GITHUB REPOSITORY SETUP                      ║
echo ║    Automated Push Script                                       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Get GitHub username
set /p GITHUB_USERNAME="Enter your GitHub username: "

if "%GITHUB_USERNAME%"=="" (
    color 0C
    echo.
    echo ERROR: GitHub username is required!
    pause
    exit /b 1
)

REM Get Git user name and email
set /p GIT_NAME="Enter your name (for Git commits): "
set /p GIT_EMAIL="Enter your email (for Git commits): "

if "%GIT_NAME%"=="" set GIT_NAME=Mandi Deals Developer
if "%GIT_EMAIL%"=="" set GIT_EMAIL=dev@mandideals.local

color 0B
echo.
echo ✓ GitHub Username: %GITHUB_USERNAME%
echo ✓ Git Name: %GIT_NAME%
echo ✓ Git Email: %GIT_EMAIL%
echo.
echo ═══════════════════════════════════════════════════════════════════
echo.

pause /b 1 "Press ENTER to continue..."

REM ============================================================
REM PUSH BACKEND
REM ============================================================
color 0A
echo.
echo ┌─ PUSHING BACKEND REPOSITORY
echo │
cd /d e:\MandiDeals\backend

if errorlevel 1 (
    color 0C
    echo ✗ ERROR: Could not change to backend directory
    pause
    exit /b 1
)

echo │ 📦 Initializing repository...
git init >nul 2>&1
git config user.name "%GIT_NAME%" >nul 2>&1
git config user.email "%GIT_EMAIL%" >nul 2>&1

echo │ 📝 Staging files...
git add . >nul 2>&1

echo │ 💾 Creating commit...
git commit -m "Initial commit: Mandi Deals Backend API - Production Ready" >nul 2>&1

echo │ 🌿 Setting main branch...
git branch -M main >nul 2>&1

REM Remove existing remote if present
git remote remove origin >nul 2>&1

echo │ 🔗 Adding GitHub remote...
git remote add origin https://github.com/%GITHUB_USERNAME%/mandi-deals-backend.git >nul 2>&1

echo │ 🚀 Pushing to GitHub...
echo │    (You may be prompted for credentials)
git push -u origin main 2>&1

if errorlevel 1 (
    color 0C
    echo │ ✗ FAILED to push backend
    echo.
) else (
    color 0A
    echo │ ✓ Successfully pushed backend
    echo │ 📍 https://github.com/%GITHUB_USERNAME%/mandi-deals-backend
)
echo │
echo └─

color 0A
pause /b 1 "Press ENTER to continue..."

REM ============================================================
REM PUSH FRONTEND
REM ============================================================
color 0A
echo.
echo ┌─ PUSHING FRONTEND REPOSITORY
echo │
cd /d e:\MandiDeals\frontend

if errorlevel 1 (
    color 0C
    echo ✗ ERROR: Could not change to frontend directory
    pause
    exit /b 1
)

echo │ 📦 Initializing repository...
git init >nul 2>&1
git config user.name "%GIT_NAME%" >nul 2>&1
git config user.email "%GIT_EMAIL%" >nul 2>&1

echo │ 📝 Staging files...
git add . >nul 2>&1

echo │ 💾 Creating commit...
git commit -m "Initial commit: Mandi Deals Frontend - React POS Interface" >nul 2>&1

echo │ 🌿 Setting main branch...
git branch -M main >nul 2>&1

REM Remove existing remote if present
git remote remove origin >nul 2>&1

echo │ 🔗 Adding GitHub remote...
git remote add origin https://github.com/%GITHUB_USERNAME%/mandi-deals-frontend.git >nul 2>&1

echo │ 🚀 Pushing to GitHub...
echo │    (You may be prompted for credentials)
git push -u origin main 2>&1

if errorlevel 1 (
    color 0C
    echo │ ✗ FAILED to push frontend
    echo.
) else (
    color 0A
    echo │ ✓ Successfully pushed frontend
    echo │ 📍 https://github.com/%GITHUB_USERNAME%/mandi-deals-frontend
)
echo │
echo └─

REM ============================================================
REM SUMMARY
REM ============================================================
color 0B
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  GITHUB SETUP COMPLETE!                                       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Your repositories are now on GitHub:
echo.
echo Backend:   https://github.com/%GITHUB_USERNAME%/mandi-deals-backend
echo Frontend:  https://github.com/%GITHUB_USERNAME%/mandi-deals-frontend
echo.
echo NEXT STEPS:
echo   1. Deploy Backend to Railway: https://railway.app
echo   2. Deploy Frontend to Vercel: https://vercel.com
echo.

pause
