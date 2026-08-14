# 🎯 VettCode Transformation - Single Scanner to Multi-Sensor Orchestrator

## What Changed

### Before: Single-Scanner Wrapper

```
VettCode → Semgrep → Raw Results → Simple Explanations
```

### After: Multi-Sensor Intelligence Platform

```
                    VettCode Orchestrator
                            ↓
          ┌─────────────────┼─────────────────┐
          ↓                 ↓                 ↓
       Semgrep          OSV-Scanner        Gitleaks
          ↓                 ↓                 ↓
      Code Vulns      Dependency Vulns    Secrets
          └─────────────────┼─────────────────┘
                            ↓
                    Normalization
                            ↓
                    Deduplication
                            ↓
                  Risk Prioritization
                            ↓
               Beginner-Friendly Explanations
```

## Key Architecture Changes

### 1. Sensor Abstraction Layer

**New Base Class:**

```typescript
abstract class BaseSensor {
  abstract name: SensorType;
  abstract detects: string;
  abstract isAvailable(): Promise<boolean>;
  abstract scan(targetPath: string): Promise<RawFinding[]>;
  abstract getInstallInstructions(): string;
}
```

**Current Sensors:**

- `SemgrepSensor` - SAST (code vulnerabilities)
- `OSVSensor` - SCA (dependency vulnerabilities)
- `GitleaksSensor` - Secret detection
- `TrivySensor` - Multi-purpose (optional)

### 2. Unified Finding Format

**Before:** Each scanner had its own format

**After:** Single normalized format

```typescript
interface NormalizedFinding {
  id: string;
  sensor: SensorType;
  category: FindingCategory; // CODE, DEPENDENCY, SECRET, etc.
  severity: Severity; // CRITICAL, HIGH, MEDIUM, LOW, INFO
  title: string;
  message: string;
  filePath: string;
  lineNumber?: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  metadata: {
    ruleId?: string;
    packageName?: string;
    cve?: string;
    references?: string[];
  };
}
```

### 3. Orchestrator Pipeline

```typescript
class Orchestrator {
  async scan(targetPath: string): Promise<ScanResult> {
    // 1. Check sensor availability
    // 2. Map project structure
    // 3. Run all sensors in parallel
    // 4. Normalize findings
    // 5. Deduplicate across sensors
    // 6. Enrich with context
    // 7. Prioritize by risk
    // 8. Return unified results
  }
}
```

### 4. Smart Deduplication

**Problem:** Multiple sensors find the same issue

- OSV-Scanner finds `lodash@4.17.15` vulnerable
- Trivy also finds `lodash@4.17.15` vulnerable

**Solution:** Deduplicator keeps most authoritative source

```typescript
class FindingDeduplicator {
  deduplicate(findings: NormalizedFinding[]): NormalizedFinding[] {
    // Group by content, not ID
    // Prefer authoritative sensor
    // OSV > Trivy for dependencies
    // Gitleaks for secrets
    // Semgrep for code
  }
}
```

### 5. Risk-Based Prioritization

**Before:** Sort by severity only

**After:** Calculate risk score

```typescript
class RiskPrioritizer {
  calculateRiskScore(finding: NormalizedFinding): number {
    let score = baseSeverityScore;
    score *= categoryMultiplier; // Secrets > Code > Dependencies
    score *= confidenceMultiplier; // High > Medium > Low
    if (hasKnownExploit) score *= 1.3;
    if (isCVE) score *= 1.2;
    return score;
  }
}
```

## New User Experience

### Command Changes

**Before:**

```bash
vettcode scan .              # Only scans with Semgrep
vettcode install             # Install Semgrep
```

**After:**

```bash
vettcode scan .              # Orchestrates all available sensors
vettcode setup               # Shows how to install ALL sensors
vettcode install             # [Legacy] Semgrep only
```

### Output Changes

**Before:**

```
✓ Semgrep is installed
✓ Scan complete
✓ Analysis complete

Total issues found: 5
Showing top 3 critical issues:
[Shows findings from Semgrep only]
```

**After:**

```
✓ Found 3 sensor(s)
  Using:
    ✓ semgrep - SAST / Insecure code patterns
    ✓ osv-scanner - Vulnerable dependencies
    ✓ gitleaks - Secrets / Credentials

✓ Project mapped
✓ semgrep complete (5 findings)
✓ osv-scanner complete (2 findings)
✓ gitleaks complete (1 finding)
✓ Normalized 8 findings
✓ Deduplicated (removed 1)
✓ Context added
✓ Risk assessment complete

Analysis complete

Findings by severity:
  🔥 2 Critical
  🔴 3 High
  🟡 2 Medium
  ⚪ 1 Low

[Shows top findings from ALL sensors]

Scanned with: semgrep, osv-scanner, gitleaks
```

## Coverage Expansion

### Before (Semgrep Only)

- ✓ Code vulnerabilities (SQL injection, XSS, etc.)
- ✗ Dependency vulnerabilities
- ✗ Secret detection
- ✗ Infrastructure issues

### After (Multi-Sensor)

- ✓ Code vulnerabilities (Semgrep)
- ✓ Dependency vulnerabilities (OSV-Scanner)
- ✓ Secret detection (Gitleaks)
- ✓ Infrastructure issues (Trivy - optional)

