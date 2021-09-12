@echo off
set path_src="%TEMP%/destry_cli/destry-cli-main/src/"
if exist %path_src% (
  del /s /q "../src"
  robocopy %path_src% "../src/" /E
  @RD /S /Q "%TEMP%/destry_cli"
  echo reinstall dependencies ...
  npm install
  echo Rebuild resources for new update ...
  npm run build
  echo Starting ...
  "./start_application.bat"
) else (
  echo No updates available
)