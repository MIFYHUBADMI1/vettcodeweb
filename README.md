# VettCode Web Dashboard 🌐

AI-Powered Security Analysis Dashboard for VettCode

## Features

- 📤 **Upload JSON scan results** from VettCode CLI
- 🤖 **AI-powered explanations** using OpenAI/Claude
- ☁️ **Cloud storage** via ImageKit for scan history
- 📊 **Beautiful visualizations** of security findings
- 🎓 **Educational mode** with detailed security lessons
- 🔄 **Real-time processing** of findings

## Quick Start

### 1. Install Dependencies

```bash
cd C:\Users\USER\Desktop\VETTCODE\WEB
npm install
```

### 2. Configure Environment

Create `.env.local` file:

```env
# ImageKit Configuration (for storing scan JSONs)
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# AI Configuration (OpenAI or compatible)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Optional: Use Claude instead
# ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

## Usage

### From CLI

```bash
# Scan and save results
vettcode scan . --output results.json

# Upload to web dashboard (copy to clipboard)
# Then go to http://localhost:3000 and paste/upload
```

### Web Interface

1. **Upload JSON** - Drag & drop or paste scan results
2. **View Dashboard** - See all findings with severity breakdown
3. **Get AI Explanations** - Click any finding for detailed AI explanation
4. **Learn Security** - Educational mode with examples and lessons
5. **Export Report** - Generate PDF/HTML reports

## Architecture

```
┌─────────────┐
│ VettCode CLI│ (Scans code)
└──────┬──────┘
       │ --output results.json
       ↓
┌─────────────┐
│ JSON Export │ (Finding data)
└──────┬──────┘
       │ Upload
       ↓
┌─────────────┐
│  ImageKit   │ (Cloud storage)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Web Dashboard│ (Display + AI processing)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ OpenAI/Claude│ (Generate explanations)
└─────────────┘
```

## Features in Detail

### 📤 Upload Methods

- **Drag & Drop** - Drop JSON file onto dashboard
- **File Picker** - Browse and select JSON file
- **Paste JSON** - Copy/paste JSON directly
- **URL Import** - Import from ImageKit URL

### 🤖 AI Processing

- **Template Matching** - Fast, offline explanations
- **LLM Enhancement** - Rich, contextual AI explanations
- **Code Examples** - Before/after fix examples
- **Learning Mode** - Security education built-in

### 📊 Visualizations

- **Severity Chart** - Pie chart of finding distribution
- **Confidence Scores** - Visual confidence indicators
- **File Heatmap** - Which files have most issues
- **Trend Analysis** - Track improvements over time

### 🎓 Educational Features

- **Security Lessons** - Learn as you fix
- **Fix Walkthroughs** - Step-by-step guides
- **Best Practices** - Industry standard recommendations
- **Code Examples** - Real-world secure code patterns

## Tech Stack

- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **Storage**: ImageKit (JSON storage)
- **AI**: OpenAI / Claude
- **Deployment**: Vercel
- **UI Components**: Radix UI

## Environment Variables

| Variable                | Description                       | Required |
| ----------------------- | --------------------------------- | -------- |
| `IMAGEKIT_PUBLIC_KEY`   | ImageKit public key               | Yes      |
| `IMAGEKIT_PRIVATE_KEY`  | ImageKit private key              | Yes      |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint             | Yes      |
| `OPENAI_API_KEY`        | OpenAI API key                    | Yes\*    |
| `OPENAI_MODEL`          | Model name (default: gpt-4o-mini) | No       |
| `ANTHROPIC_API_KEY`     | Claude API key (alternative)      | Yes\*    |

\*One AI provider required

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual

```bash
npm run build
npm start
```

## File Structure

```
WEB/
├── app/
│   ├── page.tsx           # Main dashboard
│   ├── layout.tsx         # Root layout
│   ├── api/
│   │   ├── explain/       # AI explanation endpoint
│   │   ├── upload/        # ImageKit upload
│   │   └── scan/          # Retrieve scans
├── components/
│   ├── UploadZone.tsx     # File upload component
│   ├── FindingCard.tsx    # Individual finding display
│   ├── Dashboard.tsx      # Main dashboard
│   └── ExplanationModal.tsx # AI explanation popup
├── lib/
│   ├── imagekit.ts        # ImageKit client
│   ├── ai.ts              # AI provider abstraction
│   └── types.ts           # TypeScript types
└── public/
    └── logo.svg
```

## License

Same as VettCode CLI
