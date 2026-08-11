# VettCode Web Dashboard - Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **ImageKit Account**: Sign up at [imagekit.io](https://imagekit.io)
3. **OpenAI API Key**: Get from [platform.openai.com](https://platform.openai.com)

## Setup Steps

### 1. ImageKit Setup

1. Go to https://imagekit.io/dashboard
2. Create a new account (free tier available)
3. Get your credentials:
   - **Public Key**: Dashboard → Developer options → API Keys
   - **Private Key**: Dashboard → Developer options → API Keys
   - **URL Endpoint**: Dashboard → URL-endpoint

### 2. OpenAI Setup

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-...`)

### 3. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to WEB folder
cd C:\Users\USER\Desktop\VETTCODE\WEB

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? vettcode-dashboard
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add IMAGEKIT_PUBLIC_KEY
vercel env add IMAGEKIT_PRIVATE_KEY
vercel env add IMAGEKIT_URL_ENDPOINT
vercel env add OPENAI_API_KEY
vercel env add OPENAI_MODEL

# Deploy to production
vercel --prod
```

#### Option B: GitHub + Vercel (Automatic)

1. **Push to GitHub**:

   ```bash
   cd C:\Users\USER\Desktop\VETTCODE\WEB
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/vettcode-web.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure project:
     - Framework: Next.js
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: `.next`
   - Add environment variables:
     - `IMAGEKIT_PUBLIC_KEY`
     - `IMAGEKIT_PRIVATE_KEY`
     - `IMAGEKIT_URL_ENDPOINT`
     - `OPENAI_API_KEY`
     - `OPENAI_MODEL` (optional, defaults to `gpt-4o-mini`)
   - Click "Deploy"

3. **Automatic Deployments**:
   - Every push to `main` will trigger a new deployment
   - Preview deployments for PRs

### 4. Configure Environment Variables in Vercel

1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add each variable:

| Variable                | Value             | Environment                      |
| ----------------------- | ----------------- | -------------------------------- |
| `IMAGEKIT_PUBLIC_KEY`   | Your public key   | Production, Preview, Development |
| `IMAGEKIT_PRIVATE_KEY`  | Your private key  | Production, Preview, Development |
| `IMAGEKIT_URL_ENDPOINT` | Your URL endpoint | Production, Preview, Development |
| `OPENAI_API_KEY`        | Your OpenAI key   | Production, Preview, Development |
| `OPENAI_MODEL`          | `gpt-4o-mini`     | Production, Preview, Development |

4. Redeploy for changes to take effect

## Post-Deployment

### 1. Test the Deployment

```bash
# From CLI folder, generate a test scan
cd C:\Users\USER\Desktop\VETTCODE
node dist/index.js scan test-sample.js --output results.json

# Upload to your deployed dashboard
# Open https://your-app.vercel.app
# Upload results.json
```

### 2. Custom Domain (Optional)

1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### 3. Analytics (Optional)

Vercel provides built-in analytics:

- Project → Analytics
- See visitor count, page views, etc.

## Updating the Deployment

### Update Code

```bash
# Make changes
cd C:\Users\USER\Desktop\VETTCODE\WEB

# If using Vercel CLI
vercel --prod

# If using GitHub
git add .
git commit -m "Update dashboard"
git push
```

### Update Environment Variables

```bash
# Via CLI
vercel env add VARIABLE_NAME

# Or via dashboard
# Settings → Environment Variables → Edit
```

## Monitoring

### Logs

```bash
# View deployment logs
vercel logs

# View production logs
vercel logs --prod
```

### Error Tracking

- Vercel automatically captures errors
- View in Dashboard → Logs

## Troubleshooting

### Build Fails

```bash
# Test build locally
npm run build

# Check logs
vercel logs
```

### Environment Variables Not Working

1. Ensure variables are set for all environments
2. Redeploy after adding variables
3. Check variable names (case-sensitive)

### ImageKit Upload Fails

1. Verify ImageKit credentials
2. Check ImageKit dashboard for API limits
3. Ensure Public/Private keys are correct

### AI Explanations Not Working

1. Verify OpenAI API key
2. Check API usage limits
3. Verify key has billing enabled

## Cost Estimates

### Free Tier Limits

- **Vercel**:
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Free SSL

- **ImageKit**:
  - 20 GB bandwidth/month
  - 20 GB storage
  - Free SSL

- **OpenAI**:
  - Pay per use
  - GPT-4o-mini: ~$0.15 per 1M input tokens
  - Estimated: $0.01-0.05 per scan

### Typical Usage

- Small team (10 scans/day): **$0 - $5/month**
- Medium team (100 scans/day): **$5 - $20/month**
- Large team (1000+ scans/day): Consider caching & rate limiting

## Security

### Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Rotate API keys** regularly
3. **Use Vercel environment variables** - Never hardcode
4. **Enable ImageKit access control** if needed
5. **Monitor API usage** to detect abuse

### Rate Limiting

Add rate limiting for production:

```typescript
// app/api/explain/route.ts
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Add rate limiting
  const { success } = await rateLimit(request);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // ... rest of code
}
```

## Support

- **Vercel**: https://vercel.com/docs
- **ImageKit**: https://docs.imagekit.io
- **Next.js**: https://nextjs.org/docs
- **VettCode**: [Your support channel]

## Success!

Your VettCode Web Dashboard should now be live at:

- **Vercel URL**: https://your-app.vercel.app
- **Custom Domain**: https://your-domain.com (if configured)

🎉 Users can now upload scan results and get AI-powered explanations!
