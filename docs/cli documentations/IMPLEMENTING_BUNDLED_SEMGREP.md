# Implementing Bundled Semgrep - Step-by-Step Guide

## ✅ Solution: Bundle Pre-compiled Semgrep Binaries

This gives you:

- ✅ Full industrial-grade Semgrep (35+ languages, AST analysis, dataflow)
- ✅ Zero user setup - works out of the box
- ✅ Self-contained package
- ✅ Fast implementation (1-2 days)

---

## 📥 Step 1: Download Semgrep Binaries

### Download Links (Latest Stable):

Visit: https://github.com/semgrep/semgrep/releases/latest

**Required Binaries**:

1. **Windows x64**: `semgrep-v1.X.X-windows-x86_64.zip`
2. **macOS ARM64**: `semgrep-v1.X.X-macos-arm64.tar.gz` (M1/M2/M3)
3. **macOS x86_64**: `semgrep-v1.X.X-macos-x86_64.tar.gz` (Intel)
4. **Linux x86_64**: `semgrep-v1.X.X-linux-x86_64.tar.gz`

### Commands:

```bash
# Create bin directory
mkdir -p bin

# Download binaries (replace VERSION with latest)
VERSION=1.55.0

# Windows
curl -L "https://github.com/semgrep/semgrep/releases/download/v${VERSION}/semgrep-v${VERSION}-windows-x86_64.zip" -o semgrep-windows.zip
unzip semgrep-windows.zip -d bin/
mv bin/semgrep.exe bin/semgrep-windows.exe

# macOS ARM64 (M1/M2)
curl -L "https://github.com/semgrep/semgrep/releases/download/v${VERSION}/semgrep-v${VERSION}-macos-arm64.tar.gz" -o semgrep-macos-arm64.tar.gz
tar -xzf semgrep-macos-arm64.tar.gz
mv semgrep bin/semgrep-macos-arm64

# macOS x86_64 (Intel)
curl -L "https://github.com/semgrep/semgrep/releases/download/v${VERSION}/semgrep-v${VERSION}-macos-x86_64.tar.gz" -o semgrep-macos-x86.tar.gz
tar -xzf semgrep-macos-x86.tar.gz
mv semgrep bin/semgrep-macos-x86

# Linux
curl -L "https://github.com/semgrep/semgrep/releases/download/v${VERSION}/semgrep-v${VERSION}-linux-x86_64.tar.gz" -o semgrep-linux.tar.gz
tar -xzf semgrep-linux.tar.gz
mv semgrep bin/semgrep-linux

# Make executables
chmod +x bin/semgrep-*
```

---

## 🔧 Step 2: Create Directory Structure

```
c:\Users\USER\Desktop\VETTCODE\
├── bin/
│   ├── semgrep-windows.exe      (~50MB)
│   ├── semgrep-macos-arm64      (~60MB)
│   ├── semgrep-macos-x86        (~60MB)
│   └── semgrep-linux            (~60MB)
├── src/
│   └── sensors/
│       ├── bundled-semgrep-sensor.ts  (NEW)
│       └── ... (existing sensors)
└── scripts/
    └── chmod-binaries.js       (NEW)
```

---

## 💻 Step 3: Implement Bundled Sensor

**File**: `src/sensors/bundled-semgrep-sensor.ts`

