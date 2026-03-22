@echo off
echo Starting Socratic AI Application...
echo.

echo Starting Server...
cd server
start "Socratic AI Server" cmd /k "npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Client...
cd ../client
start "Socratic AI Client" cmd /k "npm start"

echo.
echo Both servers are starting...
echo Server: http://localhost:5000
echo Client: http://localhost:3000
echo.
echo The application will open in your browser shortly.
echo Press any key to close this window...
pause > nul
