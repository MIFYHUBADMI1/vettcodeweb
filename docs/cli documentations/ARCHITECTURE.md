# 🏗️ VettCode Architecture

## Overview

VettCode is **NOT a scanner**. It's an **orchestration and intelligence layer** that coordinates multiple specialized security sensors and transforms their findings into beginner-friendly guidance.

## Architecture Diagram

```
┌───────────────────────────────────────┐
│          VETTCODE CORE                │
│      Orchestrator + Intelligence      │
└───────────┬───────────────────────────┘
            │
      Sensor Interface
            │
    ┌───────┼───────┬───────┬──────────┐
    ↓       ↓       ↓       ↓          ↓
 Semgrep   OSV  Gitleaks  Trivy    CodeQL
  SAST     SCA   Secrets   IaC    (future)
```

## The Pipeline

```
Scanner Execution
       ↓
Raw Findings (sensor-specific formats)
       ↓
Finding Normalizer (unified format)
       ↓
Deduplication (remove redundant findings)
       ↓
Context Collection (gather project info)
       ↓
Verification Layer (validate findings)
       ↓
Risk Prioritizer (calculate actual risk)
       ↓
Explanation Engine (beginner-friendly)
       ↓
Learning Layer (educational content)
       ↓
VettCode UI (beautiful output)
```

## Sensor Stack

### Current Sensors (v0.1)

| Sensor          | Category | What It Detects         | Why We Chose It                                                   |
| --------------- | -------- | ----------------------- | ----------------------------------------------------------------- |
| **Semgrep**     | SAST     | Insecure code patterns  | Industry-standard, fast, customizable rules                       |
| **OSV-Scanner** | SCA      | Vulnerable dependencies | Official binaries, cross-platform, authoritative vulnerability DB |
| **Gitleaks**    | Secrets  | Exposed credentials     | Fast, accurate secret detection                                   |

### Optional Sensors

| Sensor     | Category | What It Detects                        | Status                           |
| ---------- | -------- | -------------------------------------- | -------------------------------- |
| **Trivy**  | Multi    | Dependencies, containers, IaC, configs | Implemented, disabled by default |
| **CodeQL** | SAST     | Deep semantic analysis                 | Planned for future               |

## Key Design Principles

### 1. Pluggable Architecture

Adding a new sensor requires:

1. Implement `BaseSensor` interface
2. Add to `SensorRegistry`
3. That's it - no changes to orchestrator

```typescript
class NewSensor extends BaseSensor {
  name = "new-sensor";
  detects = "New vulnerability type";

  async isAvailable(): Promise<boolean> {
    /* ... */
  }
  async scan(path: string): Promise<RawFinding[]> {
    /* ... */
  }
  getInstallInstructions(): string {
    /* ... */
  }
}
```

### 2. Unified Finding Format

Each sensor outputs different JSON structures. The **Normalizer** converts all findings to a single format:

```typescript
interface NormalizedFinding {
  id: string;
  sensor: SensorType;
  category: FindingCategory;
  severity: Severity;
  title: string;
  message: string;
  filePath: string;
  lineNumber?: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  metadata: {
    ruleId?: string;
    packageName?: string;
    secretType?: string;
    cve?: string;
    references?: string[];
  };
}
```

### 3. Intelligent Deduplication

Multiple sensors may find the same issue:

- OSV-Scanner finds vulnerable `lodash@4.17.15`
- Trivy also finds vulnerable `lodash@4.17.15`

**Deduplicator** removes redundancy and keeps the most authoritative source.

### 4. Risk-Based Prioritization

Not all "HIGH" severity findings are equally risky. **Prioritizer** considers:

- Base severity (CRITICAL > HIGH > MEDIUM > LOW)
- Finding category (secrets > code > dependencies)
- Confidence level
- Exploitability indicators
- CVE/CWE presence

**Risk Score Formula:**

```
score = base_severity × category_multiplier × confidence_multiplier
```

### 5. User Never Sees Sensors

User experience:

