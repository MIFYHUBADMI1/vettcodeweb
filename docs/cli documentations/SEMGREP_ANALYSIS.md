# Semgrep Built-in Implementation - Analysis & Options

## 🎯 Goal

Create a built-in Semgrep sensor (like we did for Gitleaks and OSV-Scanner) so VettCode doesn't require external binary installation.

## ⚠️ Challenge: Fundamental Architectural Difference

### Gitleaks & OSV-Scanner (Achievable ✅)

**Pattern Matching Method**: Regex-based

- **Gitleaks**: 222 regex patterns + entropy calculation
- **OSV-Scanner**: API calls + lockfile parsing (40+ formats)
- **Implementation**: ~500-1000 lines of TypeScript
- **Time**: 2-4 hours per sensor

### Semgrep (Extremely Complex ❌)

**Pattern Matching Method**: AST (Abstract Syntax Tree) based

- **Requires**: Full language parsers for 35+ languages
- **Requires**: AST pattern matching engine
- **Requires**: Dataflow analysis engine
- **Requires**: Taint tracking system
- **Implementation**: ~500,000+ lines of OCaml code
- **Time**: **6-12 months** of full-time development

---

## 📊 Semgrep Architecture (From Source Code)

### Core Components:

1. **Language Parsers** (35+ languages)
   - JavaScript/TypeScript
   - Python
   - Java
   - Go
   - Rust
   - Ruby
   - PHP
   - C/C++
   - C#
   - Swift
   - Kotlin
   - Scala
   - ... and 23 more

2. **AST Pattern Matcher**
   - Parses code into syntax trees
   - Matches patterns like `$X.decode(...)` across tree
   - Handles metavariables (`$JWT`, `$FUNC`, etc.)

3. **Dataflow Engine**
   - Tracks variable assignments
   - Follows data through function calls
   - Detects taint propagation

4. **Rule Engine**
   - YAML rule parser
   - Pattern composition (pattern-either, pattern-not, etc.)
   - Metadata handling

### Example Rule Complexity:

```yaml
patterns:
  - pattern: var $JWT = require('jsonwebtoken');
  - pattern: $JWT.decode(...);
  - pattern-not-inside: $JWT.verify(...);
```

**This requires**:

- Parsing JavaScript to AST
- Matching tree patterns across multiple lines
- Tracking variable assignments (`$JWT`)
- Understanding control flow

**Cannot be done with regex!**

---

## 💡 Practical Solutions

### Option 1: Bundle Semgrep Binary (RECOMMENDED) ⭐⭐⭐⭐⭐

**What**: Package pre-compiled Semgrep binaries with VettCode
**How**: Include binaries in npm package, auto-select by platform

**Pros**:

- ✅ Full industrial-grade Semgrep functionality
- ✅ All 35+ languages supported
- ✅ All advanced features (dataflow, taint tracking)
- ✅ Users get official Semgrep quality
- ✅ Minimal development effort (1-2 days)

**Cons**:

- ❌ Larger package size (~50-100MB)
- ❌ Still technically a "binary dependency"

**Implementation**:

```typescript
// Auto-detect platform and use bundled binary
class BundledSemgrepSensor extends BaseSensor {
  private getBinaryPath(): string {
    const platform = process.platform;
    const arch = process.arch;

    // Return path to bundled binary
    if (platform === "win32") {
      return path.join(__dirname, "..", "bin", "semgrep.exe");
    } else if (platform === "darwin") {
      if (arch === "arm64") {
        return path.join(__dirname, "..", "bin", "semgrep-macos-arm64");
      }
      return path.join(__dirname, "..", "bin", "semgrep-macos-x86");
    } else {
      return path.join(__dirname, "..", "bin", "semgrep-linux");
    }
  }
}
```

**Bundle Structure**:

