@echo off
REM Markdown Viewer - Windows Launch Script
REM Usage: markdown-viewer.bat [file.md]

cd /d "%~dp0"

if "%~1"=="" (
    echo Starting Markdown Viewer...
    call npm run dev
) else (
    set "FILE_PATH=%~f1"
    echo Opening: %FILE_PATH%
    call npm run dev -- "%FILE_PATH%"
)