```bash
$ vettcode scan .

VETTCODE
Security Coach for Developers
─────────────────────────────

✓ Found 3 sensor(s)
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
  🔴 2 Critical
  🟠 3 High
  🟡 2 Medium
```

They don't need to know which sensor found what.

## Why This Architecture?

### Traditional Approach (Single Scanner)

- Limited to one detection method
- Vendor lock-in
- Gaps in coverage
- User must learn scanner quirks

### VettCode Approach (Orchestrator)

- ✅ Best-of-breed sensors for each category
- ✅ Comprehensive coverage (code, dependencies, secrets)
- ✅ Sensors are interchangeable
- ✅ Unified, beginner-friendly interface
- ✅ Can add/remove sensors without changing core

## Code Structure

```
src/
├── types/
│   └── findings.ts           # Unified type definitions
├── sensors/
│   ├── base-sensor.ts        # Sensor interface
│   ├── semgrep-sensor.ts     # Semgrep integration
│   ├── osv-sensor.ts         # OSV-Scanner integration
│   ├── gitleaks-sensor.ts    # Gitleaks integration
│   ├── trivy-sensor.ts       # Trivy integration
│   └── sensor-registry.ts    # Sensor management
├── orchestrator/
│   ├── orchestrator.ts       # Main coordinator
│   ├── normalizer.ts         # Format unification
│   ├── deduplicator.ts       # Duplicate removal
│   └── prioritizer.ts        # Risk scoring
├── formatter/
│   └── output.ts             # Beginner-friendly display
└── cli.ts                    # User commands
```

## Extending VettCode

### Adding a New Sensor

1. **Create sensor class:**

```typescript
// src/sensors/newsensor-sensor.ts
export class NewSensor extends BaseSensor {
  name: SensorType = "newsensor";
  detects = "What it finds";

  async isAvailable(): Promise<boolean> {
    // Check if installed
  }

  async scan(targetPath: string): Promise<RawFinding[]> {
    // Run sensor and return raw findings
  }

  getInstallInstructions(): string {
    // How to install
  }
}
```

2. **Register it:**

```typescript
// src/sensors/sensor-registry.ts
export const AVAILABLE_SENSORS = {
  // ... existing sensors
  newsensor: {
    sensor: new NewSensor(),
    enabled: true,
    required: false,
  },
};
```

3. **Add normalization logic:**

```typescript
// src/orchestrator/normalizer.ts
private normalizeNewSensor(raw: RawFinding): NormalizedFinding {
  // Convert sensor-specific format to unified format
}
```

Done! The orchestrator automatically uses it.

### Adding a New Finding Category

1. Update types:

```typescript
export type FindingCategory =
  | "CODE"
  | "DEPENDENCY"
  | "SECRET"
  | "INFRASTRUCTURE"
  | "CONFIG"
  | "NEW_CATEGORY";
```

2. Add explanations in formatter
3. Update deduplication logic (optional)

## Future Enhancements

### Verification Layer (Planned)

```
Finding → Is it reachable? → Confidence adjustment
       → Has exploit? → Risk increase
       → In test code? → Risk decrease
```

### Context Engine (Planned)

- Understand project structure
- Identify critical paths
- Map dependencies
- Detect framework usage

### Learning Engine (Planned)

- Track user's fixes
- Suggest patterns they often miss
- Personalize explanations

## Comparison with Alternatives

| Tool         | Type             | Strength                                     | Limitation           |
| ------------ | ---------------- | -------------------------------------------- | -------------------- |
| Semgrep      | Single scanner   | Fast SAST                                    | Only code analysis   |
| Snyk         | Multi-sensor     | Commercial, comprehensive                    | Paid, complex        |
| SonarQube    | Single platform  | Deep analysis                                | Heavy, complex setup |
| **VettCode** | **Orchestrator** | **Best-of-breed sensors, beginner-friendly** | **Early stage**      |

---

**VettCode is the brain. Sensors are the eyes.**

We don't try to see everything ourselves - we coordinate specialists and teach beginners what they found.