```
vettcode/
├── bin/
│   ├── semgrep.exe           (Windows)
│   ├── semgrep-macos-arm64   (Mac M1/M2)
│   ├── semgrep-macos-x86     (Mac Intel)
│   └── semgrep-linux         (Linux)
└── src/
    └── sensors/
        └── bundled-semgrep-sensor.ts
```

---

### Option 2: Regex-Based "Lite" Version ⭐⭐⭐

**What**: Implement a subset of Semgrep rules using regex patterns
**How**: Extract common security patterns, implement with regex

**Pros**:

- ✅ Self-contained TypeScript
- ✅ No binary dependency
- ✅ Fast scanning
- ✅ Reasonable implementation time (2-4 weeks)

**Cons**:

- ❌ Limited to simple patterns (no AST)
- ❌ Cannot do dataflow/taint analysis
- ❌ ~20-30% of Semgrep capabilities
- ❌ Not "industrial standard"

**What We Could Detect**:

- SQL injection patterns (basic regex)
- Hardcoded secrets (already have Gitleaks)
- Dangerous function calls (`eval()`, `exec()`)
- HTTP without HTTPS
- Weak crypto algorithms
- Open redirects (basic patterns)

**What We CANNOT Detect**:

- Complex dataflow issues
- Taint tracking across functions
- Context-aware patterns
- Cross-file analysis
- Most advanced vulnerabilities

**Implementation**:

```typescript
// Simplified "Semgrep-lite" using regex
const SIMPLE_PATTERNS = [
  {
    id: "dangerous-eval",
    pattern: /\beval\s*\(/g,
    language: "javascript",
    message: "Dangerous use of eval()",
    severity: "HIGH",
  },
  {
    id: "sql-injection-basic",
    pattern: /query\s*\(\s*['"`].*\+.*['"`]\s*\)/g,
    language: "javascript",
    message: "Possible SQL injection",
    severity: "HIGH",
  },
];
```

---

### Option 3: Use Semgrep Cloud API ⭐⭐⭐⭐

**What**: Call Semgrep's hosted API instead of local binary
**How**: Send code to Semgrep API, receive results

**Pros**:

- ✅ No binary needed
- ✅ Always latest rules
- ✅ Full Semgrep functionality
- ✅ Easy implementation (1-2 days)

**Cons**:

- ❌ Requires internet connection
- ❌ Code sent to external service (privacy concern)
- ❌ May have rate limits
- ❌ May require API key/account

---

### Option 4: Rule Bundling (Hybrid Approach) ⭐⭐⭐⭐

**What**: Bundle curated Semgrep rule YAMLs, use Semgrep binary if available, fallback to basic patterns
**How**: Include ~100 most important rules, use binary when possible

**Pros**:

- ✅ Best of both worlds
- ✅ Full Semgrep when binary available
- ✅ Basic protection when not
- ✅ Portable rule format (YAML)

**Cons**:

- ❌ Still needs binary for full functionality
- ❌ Partial functionality without binary

---

## 📈 Recommendation: Option 1 (Bundle Binaries)

### Why This is the Best Approach:

1. **Industrial Standard Quality**
   - Users get 100% official Semgrep functionality
   - No compromises on detection capabilities

2. **Zero User Setup**
   - Binary auto-selected by platform
   - Works out of the box

3. **Maintainability**
   - We don't reimplement Semgrep
   - Updates = just replace binary

4. **Size is Acceptable**
   - Semgrep binary: ~50-80MB
   - Total package: ~100MB (reasonable for security tool)
   - Node modules are often larger!

5. **Legal & Open Source**
   - Semgrep is LGPL 2.1 licensed
   - We can redistribute binaries
   - Just need to include license

---

## 🚀 Implementation Plan (Option 1)

### Step 1: Download Semgrep Binaries

```bash
# Windows
curl -L https://github.com/semgrep/semgrep/releases/download/v1.55.0/semgrep-v1.55.0-windows-x86_64.zip

# macOS ARM64
curl -L https://github.com/semgrep/semgrep/releases/download/v1.55.0/semgrep-v1.55.0-macos-arm64.tar.gz

