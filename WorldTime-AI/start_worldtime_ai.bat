@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if errorlevel 1 (
  echo Python launcher was not found. Install Python 3.10 or newer and try again.
  pause
  exit /b 1
)
if not exist ".venv\Scripts\python.exe" (
  echo Creating a local Python environment...
  py -m venv .venv
  if errorlevel 1 goto failed
)
if not exist ".env" (
  copy ".env.example" ".env" >nul
  echo Created .env from .env.example.
  echo Open .env and add your own OPENAI_API_KEY, then run this file again.
  notepad ".env"
  pause
  exit /b 0
)
if not exist ".venv\packages-installed" (
  echo Installing required Python packages...
  ".venv\Scripts\python.exe" -m pip install -r requirements.txt
  if errorlevel 1 goto failed
  type nul > ".venv\packages-installed"
)
start "WorldTime AI" http://127.0.0.1:5000
".venv\Scripts\python.exe" app.py
goto end
:failed
echo Setup failed. Check that Python and internet access are available.
pause
:end
endlocal
