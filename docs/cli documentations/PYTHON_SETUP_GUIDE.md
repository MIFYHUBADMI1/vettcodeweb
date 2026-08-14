# 🐍 Python Setup Guide for VettCode

## Why Python?

VettCode uses **three security sensors**:

1. ✅ **Gitleaks** - Always works (built-in TypeScript)
2. ✅ **OSV-Scanner** - Always works (built-in TypeScript)
3. ⚠️ **Semgrep** - Requires Python 3.8+

**Without Python**: You get 2 out of 3 sensors (secrets + dependencies)  
**With Python**: You get all 3 sensors (secrets + dependencies + SAST)

---

## Quick Check

```bash
# Check if you have Python
python --version
# or
python3 --version

# If you see "Python 3.8" or higher, you're good! ✅
```

---

## Installation Options

### 🪟 Windows

#### Option 1: Official Installer (Recommended)

1. Visit: https://www.python.org/downloads/
2. Download Python 3.11+ for Windows
3. Run installer
4. ✅ **IMPORTANT: Check "Add Python to PATH"**
5. Restart terminal

#### Option 2: Microsoft Store

1. Open Microsoft Store
2. Search for "Python 3.11"
3. Click "Get"
4. Restart terminal

#### Option 3: Command Line (winget)

```powershell
winget install Python.Python.3.11
```

### 🍎 macOS

#### Option 1: Homebrew (Recommended)

```bash
brew install python3
```

#### Option 2: Official Installer

1. Visit: https://www.python.org/downloads/macos/
2. Download Python 3.11+ for macOS
3. Run the installer package
4. Restart terminal

### 🐧 Linux

#### Ubuntu/Debian:

```bash
sudo apt update
sudo apt install python3 python3-pip
```

#### Fedora/RHEL:

```bash
sudo dnf install python3 python3-pip
```

#### Arch Linux:

```bash
sudo pacman -S python python-pip
```

---

## Using VettCode Setup Command

### Interactive Setup

```bash
vettcode setup
```

This will:

- ✅ Check if Python is installed
- 📋 Show installation instructions for your platform
- 🔍 Verify all sensors are working

### Auto-Install (Windows Only)

```bash
vettcode setup --auto
```

This attempts to install Python automatically using winget.

---

## Testing Your Installation

### After installing Python:

1. **Restart your terminal** (very important!)

2. **Verify Python**:

```bash
python --version
# or
python3 --version
```

3. **Test VettCode**:

```bash
vettcode scan .
```

You should see:

```
✓ Found 3 sensor(s)
  Using:
    ✓ gitleaks - Secrets / Credentials (Built-in - 222+ rules)
    ✓ osv-scanner - Vulnerable dependencies (Built-in - 40+ formats)
    ✓ semgrep - SAST / Code vulnerabilities (Source-based - 35+ languages)
```

---

## What You Get

### Without Python:

```
✅ Gitleaks (Secrets)
   - Detects 222+ types of credentials
   - API keys, tokens, private keys
   - Database passwords

✅ OSV-Scanner (Dependencies)
   - Scans 40+ lockfile formats
   - Finds known CVEs in dependencies
   - Checks for deprecated packages

❌ Semgrep (SAST)
   - Skipped (Python required)
```

### With Python:

```
✅ Gitleaks (Secrets)
   - All features

✅ OSV-Scanner (Dependencies)
   - All features

✅ Semgrep (SAST) ← NEW!
   - SQL injection detection
   - XSS vulnerability scanning
   - Insecure deserialization
   - Path traversal
   - Weak cryptography
   - And 1000+ more patterns
   - Supports 35+ languages
```

---

## Troubleshooting

### "Python was not found"

**Cause**: Python not installed or not in PATH

**Fix**:

1. Install Python using instructions above
2. **Important**: Restart your terminal
3. Try again

### "python3: command not found" (Windows)

**Cause**: On Windows, the command is `python` not `python3`

**Fix**: This is normal on Windows. VettCode automatically tries both commands.

### Semgrep still not working after installing Python

**Cause**: Terminal hasn't reloaded PATH

**Fix**:

1. Close and reopen your terminal
2. Run: `python --version` to verify
3. Try `vettcode scan .` again

### Want to use VettCode without Python?

**That's fine!** You still get:

- ✅ Secret detection (Gitleaks)
- ✅ Dependency scanning (OSV-Scanner)

Just run:

```bash
vettcode scan .
```

VettCode will show a helpful message about Python but will still scan with the available sensors.

---

## For System Administrators

### Corporate Environments

If you're deploying VettCode in a corporate environment:

1. **Pre-install Python**:

```bash
# Windows (GPO or SCCM)
winget install Python.Python.3.11 --silent

# Mac (Munki/Jamf)
brew install python3

# Linux (Ansible/Puppet)
apt install python3
```

2. **Verify Installation**:

```bash
python3 --version
```

3. **Test VettCode**:

```bash
npm install -g vettcode
vettcode scan /path/to/project
```

### Docker Deployment

```dockerfile
FROM node:18

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

# Install VettCode
RUN npm install -g vettcode

# Scan on container start
CMD ["vettcode", "scan", "/workspace"]
```

---

## FAQ

### Q: Why can't Semgrep be pure TypeScript like Gitleaks?

**A**: Semgrep uses **AST (Abstract Syntax Tree)** analysis, which requires parsers for 35+ programming languages. This is fundamentally different from Gitleaks' regex patterns. Reimplementing would take 6-12 months.

### Q: Do I need to install Semgrep separately?

**A**: No! VettCode includes Semgrep's **source code**. It runs Semgrep directly from the bundled source. You just need Python to execute it.

### Q: What version of Python do I need?

**A**: Python 3.8 or higher. We recommend Python 3.11+ for best performance.

### Q: Will this work offline?

**A**: Yes! Once Python is installed:

- ✅ Gitleaks: Works offline
- ✅ Semgrep: Works offline (runs from bundled source)
- ⚠️ OSV-Scanner: Needs internet (uses OSV.dev API)

### Q: Can I use pyenv, conda, or virtualenv?

**A**: Yes! As long as `python` or `python3` command works in your terminal, VettCode will find it.

---

## Summary

### Quick Start:

1. Install Python 3.8+ from python.org
2. Restart terminal
3. Run: `vettcode scan .`

### Optional:

Use `vettcode setup` for guided installation help

### Already Have Python?

Just run: `vettcode scan .` and enjoy all three sensors!

**VettCode makes security scanning accessible to everyone, even students with no technical knowledge!** 🎓🔒
