# Running Markdown Viewer in WSL2

This guide explains how to run the Markdown Viewer in a WSL2 environment.

## The Challenge

Electron apps require a GUI display server (X11 or Wayland), which WSL2 doesn't have by default. However, you have several options to run the app.

## Option 1: Run from Windows (Recommended)

The easiest approach is to run the app directly from Windows, accessing the WSL2 filesystem:

### Method A: Using Windows File Explorer

1. Open Windows File Explorer
2. Navigate to: `\\wsl$\Ubuntu\home\balwant\kitchen-sink\phenixcoder\markdown`
3. Double-click `markdown-viewer.bat`
4. Or drag a `.md` file onto `markdown-viewer.bat`

### Method B: Using Windows Terminal/PowerShell

```powershell
# Navigate to the WSL path
cd \\wsl$\Ubuntu\home\balwant\kitchen-sink\phenixcoder\markdown

# Run the app
npm run dev

# Or open a specific file
npm run dev -- README.md
```

## Option 2: Install Display Server in WSL2

You can install an X11 server in Windows and configure WSL2 to use it:

### Step 1: Install VcXsrv or X410 in Windows

**VcXsrv (Free):**
1. Download from: https://sourceforge.net/projects/vcxsrv/
2. Install and run XLaunch
3. Select "Multiple windows" → "Start no client" → Check "Disable access control"

**X410 (Paid, $10):**
- Download from Microsoft Store
- Simpler setup, better performance

### Step 2: Configure WSL2

Add to your `~/.bashrc`:

```bash
# For VcXsrv
export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):0

# For X410
export DISPLAY=:0
```

Reload:
```bash
source ~/.bashrc
```

### Step 3: Install Missing Libraries

```bash
sudo apt update
sudo apt install -y \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2
```

### Step 4: Run the App

```bash
cd /home/balwant/kitchen-sink/phenixcoder/markdown
npm run dev -- README.md
```

## Option 3: Use WSLg (Windows 11 only)

If you're on Windows 11, WSLg provides built-in GUI support:

### Check if WSLg is available:

```bash
echo $DISPLAY
# Should output something like :0 or :1
```

If WSLg is enabled, you just need to install the missing libraries:

```bash
sudo apt install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2
```

Then run normally:
```bash
npm run dev
```

## Option 4: Build and Run on Native Windows

Clone the repo to Windows and run there:

```powershell
# In Windows PowerShell/CMD
cd C:\Users\YourName\Projects
git clone https://github.com/phenixcoder/markdown.git
cd markdown

# Install Node.js if needed, then:
npm install
npm run dev
```

## Troubleshooting

### "libnss3.so: cannot open shared object file"

Install the missing library:
```bash
sudo apt install libnss3
```

### "cannot open display"

Your X11 server isn't running or DISPLAY isn't set correctly:
```bash
# Check DISPLAY variable
echo $DISPLAY

# Test X11 connection
xeyes  # Should open a window with eyes
```

### Electron window doesn't appear

1. Make sure X11 server is running in Windows
2. Check Windows Firewall isn't blocking the connection
3. Try restarting the X11 server

### Performance issues

- Use X410 instead of VcXsrv (better performance)
- Or run from native Windows for best performance

## Current Status

✅ **What works in WSL2:**
- Vite dev server (http://localhost:5173)
- TypeScript compilation
- Testing (Vitest, Playwright)
- Building production binaries
- Git operations

❌ **What doesn't work without display server:**
- Electron GUI window
- Visual rendering
- File dialogs

## Recommended Workflow

**Development:** Use Windows to run the GUI  
**Building:** Use WSL2 (Linux build tools work better)  
**Git/CI:** Use WSL2 (native Linux environment)

---

**Questions?** Open an issue at https://github.com/phenixcoder/markdown/issues
