@echo off
node -v 2 > Nul
if "%errorlevel%" == "9009" (
  echo node.exe is required please install it from https://nodejs.org/en/download then try again
) else (
  cd ..
  IF NOT EXIST node_modules/ (
    echo Installing all the dependencies required ...
    npm install
  )
  IF NOT EXIST dist/ (
    echo Building resources ...
    npm run build
  )
  echo Starting application ...
  npm run start
)