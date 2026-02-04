#!/bin/bash

# Markdown Viewer - Launch Script
# Usage: ./markdown-viewer.sh [file.md]

# Source nvm to ensure Node.js 22 is available
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  . "$HOME/.nvm/nvm.sh"
  nvm use 22 > /dev/null 2>&1
fi

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$SCRIPT_DIR"

if [ -z "$1" ]; then
  echo "Starting Markdown Viewer..."
  npm run dev
else
  FILE_PATH="$1"
  
  # Convert to absolute path if relative
  if [[ "$FILE_PATH" != /* ]]; then
    FILE_PATH="$(pwd)/$FILE_PATH"
  fi
  
  if [ -f "$FILE_PATH" ]; then
    echo "Opening: $FILE_PATH"
    npm run dev -- "$FILE_PATH"
  else
    echo "Error: File not found: $FILE_PATH"
    exit 1
  fi
fi
