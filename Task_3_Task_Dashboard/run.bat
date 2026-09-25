@echo off
cd /d "%~dp0"
if not exist server\node_modules (
  echo Installing server dependencies...
  call npm install --prefix server
)
if not exist client\node_modules (
  echo Installing client dependencies...
  call npm install --prefix client
)
if not exist node_modules (
  echo Installing root dependencies...
  call npm install
)
call npm run dev
