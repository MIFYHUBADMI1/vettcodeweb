# VettCode Testing Instructions

This guide shows you how to test VettCode to verify everything is working correctly.

---

## 🧪 Quick Test

### Test Single File

```bash
# Build VettCode first
npm run build

# Test scanning the sample file
node dist/index.js scan test-sample.js
```

**Expected Results:**

- ✅ Should detect **8+ secrets** (API keys, passwords, tokens)
- ✅ Should detect **10+ code vulnerabilities** (SQL injection, XSS, etc.)
- ✅ Should show VettCode branding (not tool names)

---

## 📦 Test With Dependencies

### Create Test Project

```bash
# Create test directory
mkdir test-project
cd test-project

# Copy test files
copy ..\test-sample.js app.js
copy ..\test-package.json package.json

# Create package-lock.json
npm install --package-lock-only

# Go back and scan
cd ..
node dist/index.js scan test-project
```

**Expected Results:**

- ✅ Should detect **8+ secrets**
- ✅ Should detect **10+ code vulnerabilities**
- ✅ Should detect **4+ vulnerable dependencies** (lodash, minimist, axios)
- ✅ Total findings: **20+ issues**

---

## 🎯 What Should Be Detected

### Secrets (VettCode Secrets Engine)

- [x] Stripe API key (`sk_live_...`)
- [x] OpenAI API key (`sk-proj-...`)
- [x] AWS Access Key (`AKIA...`)
- [x] AWS Secret Key
- [x] Database password
- [x] MongoDB connection string
- [x] GitHub token (`ghp_...`)
- [x] SSH private key
- [x] Slack webhook URL

### Code Vulnerabilities (VettCode Code Analysis)

- [x] SQL injection (string concatenation)
- [x] Command injection (exec with user input)
- [x] Code injection (eval)
- [x] Path traversal (no sanitization)
- [x] XSS (unescaped output)
- [x] Insecure random (Math.random)
- [x] Weak hashing (MD5)
- [x] Insecure CORS (allow \*)
- [x] Template injection
- [x] No input validation

### Vulnerable Dependencies (VettCode Dependency Analyzer)

- [x] lodash 4.17.19 - CVE-2020-8203 (Prototype Pollution)
- [x] minimist 1.2.5 - CVE-2021-44906 (Prototype Pollution)
- [x] axios 0.21.1 - CVE-2021-3749 (SSRF)
- [x] validator 10.8.0 - Multiple vulnerabilities

---

## 🔍 Verify Features

### 1. Branding Check

Output should show:

```
✓ VettCode Security Analysis:
  ✓ Secret Detection - 222+ patterns (powered by VettCode secrets engine)
  ✓ Dependency Vulnerabilities - 40+ formats (powered by VettCode dependency analyzer)
  ✓ Code Security Analysis - 35+ languages (powered by VettCode SAST engine)
```

**Should NOT show:** "Semgrep", "Gitleaks", "OSV-Scanner" in main output

### 2. Sensors Working

- ✅ Secrets engine finds API keys and passwords
- ✅ Dependency analyzer checks package.json/package-lock.json
- ✅ Code analysis detects SQL injection, XSS, etc. (requires Python)

### 3. Python Detection

If Python not installed:

```
⚠️  Python not found - required for VettCode's advanced code analysis
   You will still get comprehensive scanning (secrets + dependencies)
```

If Python installed:

```
✅ Python is now available!
Full VettCode security analysis enabled.
```

---

## 🐍 Python Requirements

For **full functionality** (all 3 engines), Python 3.8+ is required.

### Check Python

```bash
python --version
# or
python3 --version
```

### Install Python (if needed)

```bash
# Auto-install
node dist/index.js scan test-sample.js
# VettCode will offer to auto-install Python

# OR manual setup
node dist/index.js setup
```

---

## 📊 Expected Output Format

```
  ____          _   _    ____          _
 \ \   / /__| |_| |_ / ___|___   __| | ___
  \ \ / / _ \ __| __| |   / _ \ / _` |/ _ \
   \ V /  __/ |_| |_| |__| (_) | (_| |  __/
    \_/ \___|\__|\__|\____\___/ \__,_|\___|
Security Coach for Developers

✓ Found 3 sensor(s)

  VettCode Security Analysis:
    ✓ Secret Detection - 222+ patterns
    ✓ Dependency Vulnerabilities - 40+ formats
    ✓ Code Security Analysis - 35+ languages

✓ Project mapped
✓ Secret detection complete (8 findings)
✓ Dependency analysis complete (4 findings)
✓ Code analysis complete (10 findings)
✓ Normalized 22 findings
✓ Deduplicated (removed 0)
✓ Context added
✓ Risk assessment complete

Analysis complete

Findings by severity:
  🔴 5 Critical
  🟠 8 High
  🟡 7 Medium
  ⚪ 2 Low

🔴 Critical Issues (showing top 3):

1. Hardcoded Secret - Stripe API Key
   File: test-sample.js:15
   Secret: sk_live_REDACTED_EXAMPLE

2. SQL Injection Vulnerability
   File: test-sample.js:42
   User input directly in SQL query

3. AWS Credentials Exposed
   File: test-sample.js:18
   Access Key: AKIAIOSFODNN7EXAMPLE

💡 25 more issues found. Fix these top ones first!

Scanned with: VettCode security analysis
```

---

## ✅ Success Criteria

Your VettCode installation is working correctly if:

1. **Build succeeds** - `npm run build` completes without errors
2. **Scan runs** - `node dist/index.js scan test-sample.js` executes
3. **Secrets detected** - Finds API keys, passwords, tokens
4. **Dependencies scanned** - Checks package.json for vulnerabilities
5. **Code analyzed** - Detects SQL injection, XSS (if Python available)
6. **Branding correct** - Shows "VettCode" not "Semgrep/Gitleaks/OSV"
7. **Results formatted** - Clear severity levels, file locations, descriptions

---

## 🚨 Troubleshooting

### No findings detected

```bash
# Check if files are being read
node dist/index.js scan test-sample.js --verbose

# Verify test file exists
type test-sample.js
```

### Python not detected

```bash
# Check Python manually
python --version

# Run setup
node dist/index.js setup

# Try auto-install
node dist/index.js scan test-sample.js
# (Follow prompts to auto-install)
```

### Scan hangs or freezes

```bash
# Use a smaller test
echo "const API_KEY = 'sk_live_test123';" > simple-test.js
node dist/index.js scan simple-test.js
```

---

## 🧹 Cleanup

After testing:

```bash
# Remove test files
del test-sample.js
del test-package.json

# Remove test project
rmdir /s test-project
```

---

## 📝 Quick Commands Summary

```bash
# Build
npm run build

# Test single file (fastest)
node dist/index.js scan test-sample.js

# Test with dependencies
mkdir test-project
copy test-sample.js test-project\app.js
copy test-package.json test-project\package.json
cd test-project && npm install --package-lock-only && cd ..
node dist/index.js scan test-project

# Check setup
node dist/index.js setup

# View help
node dist/index.js help
```

---

## 🎉 Success!

If you see VettCode detecting secrets, dependencies, and code vulnerabilities with proper branding, **everything is working perfectly!**

You now have a self-contained security analysis platform ready to scan real projects.
