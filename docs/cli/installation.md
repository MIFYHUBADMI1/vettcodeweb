---
title: CLI Installation
description: How to install VettCode CLI on your system
order: 2
---

# VettCode CLI Installation

Get VettCode CLI installed and running on your system in minutes.

## Prerequisites

- Node.js 16 or higher
- npm or yarn package manager

## Installation Methods

### NPM (Recommended)

Install globally via npm:

```bash
npm install -g vettcode-cli
```

Verify installation:

```bash
vettcode --version
```

### Yarn

Install globally via yarn:

```bash
yarn global add vettcode-cli
```

### From Source

Clone and build from source:

```bash
git clone https://github.com/vettcode/cli.git
cd cli
npm install
npm run build
npm link
```

## Platform-Specific Notes

### Windows

VettCode CLI works on Windows 10/11. Make sure Node.js is in your PATH.

```powershell
# Check Node.js installation
node --version

# Install VettCode CLI
npm install -g vettcode-cli
```
### macOS

On macOS, you may need to use `sudo` for global installations:

```bash
sudo npm install -g vettcode-cli
```

Or use a Node version manager like `nvm` to avoid permission issues.

### Linux

Install Node.js via your package manager first:

```bash
# Ubuntu/Debian
sudo apt-get install nodejs npm

# Fedora
sudo dnf install nodejs npm

# Then install VettCode CLI
npm install -g vettcode-cli
```

## Verify Installation

Run a test scan to verify everything works:

```bash
# Create a test file
echo "const apiKey = 'sk-test123';" > test.js

# Scan it
vettcode scan test.js

# You should see secret detection findings
```

## Updating

Keep VettCode CLI up to date:

```bash
npm update -g vettcode-cli
```

## Uninstalling

Remove VettCode CLI:

```bash
npm uninstall -g vettcode-cli
```

## Troubleshooting

### Command Not Found

If you get "command not found" after installation:

1. Check npm global bin directory:

   ```bash
   npm config get prefix
   ```

2. Add it to your PATH:
   ```bash
   export PATH="$PATH:$(npm config get prefix)/bin"
   ```

### Permission Errors (macOS/Linux)

Use a Node version manager like `nvm` instead of system Node:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js
nvm install node

# Install VettCode CLI (no sudo needed)
npm install -g vettcode-cli
```

### Windows PowerShell Execution Policy

If you get execution policy errors on Windows:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Next Steps

- [Commands](./commands) - Learn CLI commands
- [Configuration](./configuration) - Configure scanning options
- [Quick Start](/docs/QUICKSTART) - Run your first scan
