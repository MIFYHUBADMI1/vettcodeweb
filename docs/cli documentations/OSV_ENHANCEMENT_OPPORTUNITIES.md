# OSV-Scanner Enhancement Opportunities

Based on analysis of the official OSV-Scanner v2.5.0 source code, here are the key features that can be added to enhance our built-in implementation:

## ✅ ALREADY IMPLEMENTED

- ✅ 40+ lockfile format parsers (JavaScript, Python, Go, Rust, Java, Ruby, PHP, .NET, Dart, Elixir, C/C++, R, Haskell, Swift)
- ✅ node_modules scanning (installed artifacts)
- ✅ Git submodule scanning (C/C++ commit-based detection)
- ✅ OSV.dev API integration with batching (1000 queries)
- ✅ Depth limit increased to 20
- ✅ File size limit increased to 10MB

---

## 🎯 HIGH-VALUE FEATURES TO ADD

### 1. **Vulnerability Grouping by Aliases** ⭐⭐⭐⭐⭐

**Why**: Reduces noise and provides clearer results
**What**: Multiple CVE/vulnerability IDs often refer to the same issue
**Example**: CVE-2024-1234, GHSA-xxxx-yyyy, and OSV-2024-5678 might be the same vulnerability

**Implementation**:

```typescript
// Group vulnerabilities by their aliases
// One vulnerability with 3 aliases shows as 1 group, not 3 separate findings
interface GroupInfo {
  ids: string[]; // ["CVE-2024-1234", "GHSA-xxxx"]
  aliases: string[]; // All related identifiers
  maxSeverity: string; // Highest severity in group
}
```

**Files to reference**:

- `osv-scanner-2.5.0/internal/grouper/grouper.go`
- `osv-scanner-2.5.0/internal/grouper/grouper_models.go`

**Impact**: Cleaner output, easier to understand what needs fixing

---

### 2. **Transitive Dependency Resolution for Maven** ⭐⭐⭐⭐⭐

**Why**: Maven pom.xml files don't list transitive deps - this finds hidden vulnerabilities
**What**: Resolves the full dependency tree (direct + transitive dependencies)
**Example**: You depend on Spring, Spring depends on Jackson → finds Jackson vulnerabilities

**Implementation**:

```typescript
// Use deps.dev API to resolve transitive dependencies
// Currently we only scan direct dependencies in pom.xml
async resolveTransitiveDeps(pomXml: string): Promise<Package[]> {
  // Call https://api.deps.dev/v3/systems/maven/packages/{name}/versions/{version}
  // Parse dependency graph
  // Return all direct + transitive packages
}
```

**Files to reference**:

- `osv-scanner-2.5.0/internal/depsdev/depsdev.go`
- `osv-scanner-2.5.0/docs/supported_languages_and_lockfiles.md` (section on transitive scanning)

**Impact**: Finds many more vulnerabilities in Maven projects

---

### 3. **SBOM (Software Bill of Materials) Support** ⭐⭐⭐⭐

**Why**: Many organizations generate SBOM files (SPDX, CycloneDX) - we should scan them
**What**: Parse SPDX and CycloneDX SBOM formats to extract packages
**Example**: User provides `sbom.spdx.json` → we extract packages → check for vulns

**Implementation**:

```typescript
// Add SBOM parsers alongside lockfile parsers
parseSPDX(filePath: string): Package[]
parseCycloneDX(filePath: string): Package[]

// Detect SBOM files
isSBOM(filename: string): boolean {
  return filename.includes('sbom') ||
         filename.includes('spdx') ||
         filename.includes('cyclonedx');
}
```

**Files to reference**:

- `osv-scanner-2.5.0/internal/spdx/verify.go`
- `osv-scanner-2.5.0/pkg/models/cyclonedx.go`

**Impact**: Enterprise-friendly, supports modern supply chain practices

---

### 4. **Source Code Call Analysis (Go/Rust)** ⭐⭐⭐⭐

**Why**: Not all vulnerabilities are actually exploitable in your code
**What**: Analyze if vulnerable functions are actually CALLED in your code
**Example**: Package has vulnerability in function X, but you only use function Y → mark as "not called"

**Implementation**:

