# 📦 Publishing VettCode to npm

This guide explains how to publish VettCode to npm so students can install it with `npm install -g vettcode`.

## Prerequisites

1. **npm account**: Sign up at https://www.npmjs.com/signup
2. **npm CLI logged in**: Run `npm login`

## Pre-Publishing Checklist

### 1. Update package.json

```json
{
  "name": "vettcode",
  "version": "1.0.0",
  "description": "Security coach for beginner developers - transforms Semgrep results into actionable guidance",
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/vettcode.git"
  },
  "homepage": "https://github.com/yourusername/vettcode#readme",
  "bugs": {
    "url": "https://github.com/yourusername/vettcode/issues"
  },
  "keywords": [
    "security",
    "semgrep",
    "cli",
    "code-analysis",
    "vulnerability-scanner",
    "security-tools",
    "education",
    "student",
    "beginner"
  ]
}
```

### 2. Verify Files to Publish

Create `.npmignore`:

```
# Source files
src/
tsconfig.json

# Development files
*.log
npm-debug.log*

# Testing
test/
*.test.js
test-sample.js

# IDE
.vscode/
.idea/

# Assets (not needed in package)
Assets/

# Documentation (large files)
*.md
!README.md
!QUICKSTART.md
```

### 3. Test Locally First

```bash
# Build the project
npm run build

# Test the build
npm start scan test-sample.js

# Pack it (creates a tarball)
npm pack

# Install locally from tarball
npm install -g vettcode-1.0.0.tgz

# Test installed version
vettcode scan .

# Uninstall after testing
npm uninstall -g vettcode
```

## Publishing Steps

### 1. Login to npm

```bash
npm login
```

Enter your username, password, and email.

### 2. Build the Project

```bash
npm run build
```

### 3. Publish

```bash
npm publish
```

### 4. Verify

```bash
# Check on npm
npm view vettcode

# Install globally
npm install -g vettcode

# Test
vettcode --version
vettcode help
```

## Post-Publishing

### Update README on npm

The README.md will automatically show on the npm package page.

### Add Badges

Add these to README.md:

```markdown
![npm version](https://img.shields.io/npm/v/vettcode)
![npm downloads](https://img.shields.io/npm/dm/vettcode)
![license](https://img.shields.io/npm/l/vettcode)
```

### Announce

- Post on social media
- Share with students
- Add to course materials

## Version Updates

When you make changes:

```bash
# Patch version (1.0.0 → 1.0.1)
npm version patch

# Minor version (1.0.0 → 1.1.0)
npm version minor

# Major version (1.0.0 → 2.0.0)
npm version major

# Then publish
npm publish
```

## Alternative: Scoped Package

If "vettcode" is taken, use a scoped package:

```json
{
  "name": "@yourusername/vettcode"
}
```

Then:

```bash
npm publish --access public
```

Users install with:

```bash
npm install -g @yourusername/vettcode
```

## Unpublishing (Emergency Only)

```bash
# Unpublish specific version
npm unpublish vettcode@1.0.0

# Unpublish all versions (not recommended)
npm unpublish vettcode --force
```

**Note**: You can only unpublish within 72 hours of publishing.

## Distribution Without npm

### GitHub Releases

1. Create a GitHub release
2. Users install with:

```bash
npm install -g https://github.com/yourusername/vettcode
```

### Direct Installation

Students can install from source:

```bash
git clone https://github.com/yourusername/vettcode
cd vettcode
npm install
npm run build
npm link
```

## Pricing

npm is **free** for public packages. Your package will be available to anyone worldwide at no cost.

## Support After Publishing

- Monitor GitHub issues
- Respond to npm comments
- Update documentation
- Fix bugs promptly
- Add requested features

## Success Metrics

Track:

- npm downloads (`npm view vettcode`)
- GitHub stars
- Issues/PRs
- User feedback

---

**Ready to share VettCode with the world!** 🌍

Once published, any student can install with:

```bash
npm install -g vettcode
```

And start learning security immediately! 🛡️