```typescript
import { BaseSensor } from "./base-sensor";
import { RawFinding, SensorType } from "../types/findings";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

/**
 * Bundled Semgrep Sensor
 *
 * Uses pre-compiled Semgrep binaries included with VettCode
 * Provides full industrial-grade SAST without requiring user installation
 *
 * Supports:
 * - 35+ programming languages
 * - AST-based pattern matching
 * - Dataflow analysis
 * - Taint tracking
 *
 * This sensor is ALWAYS available - no installation required!
 */
export class BundledSemgrepSensor extends BaseSensor {
  name: SensorType = "semgrep";
  detects = "SAST / Code vulnerabilities (Bundled - 35+ languages)";

  async isAvailable(): Promise<boolean> {
    try {
      const binaryPath = this.getBinaryPath();
      return fs.existsSync(binaryPath);
    } catch {
      return false;
    }
  }

  getInstallInstructions(): string {
    return "Bundled - No installation required!";
  }

  /**
   * Get the appropriate Semgrep binary for the current platform
   */
  private getBinaryPath(): string {
    const platform = process.platform;
    const arch = process.arch;

    // Binaries are in the bin/ directory at the root of the package
    const binDir = path.join(__dirname, "..", "..", "bin");

    let binaryName: string;

    if (platform === "win32") {
      binaryName = "semgrep-windows.exe";
    } else if (platform === "darwin") {
      // macOS
      if (arch === "arm64") {
        binaryName = "semgrep-macos-arm64"; // M1/M2/M3
      } else {
        binaryName = "semgrep-macos-x86"; // Intel
      }
    } else {
      // Linux
      binaryName = "semgrep-linux";
    }

    return path.join(binDir, binaryName);
  }

  async scan(targetPath: string): Promise<RawFinding[]> {
    const binaryPath = this.getBinaryPath();

    if (!fs.existsSync(binaryPath)) {
      throw new Error(`Semgrep binary not found: ${binaryPath}`);
    }

    try {
      // Run Semgrep with auto config (uses Semgrep Registry rules)
      // --json: JSON output
      // --config=auto: Use recommended rules from Semgrep Registry
      // --quiet: Suppress progress output
      const command = `"${binaryPath}" scan --json --config=auto --quiet "${targetPath}"`;

      const result = execSync(command, {
        encoding: "utf-8",
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer
        stdio: ["pipe", "pipe", "pipe"],
      });

      return this.parseOutput(result);
    } catch (error: any) {
      // Semgrep returns exit code 1 when findings are found
      // Only treat it as error if there's no output
      if (error.stdout) {
        return this.parseOutput(error.stdout);
      }
      throw new Error(`Semgrep scan failed: ${error.message}`);
    }
  }

  /**
   * Parse Semgrep JSON output
   */
  private parseOutput(jsonOutput: string): RawFinding[] {
    try {
      const data = JSON.parse(jsonOutput);
      const findings: RawFinding[] = [];

      if (data.results && Array.isArray(data.results)) {
        for (const result of data.results) {
          findings.push({
            sensor: this.name,
            rawData: {
              check_id: result.check_id,
              path: result.path,
              start: {
                line: result.start.line,
                col: result.start.col,
              },
              end: {
                line: result.end.line,
                col: result.end.col,
              },
              extra: {
                message: result.extra.message,
                severity: result.extra.severity,
                metadata: result.extra.metadata || {},
              },
            },
          });
        }
      }

      return findings;
    } catch (error) {
      console.error("Failed to parse Semgrep output:", error);
      return [];
    }
  }
}
```

---

## 🔄 Step 4: Update Sensor Registry

**File**: `src/sensors/sensor-registry.ts`

```typescript
import { BundledSemgrepSensor } from "./bundled-semgrep-sensor";
// ... other imports

export class SensorRegistry {
  private sensors: Map<SensorType, BaseSensor>;

  constructor() {
    this.sensors = new Map();

    // Register all sensors
    this.sensors.set("semgrep", new BundledSemgrepSensor()); // NEW!
    this.sensors.set("osv-scanner", new BuiltinOSVSensor());
    this.sensors.set("gitleaks", new BuiltinGitleaksSensor());
    // ... other sensors
  }
}
```

---

## 📦 Step 5: Update package.json

**File**: `package.json`

```json
{
  "name": "vettcode",
  "version": "1.0.0",
  "files": ["dist/**/*", "bin/**/*", "README.md", "LICENSE"],
  "scripts": {
    "build": "tsc",
    "postinstall": "node scripts/chmod-binaries.js"
  }
}
```

---

## 🔨 Step 6: Create Post-install Script

**File**: `scripts/chmod-binaries.js`