```typescript
// For Go projects: run govulncheck-style analysis
// For Rust projects: run cargo-audit style analysis
interface AnalysisInfo {
  called: boolean; // Is the vulnerable code path actually used?
  unimportant: boolean; // Is this likely not exploitable?
}
```

**Files to reference**:

- `osv-scanner-2.5.0/internal/sourceanalysis/go.go`
- `osv-scanner-2.5.0/internal/sourceanalysis/rust.go`
- `osv-scanner-2.5.0/internal/sourceanalysis/sourceanalysis.go`

**Impact**: Reduces false positives, helps prioritize real issues

**NOTE**: This is advanced and might be difficult to implement without Go toolchain

---

### 5. **License Violation Detection** ⭐⭐⭐

**Why**: Security is not just vulnerabilities - license compliance matters too
**What**: Check if packages use prohibited licenses (GPL in commercial code, etc.)
**Example**: User configures "no GPL licenses" → we flag GPL dependencies

**Implementation**:

```typescript
interface LicenseConfig {
  checkLicenses: boolean;
  allowlist: string[]; // ["MIT", "Apache-2.0", "BSD-3-Clause"]
  denylist: string[]; // ["GPL-3.0", "AGPL-3.0"]
}

// Parse package.json, Cargo.toml, etc. for license fields
// Flag violations in output
```

**Files to reference**:

- `osv-scanner-2.5.0/internal/spdx/licenses.go`
- `osv-scanner-2.5.0/pkg/models/results.go` (License fields)

**Impact**: Comprehensive security scanning (vulns + licenses)

---

### 6. **Container Image Scanning** ⭐⭐⭐⭐

**Why**: Scan Docker images for vulnerable system packages
**What**: Extract installed OS packages from container images
**Formats**:

- Alpine APK (`/lib/apk/db/installed`)
- Debian/Ubuntu dpkg (`/var/lib/dpkg/status`)
- Ubuntu chiseled (`/var/lib/chisel/manifest.wall`)

**Implementation**:

```typescript
// Parse container image metadata
parseAPKDatabase(filePath: string): Package[]
parseDPKGStatus(filePath: string): Package[]

// Or extract from tar archives of Docker images
scanDockerImage(imagePath: string): Package[]
```

**Files to reference**:

- `osv-scanner-2.5.0/pkg/models/image.go`
- `osv-scanner-2.5.0/docs/supported_languages_and_lockfiles.md` (Artifact section)

**Impact**: DevOps-friendly, scans production containers

---

### 7. **Offline Mode with Local Database** ⭐⭐⭐

**Why**: Some environments don't have internet access (air-gapped, CI/CD)
**What**: Download OSV database locally, query without API calls
**Example**: Download vulnerability DB once → scan without network

**Implementation**:

```typescript
// Download OSV database
async downloadDatabase(ecosystem: string): Promise<void> {
  // Download from https://osv-vulnerabilities.storage.googleapis.com/
  // Store in ~/.vettcode/osv-db/
}

// Query local database instead of API
queryLocalDatabase(packages: Package[]): Vulnerability[]
```

**Files to reference**:

- OSV database is available as JSON files per ecosystem
- Reference: https://osv.dev/docs/#tag/api

**Impact**: Works in restricted environments, faster scanning

---

### 8. **Custom Lockfile Support** ⭐⭐

**Why**: Some projects use custom dependency formats
**What**: Allow users to provide dependencies in standard JSON format
**Example**: User creates `osv-scanner.json` with their dependencies

**Implementation**:

```typescript
// Already defined in lockfile-parser.ts but need to document
parseCustomLockfile(filePath: string): Package[] {
  // Parse osv-scanner.json or osv-scanner-custom.json
  // Format: { results: [{ packages: [...] }] }
}
```

**Files to reference**:

- `osv-scanner-2.5.0/docs/supported_languages_and_lockfiles.md` (Custom Lockfiles section)

**Impact**: Maximum flexibility for unusual projects

---

### 9. **Deprecated Package Detection** ⭐⭐

**Why**: Using deprecated/unmaintained packages is a security risk
**What**: Flag packages marked as deprecated in registries
**Example**: npm package marked as deprecated → show warning

**Implementation**:

```typescript
// Query package registries for deprecation status
interface PackageInfo {
  deprecated: boolean;
  deprecationMessage?: string;
}
```

**Files to reference**:

- `osv-scanner-2.5.0/pkg/models/results.go` (Deprecated field)