# macOS x86
curl -L https://github.com/semgrep/semgrep/releases/download/v1.55.0/semgrep-v1.55.0-macos-x86_64.tar.gz

# Linux
curl -L https://github.com/semgrep/semgrep/releases/download/v1.55.0/semgrep-v1.55.0-linux-x86_64.tar.gz
```

### Step 2: Create Bundled Sensor

```typescript
// src/sensors/bundled-semgrep-sensor.ts
export class BundledSemgrepSensor extends BaseSensor {
  name: SensorType = "semgrep";
  detects = "SAST / Code vulnerabilities (Bundled - 35+ languages)";

  async isAvailable(): Promise<boolean> {
    // Always available - we bundle the binary!
    return fs.existsSync(this.getBinaryPath());
  }

  getInstallInstructions(): string {
    return "Bundled - No installation required!";
  }

  private getBinaryPath(): string {
    const platform = process.platform;
    const arch = process.arch;
    const binDir = path.join(__dirname, "..", "..", "bin");

    if (platform === "win32") {
      return path.join(binDir, "semgrep.exe");
    } else if (platform === "darwin") {
      return path.join(
        binDir,
        arch === "arm64" ? "semgrep-macos-arm64" : "semgrep-macos-x86",
      );
    } else {
      return path.join(binDir, "semgrep-linux");
    }
  }

  async scan(targetPath: string): Promise<RawFinding[]> {
    const binaryPath = this.getBinaryPath();

    // Execute bundled Semgrep
    const result = execSync(
      `"${binaryPath}" scan --json --config=auto "${targetPath}"`,
      { encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 },
    );

    return this.parseOutput(result);
  }
}
```

### Step 3: Bundle in package.json

```json
{
  "files": ["dist/**/*", "bin/**/*"],
  "scripts": {
    "postinstall": "node scripts/chmod-binaries.js"
  }
}
```

### Step 4: Post-install Script

```javascript
// scripts/chmod-binaries.js
// Make binaries executable on Unix systems
const fs = require("fs");
const path = require("path");

if (process.platform !== "win32") {
  const binDir = path.join(__dirname, "..", "bin");
  const binaries = fs.readdirSync(binDir);

  for (const binary of binaries) {
    if (!binary.endsWith(".exe")) {
      const binPath = path.join(binDir, binary);
      fs.chmodSync(binPath, 0o755);
    }
  }
}
```

---

## 📋 Summary

### What We CAN'T Do:

- ❌ Reimplement Semgrep from scratch (6-12 months work)
- ❌ Create AST parsers for 35+ languages
- ❌ Implement dataflow/taint analysis
- ❌ Match "industrial standard" quality with regex

### What We CAN Do:

- ✅ **Bundle Semgrep binaries** (RECOMMENDED - 1-2 days)
- ✅ Create regex-based "lite" version (2-4 weeks)
- ✅ Use Semgrep Cloud API (1-2 days)
- ✅ Hybrid approach with rule bundling (1 week)

### Recommendation:

**Implement Option 1 (Bundle Binaries)**

- Users get full Semgrep functionality
- Zero setup required
- Industrial-grade quality
- Minimal development time
- Package size acceptable (~100MB)

---

## 🎯 Next Steps

1. Download Semgrep binaries for all platforms
2. Create `bin/` directory in project
3. Implement `BundledSemgrepSensor`
4. Update `package.json` to include binaries
5. Add post-install script for permissions
6. Update documentation

**Time Estimate**: 1-2 days of work
**Result**: 100% self-contained VettCode with full Semgrep functionality

---

**Bottom Line**: Unlike Gitleaks (regex patterns) and OSV-Scanner (API + parsing), Semgrep requires sophisticated AST-based analysis that cannot be realistically reimplemented. **Bundling the official binary is the only practical way to provide industrial-grade Semgrep functionality.**