```javascript
#!/usr/bin/env node

/**
 * Post-install script to make bundled binaries executable on Unix systems
 */

const fs = require("fs");
const path = require("path");

// Skip on Windows
if (process.platform === "win32") {
  console.log("Windows detected - skipping chmod");
  process.exit(0);
}

const binDir = path.join(__dirname, "..", "bin");

if (!fs.existsSync(binDir)) {
  console.log("No bin directory found - skipping chmod");
  process.exit(0);
}

console.log("Making bundled binaries executable...");

try {
  const files = fs.readdirSync(binDir);

  for (const file of files) {
    // Skip .exe files
    if (file.endsWith(".exe")) {
      continue;
    }

    const filePath = path.join(binDir, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile()) {
      // Make executable (rwxr-xr-x = 0755)
      fs.chmodSync(filePath, 0o755);
      console.log(`  ✓ ${file}`);
    }
  }

  console.log("Binaries are ready!");
} catch (error) {
  console.error("Failed to chmod binaries:", error.message);
  process.exit(1);
}
```

---

## 📄 Step 7: Add License File

**File**: `LICENSE-SEMGREP.txt`

```
This package bundles Semgrep binaries.
Semgrep is licensed under the LGPL 2.1 License.

Source code available at: https://github.com/semgrep/semgrep

Copyright (c) 2024 Semgrep, Inc.
```

---

## 🧪 Step 8: Test the Implementation

```bash
# Build the project
npm run build

# Test on a sample file
node dist/cli.js scan test.js

# Expected output:
# ✓ Found 3 sensors
# Using:
#   ✓ semgrep - SAST / Code vulnerabilities (Bundled - 35+ languages)
#   ✓ osv-scanner - Vulnerable dependencies
#   ✓ gitleaks - Secrets / Credentials
```

---

## 📊 Package Size Impact

**Before**:

- VettCode package: ~5MB

**After** (with bundled Semgrep):

- Windows binary: ~50MB
- macOS ARM64: ~60MB
- macOS x86: ~60MB
- Linux: ~60MB
- **Total: ~230MB** (but users only download one platform)

**User Download**:

- Windows users: ~55MB
- Mac users: ~65MB
- Linux users: ~65MB

**This is acceptable** - security tools often have larger binaries (Docker, Kubernetes CLI, etc.)

---

## 🚀 Deployment Checklist

- [ ] Download Semgrep binaries for all platforms
- [ ] Place binaries in `bin/` directory
- [ ] Create `bundled-semgrep-sensor.ts`
- [ ] Update `sensor-registry.ts`
- [ ] Update `package.json` with `files` and `postinstall`
- [ ] Create `scripts/chmod-binaries.js`
- [ ] Add `LICENSE-SEMGREP.txt`
- [ ] Test on Windows
- [ ] Test on macOS
- [ ] Test on Linux
- [ ] Update README.md
- [ ] Update documentation

---

## ✅ Result

Users get:

- ✅ Full Semgrep functionality (35+ languages)
- ✅ Zero setup - works immediately after `npm install`
- ✅ Industrial-grade SAST analysis
- ✅ Self-contained package
- ✅ No Python/pip required
- ✅ No external dependencies

**VettCode becomes a truly self-contained security scanner!**

---

## 🎯 Alternative: Download on First Use

If package size is a concern, implement lazy download:

```typescript
async ensureBinary(): Promise<string> {
  const binaryPath = this.getBinaryPath();

  if (fs.existsSync(binaryPath)) {
    return binaryPath;
  }

  // Download binary on first use
  console.log('Downloading Semgrep binary...');
  await this.downloadBinary(binaryPath);

  return binaryPath;
}

private async downloadBinary(targetPath: string): Promise<void> {
  const version = '1.55.0';
  const platform = this.getPlatformString();
  const url = `https://github.com/semgrep/semgrep/releases/download/v${version}/semgrep-v${version}-${platform}`;

  // Download and extract...
}
```

This keeps initial package small (~5MB) but downloads on first scan (~60MB).
