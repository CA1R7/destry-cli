@echo off
node -v 2 > Nul
if "%errorlevel%" == "9009" (
  echo node could not found
) else (
  cd ..
  IF NOT EXIST dist/ (
    echo Building resources ...
    npm run build
  )
  echo Starting application ...
  npm run start
)
pause