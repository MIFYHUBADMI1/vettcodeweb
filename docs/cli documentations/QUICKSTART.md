# ⚡ VettCode Quick Start

Get up and running in 2 minutes!

## Install

```bash
npm install -g vettcode
```

That's it! VettCode will automatically set up Semgrep for you.

## First Scan

```bash
# Go to your project
cd my-project

# Run VettCode
vettcode scan .
```

## What You'll See

```
✔ Semgrep is installed
✔ Scan complete
✔ Analysis complete
✔ Report ready

╭─────────────────────────────╮
│  VettCode Scan Report       │
╰─────────────────────────────╯

Total issues found: 5
Showing top 3 critical issues:
```

Each issue shows:

- **What's wrong**: Simple explanation
- **Why it matters**: Security impact
- **How to fix**: Actionable solution

## If Setup Fails

```bash
vettcode install
```

This will install Semgrep for you.

## Need Help?

```bash
vettcode help
```

---

**That's all you need to know to get started!** 🚀

For more details, check:

- `README.md` - Full documentation
- `INSTALL.md` - Detailed setup
- `USAGE.md` - Examples and tips
