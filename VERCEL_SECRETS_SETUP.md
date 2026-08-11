# Vercel Secrets Setup Guide

This guide shows you how to add all required environment variables to your Vercel project.

## Method 1: Using Vercel Dashboard (Recommended)

### Step 1: Go to Project Settings

1. Visit https://vercel.com/dashboard
2. Select your project: `vettcodeweb`
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Each Variable

Add the following environment variables one by one. Mark sensitive ones as **Secret**.

#### ImageKit Configuration

```
IMAGEKIT_PUBLIC_KEY = your_public_key_here
IMAGEKIT_PRIVATE_KEY = your_private_key_here (Secret)
IMAGEKIT_URL_ENDPOINT = https://ik.imagekit.io/your_id
```

#### OpenRouter (AI Provider)

```
OPENROUTER_API_KEY = sk-or-v1-your_key_here (Secret)
OPENROUTER_FREE_MODEL = google/gemma-2-9b-it:free
OPENROUTER_PAID_MODEL = anthropic/claude-3.5-sonnet
```

#### Groq (AI Provider)

```
GROQ_API_KEY = gsk_your_groq_api_key_here (Secret)
GROQ_MODEL = llama-3.1-70b-versatile
```

#### MongoDB Database

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/vettcode (Secret)
```

#### NextAuth.js Authentication

```
NEXTAUTH_URL = https://your-project.vercel.app
NEXTAUTH_SECRET = generate_random_32_char_string (Secret)
```

#### Google OAuth

```
GOOGLE_CLIENT_ID = your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = your_google_client_secret (Secret)
```

#### Email (Gmail SMTP)

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_USER = your-email@gmail.com
SMTP_PASSWORD = your_gmail_app_password (Secret)
SMTP_FROM = VettCode <noreply@vettcode.dev>
```

#### Application Settings

```
JWT_SECRET = generate_random_32_char_string (Secret)
```

#### Redis (Optional)

```
REDIS_URL = redis://your-redis-url (if using)
```

#### Subscription Limits (Already set in vercel.json)

```
FREE_DAILY_AI_LIMIT = 5
PRO_MONTHLY_AI_LIMIT = 150
PRO_PLUS_MONTHLY_AI_LIMIT = 500
```

### Step 3: Apply to Environments

For each variable, select which environments it applies to:

- ✅ **Production**
- ✅ **Preview**
- ✅ **Development** (optional)

---

## Method 2: Using Vercel CLI

If you prefer using the command line:

### Install Vercel CLI

```bash
npm i -g vercel
```

### Login to Vercel

```bash
vercel login
```

### Add Secrets (one by one)

```bash
# ImageKit
vercel secrets add imagekit-public-key "your_public_key"
vercel secrets add imagekit-private-key "your_private_key"
vercel secrets add imagekit-url-endpoint "https://ik.imagekit.io/your_id"

# OpenRouter
vercel secrets add openrouter-api-key "sk-or-v1-your_key"
vercel secrets add openrouter-free-model "google/gemma-2-9b-it:free"
vercel secrets add openrouter-paid-model "anthropic/claude-3.5-sonnet"

# Groq
vercel secrets add groq-api-key "gsk_your_groq_key"
vercel secrets add groq-model "llama-3.1-70b-versatile"

# MongoDB
vercel secrets add mongodb-uri "mongodb+srv://user:pass@cluster.mongodb.net/vettcode"

# NextAuth
vercel secrets add nextauth-url "https://your-project.vercel.app"
vercel secrets add nextauth-secret "your_32_char_secret"

# Google OAuth
vercel secrets add google-client-id "your_client_id.apps.googleusercontent.com"
vercel secrets add google-client-secret "your_client_secret"

# Email
vercel secrets add smtp-host "smtp.gmail.com"
vercel secrets add smtp-port "587"
vercel secrets add smtp-user "your-email@gmail.com"
vercel secrets add smtp-password "your_gmail_app_password"
vercel secrets add smtp-from "VettCode <noreply@vettcode.dev>"

# JWT
vercel secrets add jwt-secret "your_32_char_jwt_secret"

# Redis (optional)
vercel secrets add redis-url "redis://your-redis-url"
```

### Link Project

```bash
cd C:\Users\USER\Desktop\VETTCODE\WEB
vercel link
```

### Deploy

```bash
vercel --prod
```

---

## Method 3: Import from .env (Easiest)

If you have a working `.env` file locally:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click **"Import from .env"**
3. Paste your `.env` file contents
4. Click **"Import"**
5. Review and mark sensitive variables as **Secret**

---

## Generate Required Secrets

### NEXTAUTH_SECRET

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -base64 32
```

### JWT_SECRET

```bash
# Same as above
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Verify Setup

After adding all variables:

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click **"Redeploy"** (if needed)
3. Check deployment logs for any missing variable errors
4. Visit your deployed site to test

---

## Important Notes

⚠️ **Security Reminders:**

- Never commit `.env` files to Git
- Mark all API keys and passwords as **Secret** in Vercel
- Rotate secrets if they're ever exposed
- Use different secrets for Production vs Preview

📝 **After Deployment:**

- Update `NEXTAUTH_URL` to your actual Vercel domain
- Add your Vercel domain to Google OAuth authorized domains
- Test all features in Preview before promoting to Production

🔄 **Updating Secrets:**

- Changes to environment variables require a redeploy
- You can trigger a redeploy from Vercel Dashboard → Deployments → Redeploy

---

## Troubleshooting

### "Secret does not exist" Error

- Make sure secret names match exactly (case-sensitive)
- Use lowercase with hyphens: `imagekit-public-key` not `IMAGEKIT_PUBLIC_KEY`

### Variables Not Working

- Redeploy after adding new variables
- Check deployment logs for environment variable issues
- Verify variable names match your code

### Build Fails

- Ensure all **required** variables are set
- Optional variables (like REDIS_URL) can be left empty
- Check build logs for specific missing variables

---

## Quick Checklist

Before deploying, ensure you have:

- [ ] ImageKit credentials (3 variables)
- [ ] OpenRouter API key (3 variables)
- [ ] Groq API key (2 variables)
- [ ] MongoDB Atlas URI (1 variable)
- [ ] NextAuth URL and secret (2 variables)
- [ ] Google OAuth credentials (2 variables)
- [ ] Gmail SMTP credentials (5 variables)
- [ ] JWT secret (1 variable)
- [ ] Redis URL (optional)

**Total: 19 required variables + 1 optional**
