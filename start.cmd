@echo off
setlocal
cd /d "%~dp0"
set "DASHBOARD_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "DASHBOARD_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
"%DASHBOARD_NODE%" -e "if (Number(process.versions.node.split('.')[0]) < 22) { console.error('Node.js 22 or newer is required.'); process.exit(1); }"
if errorlevel 1 (
  echo Use a company-approved Node.js 22+ runtime or Docker Compose.
  pause
  exit /b 1
)
if not defined SOURCES_CONFIG if exist "%~dp0sources.local.json" set "SOURCES_CONFIG=%~dp0sources.local.json"
"%DASHBOARD_NODE%" "%~dp0server.mjs"
if errorlevel 1 pause
endlocal
