# 📥 VettCode Installation Guide for Students

This guide will walk you through installing VettCode step-by-step. Don't worry if you're new to this - we'll explain everything!

## What You Need

- **Node.js** (version 14 or higher)
- **Python** (for Semgrep)
- A terminal/command prompt

## Step-by-Step Installation

### Step 1: Install Node.js

**Why?** VettCode is built with Node.js.

1. Go to https://nodejs.org/
2. Download the **LTS** (Long Term Support) version
3. Run the installer
4. Accept all default settings

**Verify it worked:**

```bash
node --version
npm --version
```

You should see version numbers like `v18.17.0` and `9.6.7`.

---

### Step 2: Install Python

**Why?** Semgrep (the security scanner) needs Python.

#### Windows:

1. Go to https://www.python.org/downloads/
2. Download Python 3.10 or higher
3. **IMPORTANT:** Check ✅ "Add Python to PATH" during installation
4. Click "Install Now"

#### macOS:

Python usually comes pre-installed. To check:

```bash
python3 --version
```

If not installed, use Homebrew:

```bash
brew install python3
```

#### Linux (Ubuntu/Debian):

```bash
sudo apt update
sudo apt install python3 python3-pip
```

**Verify it worked:**

```bash
python --version
# or
python3 --version
```

---

### Step 3: Install VettCode

**Option A: Install from npm (when published)**

```bash
npm install -g vettcode
```

This will:

- Download VettCode
- Automatically try to install Semgrep
- Make `vettcode` command available everywhere

**Option B: Install from source (for developers)**

```bash
# Clone the repository
git clone <repository-url>
cd vettcode

# Install dependencies
npm install

# Build the project
npm run build

# Make it globally available
npm link
```

---

### Step 4: Verify Semgrep Installation

VettCode should have automatically installed Semgrep. Let's check:

```bash
semgrep --version
```

**If you see a version number:** ✅ You're all set! Skip to Step 5.

**If you see an error:** 👇 Continue below.

---

### Step 4b: Install Semgrep Manually (If Needed)

**Easiest Way - Use VettCode's installer:**

```bash
vettcode install
```

**Manual Installation:**

#### Windows:

```bash
pip install semgrep
```

#### macOS:

```bash
# Option 1 (recommended):
brew install semgrep

# Option 2:
pip3 install semgrep
```

#### Linux:

```bash
pip3 install semgrep
```

**Troubleshooting:**

- **"pip: command not found"**
  - Windows: Reinstall Python with "Add to PATH" checked
  - macOS/Linux: Try `pip3` instead of `pip`

- **"Permission denied"**
  - macOS/Linux: Add `sudo` before the command
  - Example: `sudo pip3 install semgrep`

- **Still not working?**
  - Visit: https://semgrep.dev/docs/getting-started/
  - Ask for help in the course forum/chat

---

### Step 5: Test VettCode

Let's make sure everything works!

1. **Create a test file:**

```bash
# Create a new folder
mkdir test-vettcode
cd test-vettcode

# Create a vulnerable test file
echo "const password = 'hardcoded123';" > test.js
```

2. **Run VettCode:**

```bash
vettcode scan .
```

3. **What you should see:**

```
 __     __   _   _    ____          _
 \ \   / /__| |_| |_ / ___|___   __| | ___
  \ \ / / _ \ __| __| |   / _ \ / _` |/ _ \
   \ V /  __/ |_| |_| |__| (_) | (_| |  __/
    \_/ \___|\__|\__|\____\___/ \__,_|\___|

Security Coach for Developers

✔ Semgrep is installed
✔ Scan complete
✔ Analysis complete
✔ Report ready

╭─────────────────────────────╮
│  VettCode Scan Report       │
╰─────────────────────────────╯

Total issues found: 1
Showing top 1 critical issues:

[Shows security issues found]
```

**If you see this:** 🎉 **Success!** VettCode is working!

---

## Common Issues & Solutions

### "vettcode: command not found"

**Cause:** VettCode wasn't installed globally or PATH is not set.

**Solution:**

```bash
# Try this:
npm link

# Or run directly:
node dist/index.js scan .
```

---

### "Semgrep is not installed"

**Cause:** Automatic installation failed.

**Solution:**

```bash
vettcode install
```

Or follow Step 4b above.

---

### "npm: command not found"

**Cause:** Node.js is not installed or not in PATH.

**Solution:**

1. Reinstall Node.js from https://nodejs.org/
2. Restart your terminal
3. Try again

---

### "pip: command not found"

**Cause:** Python is not installed or not in PATH.

**Solution:**

1. Reinstall Python
2. **Windows:** Check "Add Python to PATH"
3. Restart your terminal

---

## Next Steps

Now that VettCode is installed:

1. **Scan your own code:**

   ```bash
   cd /path/to/your/project
   vettcode scan .
   ```

2. **Learn from the results:**
   - Read each explanation
   - Understand why it's a problem
   - Apply the fixes

3. **Keep learning:**
   - Check out `USAGE.md` for more examples
   - Try fixing issues and re-scanning
   - Build secure coding habits!

---

## Getting Help

**Still stuck?**

1. Check the troubleshooting section above
2. Read the full documentation in `README.md`
3. Visit Semgrep's help: https://semgrep.dev/docs/getting-started/
4. Ask your instructor or peers

---

## Video Tutorial (Coming Soon)

We're working on video tutorials to make installation even easier!

---

Remember: Installation might seem tricky at first, but you only have to do it once. After that, VettCode is super easy to use! 💪

**Happy coding, and stay secure! 🛡️**