**Impact**: Proactive security posture

---

### 10. **Binary Artifact Scanning** ⭐⭐⭐

**Why**: Find embedded dependencies in compiled binaries
**What**: Extract version info from Go binaries, Rust binaries with cargo-auditable
**Example**: Scan `myapp` binary → find embedded Go/Rust dependencies

**Implementation**:

```typescript
// Parse Go binary metadata
parseGoBinary(filePath: string): Package[]

// Parse Rust binary with cargo-auditable metadata
parseRustBinary(filePath: string): Package[]
```

**Files to reference**:

- `osv-scanner-2.5.0/docs/supported_languages_and_lockfiles.md` (Artifacts section)

**Impact**: Scan production binaries without source code

---

## 📊 PRIORITY RANKING

### Must-Have (High Impact, Reasonable Effort):

1. ⭐⭐⭐⭐⭐ **Vulnerability Grouping** - Easy to implement, huge UX improvement
2. ⭐⭐⭐⭐⭐ **Transitive Deps for Maven** - Critical for Java projects
3. ⭐⭐⭐⭐ **SBOM Support** - Enterprise requirement

### Should-Have (Good Impact):

4. ⭐⭐⭐⭐ **Container Image Scanning** - DevOps essential
5. ⭐⭐⭐⭐ **Source Call Analysis** - Advanced but very valuable
6. ⭐⭐⭐ **Offline Mode** - Important for restricted environments

### Nice-to-Have (Lower Priority):

7. ⭐⭐⭐ **License Detection** - Good for compliance
8. ⭐⭐⭐ **Binary Artifact Scanning** - Niche but useful
9. ⭐⭐ **Deprecated Detection** - Low effort, good value
10. ⭐⭐ **Custom Lockfile** - Already partially supported

---

## 🚀 RECOMMENDED NEXT STEPS

### Phase 1 (Quick Wins):

1. **Vulnerability Grouping** - Deduplicate aliases (1-2 hours)
2. **Deprecated Detection** - Check npm/pypi for deprecated flags (1 hour)
3. **Custom Lockfile** - Document existing support (30 min)

### Phase 2 (High Value):

4. **Transitive Deps** - Maven resolution via deps.dev API (3-4 hours)
5. **SBOM Support** - Parse SPDX/CycloneDX formats (2-3 hours)

### Phase 3 (Advanced):

6. **Container Scanning** - Parse APK/dpkg databases (2-3 hours)
7. **Offline Mode** - Download and query local DB (4-5 hours)
8. **License Detection** - Parse license fields (2 hours)

### Phase 4 (Future):

9. **Source Analysis** - Go/Rust call analysis (complex, 6-8 hours)
10. **Binary Scanning** - Parse compiled artifacts (4-5 hours)

---

## 💡 IMPLEMENTATION NOTES

### Current Built-in OSV Sensor Strengths:

- ✅ Comprehensive lockfile support (40+ formats)
- ✅ node_modules scanning (npm artifacts)
- ✅ Git submodule scanning (C/C++ commits)
- ✅ OSV.dev API integration with batching
- ✅ Self-contained (no external binary)

### Areas for Improvement:

- ❌ No vulnerability grouping (duplicate findings)
- ❌ No transitive dependency resolution (Maven)
- ❌ No SBOM support (enterprise gap)
- ❌ No container/image scanning (DevOps gap)
- ❌ No offline mode (air-gap issue)
- ❌ No license compliance checking
- ❌ No source code analysis (false positives)

### Technical Decisions:

- **API vs Local DB**: Currently uses OSV.dev API (online). Consider adding offline mode.
- **Transitive Deps**: Use deps.dev API (easier) vs native resolution (complex)
- **Container Scanning**: Parse extracted layers vs integrate with Docker API
- **Source Analysis**: Requires Go/Rust toolchain (complex) vs basic AST parsing

---

## 📝 SUMMARY

The current built-in OSV sensor is already **industrial-grade** in terms of lockfile coverage and basic scanning. The most impactful additions would be:

1. **Vulnerability Grouping** - Immediate UX improvement
2. **Transitive Dependencies** - Critical for Maven/Java
3. **SBOM Support** - Enterprise requirement

These three features would make VettCode's OSV sensor truly comprehensive and production-ready for all use cases.
