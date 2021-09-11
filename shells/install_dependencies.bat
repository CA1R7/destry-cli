@echo off
title "Dependencied installation"
node -v 2 > Nul
if "%errorlevel%" == "9009" (
  echo node could not be found
) else (
  echo Installing all the dependencies required ...
  cd ..
  npm install
  echo Build resources required ...
  npm run build
  echo Now you can start your application with start.bat file or manually
)
pause