# VettCode Web Dashboard - Quick Start

## 5-Minute Setup

### 1. Install Dependencies

```bash
cd C:\Users\USER\Desktop\VETTCODE\WEB
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
copy .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Get from https://imagekit.io/dashboard
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Test with Sample Data

From CLI:

```bash
cd C:\Users\USER\Desktop\VETTCODE
node dist/index.js scan test-sample.js --output results.json
```

Then upload `results.json` to the web dashboard.

## Done! 🎉

Your VettCode Web Dashboard is now running locally with AI-powered explanations!

## Next Steps

- [Deploy to Vercel](./DEPLOYMENT.md)
- Configure custom domain
- Set up team access
- Monitor usage

## Features to Try

1. **Upload JSON** - Drag & drop scan results
2. **View Dashboard** - See severity breakdown
3. **Get AI Explanations** - Click "Get AI Explanation" on any finding
4. **Filter Findings** - By severity or category
5. **Educational Mode** - Learn security best practices

## Troubleshooting

**Port 3000 already in use?**

```bash
PORT=3001 npm run dev
```

**ImageKit not working?**

- Verify credentials in `.env.local`
- Check ImageKit dashboard for API status

**AI explanations failing?**

- Verify OpenAI API key
- Check API usage/billing
- Templates will still work (offline mode)

## Architecture

```
CLI (scan) → JSON export → Web Dashboard (upload) → ImageKit (storage) → AI (explanations)
```

**Local Development:**

- Templates: Instant (offline)
- AI: Optional (requires API key)
- Storage: ImageKit (cloud)

**Production:**

- Deploy to Vercel (free tier)
- All features enabled
- Automatic HTTPS
