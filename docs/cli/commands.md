---
title: CLI Commands
description: Complete reference for VettCode CLI commands
order: 3
---

# VettCode CLI Commands

Complete reference for all VettCode CLI commands and options.

## Basic Usage

```bash
vettcode <command> [options]
```

## Commands

### `scan`

Scan a project for security vulnerabilities, secrets, and issues.

```bash
vettcode scan [path] [options]
```

**Arguments:**

- `path` - Path to scan (default: current directory)

**Options:**

- `--output <file>` - Export results to JSON file
- `--format <format>` - Output format: json, sarif, text (default: text)
- `--severity <level>` - Minimum severity: critical, high, medium, low (default: low)
- `--sensor <sensors>` - Enable specific sensors (comma-separated)
- `--disable <sensors>` - Disable specific sensors (comma-separated)
- `--no-color` - Disable colored output
- `--verbose` - Enable verbose logging
- `--quiet` - Suppress non-error output

**Examples:**

```bash
# Scan current directory
vettcode scan

# Scan specific directory
vettcode scan ./my-project

# Export results to JSON
vettcode scan . --output results.json

# Only show critical and high severity findings
vettcode scan . --severity high

# Use specific sensors only
vettcode scan . --sensor semgrep,osv

# Disable specific sensors
vettcode scan . --disable trivy
```

### `login`

Authenticate with VettCode Web to enable cloud features.

```bash
vettcode login
```

Opens your browser to authenticate. After login, you can:

- Upload scan results automatically
- Access cloud-based AI explanations
- Track scan history

**Example:**

```bash
vettcode login
# Opens browser for authentication
# Token is saved locally
```

### `logout`

Sign out of VettCode Web.

```bash
vettcode logout
```

Removes your authentication token from local storage.

### `whoami`

Display your current authentication status.

```bash
vettcode whoami
```

Shows:

- Whether you're logged in
- Your username/email
- Account tier (Free/Pro/Pro+)

### `version`

Display VettCode CLI version.

```bash
vettcode --version
# or
vettcode version
```

### `help`

Display help information.

```bash
vettcode --help
# or
vettcode help [command]
```

## Sensors

VettCode CLI uses multiple "sensors" to detect different types of issues:

### Available Sensors

- `semgrep` - Static analysis for code vulnerabilities
- `osv` - Dependency vulnerability scanning
- `gitleaks` - Secret detection
- `trivy` - Container and dependency scanning (experimental)

### Sensor Options

Enable or disable sensors:

```bash
# Enable only specific sensors
vettcode scan --sensor semgrep,osv

# Disable specific sensors
vettcode scan --disable trivy

# Disable all but one
vettcode scan --sensor gitleaks
```

## Output Formats

### JSON Format

Machine-readable JSON output:

```bash
vettcode scan . --format json --output results.json
```

Use this format to:

- Upload to VettCode Web
- Integrate with CI/CD
- Process with custom tools

### SARIF Format

Static Analysis Results Interchange Format:

```bash
vettcode scan . --format sarif --output results.sarif
```

Compatible with:

- GitHub Code Scanning
- Azure DevOps
- GitLab Security Dashboard

### Text Format (Default)

Human-readable terminal output:

```bash
vettcode scan .
```

Features:

- Colored severity indicators
- Organized by severity
- Code snippets
- File paths and line numbers

## Advanced Usage

### CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Security Scan
on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm install -g vettcode-cli
      - run: vettcode scan . --output results.json
      - run: vettcode scan . --format sarif --output results.sarif
      - uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: results.sarif
```

### Pre-Commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
vettcode scan . --severity high --quiet
if [ $? -ne 0 ]; then
  echo "Security scan failed. Fix issues before committing."
  exit 1
fi
```

### Monorepo Scanning

Scan multiple packages:

```bash
# Scan each package
for dir in packages/*; do
  echo "Scanning $dir..."
  vettcode scan "$dir" --output "results-$(basename $dir).json"
done
```

## Exit Codes

- `0` - No issues found or scan completed successfully
- `1` - Critical or high severity issues found
- `2` - Command error or invalid arguments

## Environment Variables

- `VETTCODE_TOKEN` - Authentication token (set by `vettcode login`)
- `VETTCODE_API_URL` - API endpoint (default: production)
- `NO_COLOR` - Disable colored output (any value)

## Configuration File

Create `.vettcoderc.json` in your project root:

```json
{
  "severity": "high",
  "sensors": ["semgrep", "osv", "gitleaks"],
  "output": {
    "format": "json",
    "file": "security-results.json"
  },
  "ignore": ["node_modules/**", "test/**/*.test.js"]
}
```

## Next Steps

- [Configuration](./configuration) - Advanced configuration options
- [Web Dashboard](/docs/web/overview) - Upload results for AI analysis
- [CI/CD Integration](./ci-cd) - Integrate with your pipeline
