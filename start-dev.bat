@echo off
REM Start Mandi Deals Development Servers
REM Usage: start-dev.bat

echo.
echo =========================================
echo   Mandi Deals - Development Server
echo =========================================
echo.

echo [1/2] Starting Backend API (port 3001)...
start "Mandi Backend" cmd /k "cd backend && npm start"

timeout /t 2 /nobreak

echo [2/2] Starting Frontend (port 5173)...
start "Mandi Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 2 /nobreak

echo.
echo =========================================
echo   SERVERS STARTING...
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:5173
echo =========================================
echo.

start http://localhost:5173

echo Servers are running in separate windows.
echo Press any key to close this window...
pause >nul
