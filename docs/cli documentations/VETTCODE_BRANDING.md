# VettCode Branding Guide

## Overview

VettCode is a **self-contained security analysis platform** for developers. All external tools are abstracted behind VettCode's branding to provide a unified, professional experience.

---

## 🎯 Core Principle

**Users interact with VettCode, not the underlying technologies.**

VettCode uses battle-tested open-source security tools as its foundation, but presents them under VettCode branding:

- **Secrets Detection** → VettCode Secrets Engine (based on Gitleaks 222+ rules)
- **Dependency Analysis** → VettCode Dependency Analyzer (based on OSV.dev)
- **Code Security** → VettCode Code Analysis Engine (based on Semgrep)

---

## 📦 What Users See

### Scan Output

```
  ____          _   _    ____          _
 \ \   / /__| |_| |_ / ___|___   __| | ___
  \ \ / / _ \ __| __| |   / _ \ / _` |/ _ \
   \ V /  __/ |_| |_| |__| (_) | (_| |  __/
    \_/ \___|\__|\__|\____\___/ \__,_|\___|
Security Coach for Developers

✓ Found 3 sensor(s)

  VettCode Security Analysis:
    ✓ Secret Detection - 222+ patterns (powered by VettCode secrets engine)
    ✓ Dependency Vulnerabilities - 40+ formats (powered by VettCode dependency analyzer)
    ✓ Code Security Analysis - 35+ languages (powered by VettCode SAST engine)
```

### Feature Descriptions

**Without Python:**

```
📝 Without Python - You Get:
  ✅ Secret Detection - 222+ patterns
  ✅ Dependency Vulnerabilities - 40+ formats
  ❌ Code Security Analysis - requires Python
```

**With Python:**

```
📝 With Python - Full VettCode:
  ✅ Secret Detection
  ✅ Dependency Vulnerabilities
  ✅ Code Security Analysis - 35+ languages
```

---

## 🔧 Installation Messages

### Python Installation

```
⚠️  Python 3.8+ Required for Full Functionality
Python enables VettCode's advanced code analysis features
Without Python, you still get comprehensive security scanning!
```

### Auto-Installation

```
💡 VettCode can automatically install Python for you.
   This enables full VettCode functionality (all security analysis features).

🤖 Auto-Installing Python
This will download and install Python 3.11 automatically.
```

### Success Messages

```
✅ Python is now available!
Full VettCode security analysis enabled.
```

---

## 📊 Sensor Branding

### Internal Name → User-Facing Description

| Internal Sensor | User-Facing Description                                                            |
| --------------- | ---------------------------------------------------------------------------------- |
| `gitleaks`      | Secret Detection - 222+ patterns (powered by VettCode secrets engine)              |
| `osv-scanner`   | Dependency Vulnerabilities - 40+ formats (powered by VettCode dependency analyzer) |
| `semgrep`       | Code Security Analysis - 35+ languages (powered by VettCode SAST engine)           |

---

## 🎨 Branding Guidelines

### ✅ DO Use

- "VettCode security analysis"
- "VettCode secrets engine"
- "VettCode dependency analyzer"
- "VettCode code analysis engine"
- "Powered by VettCode"
- "VettCode comprehensive scanning"

### ❌ DON'T Use

- Raw tool names (Semgrep, Gitleaks, OSV-Scanner) in user-facing messages
- "Sensors" (use "security analysis features" or "analysis engines")
- Technical implementation details in CLI output

### 💡 Exceptions

- Technical documentation can mention underlying tools
- Error messages can reference tool names for debugging
- Developer docs (README, ARCHITECTURE) explain the foundation

---

## 📝 Consistent Messaging

### Progress Messages

```
✓ Found 3 sensor(s)
✓ Project mapped
✓ Secret detection complete (2 findings)
✓ Dependency analysis complete (834 findings)
✓ Code analysis complete (15 findings)
✓ Normalized 851 findings
✓ Deduplicated (removed 554)
✓ Context added
✓ Risk assessment complete
```

### Summary Messages

```
Analysis complete

Findings by severity:
  🔴 5 Critical
  🟠 12 High
  🟡 28 Medium
  ⚪ 15 Low

Scanned with: VettCode security analysis
```

### Tips & Hints

```
💡 Tip: Install Python 3.8+ to enable advanced code analysis
   Run: vettcode setup for installation help
```

---

## 🏗️ Technical Foundation

While VettCode uses proven open-source tools as its foundation, we:

1. **Abstract the complexity** - Users don't need to know about individual tools
2. **Unified experience** - All results normalized and presented consistently
3. **Self-contained** - No manual tool installation required
4. **Professional branding** - Cohesive VettCode identity

### Attribution

VettCode acknowledges its foundation in documentation:

- README mentions the tools used
- ARCHITECTURE.md explains the technical implementation
- Source code includes proper attribution
- Open source licenses are respected

---

## 🎯 Brand Promise

**VettCode: Security Coach for Developers**

- Zero-setup security analysis
- Comprehensive scanning (secrets, dependencies, code)
- Beginner-friendly guidance
- Industrial-grade results

Users get professional security analysis without the complexity of managing multiple tools.

---

## 📄 Files Updated

### Branding Updates Applied:

- ✅ `src/sensors/source-semgrep-sensor.ts`
- ✅ `src/sensors/builtin-osv-sensor.ts`
- ✅ `src/sensors/builtin-gitleaks-sensor.ts`
- ✅ `src/utils/python-installer.ts`
- ✅ `src/cli.ts`
- ✅ `src/orchestrator/orchestrator.ts`

### Documentation:

- ✅ `README.md` (technical attribution maintained)
- ✅ `ARCHITECTURE.md` (explains foundation)
- ✅ `VETTCODE_BRANDING.md` (this file)

---

## 🚀 Result

VettCode presents as a **unified security platform** with its own professional identity, while leveraging battle-tested open-source tools under the hood. Users get:

1. **Simplified Experience** - One tool, not three
2. **Professional Branding** - Cohesive VettCode identity
3. **Zero Complexity** - No need to understand underlying architecture
4. **Full Attribution** - Proper credit in documentation

**Users interact with VettCode. Developers understand the foundation.**