## File Structure Changes

### New Files Created

```
src/
├── types/
│   └── findings.ts                 # ← NEW: Unified types
├── sensors/
│   ├── base-sensor.ts             # ← NEW: Sensor interface
│   ├── semgrep-sensor.ts          # ← NEW: Semgrep wrapper
│   ├── osv-sensor.ts              # ← NEW: OSV-Scanner integration
│   ├── gitleaks-sensor.ts         # ← NEW: Gitleaks integration
│   ├── trivy-sensor.ts            # ← NEW: Trivy integration
│   └── sensor-registry.ts         # ← NEW: Sensor management
├── orchestrator/
│   ├── orchestrator.ts            # ← NEW: Main coordinator
│   ├── normalizer.ts              # ← NEW: Format unification
│   ├── deduplicator.ts            # ← NEW: Duplicate removal
│   └── prioritizer.ts             # ← NEW: Risk scoring
```

### Modified Files

```
src/
├── cli.ts                         # ← MODIFIED: Uses orchestrator
├── formatter/output.ts            # ← MODIFIED: Handles new severities
```

### Deprecated Files

```
src/
├── scanner/semgrep.ts             # ← OLD: Direct Semgrep integration
├── parser/parser.ts               # ← OLD: Semgrep-specific parsing
├── analyzer/prioritize.ts         # ← OLD: Simple severity sorting
```

## Benefits of New Architecture

### 1. Comprehensive Coverage

- **3 dimensions** of security (code, dependencies, secrets)
- **Best tool** for each category
- **Automatic** coordination

### 2. Pluggable Design

```typescript
// Adding a new sensor is trivial:
class NewSensor extends BaseSensor {
  // Implement 3 methods
}
// Register it
// Done!
```

### 3. Smarter Results

- **Deduplication** across tools
- **Risk-based** prioritization
- **Confidence** scoring
- **Context-aware** analysis

### 4. Better UX

- User sees **unified results**
- Don't need to know which tool found what
- **Clear guidance** on missing sensors
- **Progressive enhancement** (works with any subset of sensors)

## Migration for Users

### If User Has Semgrep Installed

**Before:**

```bash
vettcode scan .  # Works
```

**After:**

```bash
vettcode scan .  # Still works! (uses Semgrep only)
# Shows warning about missing sensors
```

### If User Installs All Sensors

**Before:**

```bash
vettcode scan .  # Only uses Semgrep
```

**After:**

```bash
vettcode scan .  # Uses all 3 sensors automatically!
# Better coverage, no configuration needed
```

## Technical Highlights

### Sensor Detection

```typescript
// Automatically detects what's installed
const availability = await registry.checkAvailability();
// Runs only available sensors
// Shows instructions for missing ones
```

### Normalization Example

```typescript
// Semgrep finding
{
  check_id: "javascript.express.security.sql-injection",
  severity: "ERROR",
  path: "auth.js",
  start: { line: 42 }
}

// Normalized to
{
  id: "abc123",
  sensor: "semgrep",
  category: "CODE",
  severity: "HIGH",
  title: "SQL Injection",
  filePath: "auth.js",
  lineNumber: 42
}
```

### Deduplication Example

```typescript
// Input:
- OSV: lodash@4.17.15 has CVE-2021-1234
- Trivy: lodash@4.17.15 has CVE-2021-1234

// Output:
- OSV: lodash@4.17.15 has CVE-2021-1234
// (kept OSV as it's authoritative for dependencies)
```

## What Users See

### Sensor Missing - Graceful Degradation

```
✓ Found 1 sensor(s)
  Using:
    ✓ semgrep - SAST / Insecure code patterns
  Skipped:
    ⊘ osv-scanner - Vulnerable dependencies
    ⊘ gitleaks - Secrets / Credentials

⚠️  Some sensors were not available: osv-scanner, gitleaks
   Run: vettcode setup (to install missing sensors)
```

### All Sensors Available

```
✓ Found 3 sensor(s)
  Using:
    ✓ semgrep - SAST / Insecure code patterns
    ✓ osv-scanner - Vulnerable dependencies
    ✓ gitleaks - Secrets / Credentials
```

## Performance Characteristics

### Before

- Single tool execution
- Sequential processing
- ~5-30 seconds typical

### After

- Parallel sensor execution
- Concurrent processing
- ~5-30 seconds typical (same or faster due to parallelization)
- Overhead: ~1 second for normalization/dedup

## Future Extensibility

### Easy to Add

- CodeQL sensor
- Snyk sensor
- Custom sensors
- Project-specific sensors

### Easy to Enhance

- ML-based verification
- Fix suggestions
- Code snippets
- Interactive mode

---

## Summary

✅ **Transformed** from single-scanner wrapper to multi-sensor orchestrator  
✅ **Maintained** backward compatibility  
✅ **Enhanced** coverage (code + dependencies + secrets)  
✅ **Improved** accuracy (deduplication, risk scoring)  
✅ **Preserved** beginner-friendly UX  
✅ **Enabled** future extensibility

**VettCode is now an intelligence platform, not just a scanner wrapper.** 🎯
