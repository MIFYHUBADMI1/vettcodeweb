# AI Provider Debug Tools Guide

## 🎯 Purpose

Two new debug tools to help you diagnose and test AI provider configuration:

1. **API Route** - `/api/debug/ai-providers`
2. **Web UI** - `/debug/ai-providers`

---

## 🚀 Quick Start

### Local Testing

```bash
# Start dev server
npm run dev

# Open browser to:
http://localhost:3000/debug/ai-providers
```

### Production Testing

After deployment, visit:

```
https://vettedcodewe.vercel.app/debug/ai-providers
```

---

## 📡 API Route Usage

### Basic Status Check

**Endpoint:** `GET /api/debug/ai-providers`

**Returns:**

- Environment variable status (SET or MISSING)
- Available providers count
- Model registry statistics
- Quick diagnostic message

**Example:**

```bash
curl https://vettedcodewe.vercel.app/api/debug/ai-providers
```

**Response:**

```json
{
  "status": "ok",
  "environment": {
    "OPENROUTER_API_KEY": "SET ✓",
    "GROQ_API_KEY": "MISSING ✗",
    "MONGODB_URI": "SET ✓",
    "NEXTAUTH_SECRET": "SET ✓"
  },
  "providers": {
    "totalAvailable": 1,
    "providers": [{ "name": "openrouter", "available": true }]
  },
  "modelRegistry": {
    "totalModels": 23,
    "byCost": { "free": 13, "paid": 10 },
    "byProvider": { "openrouter": 18, "groq": 5 }
  },
  "message": "✅ AI providers are configured correctly",
  "hint": "Add ?test=true to actually test API calls"
}
```

---

### Full API Test

**Endpoint:** `GET /api/debug/ai-providers?test=true`

**What it does:**

- Makes actual API calls to each provider
- Uses free models for testing (no cost)
- Measures response time
- Shows response preview

**Example:**

```bash
curl "https://vettedcodewe.vercel.app/api/debug/ai-providers?test=true"
```

**Response:**

```json
{
  "status": "ok",
  "summary": {
    "totalProviders": 1,
    "testsRun": 1,
    "passed": 1,
    "failed": 0
  },
  "testResults": [
    {
      "provider": "openrouter",
      "model": "nvidia/nemotron-3-ultra-550b-a55b:free",
      "success": true,
      "responseLength": 58,
      "responsePreview": "Hello from VettCode! I'm here to help with security.",
      "duration": 2341
    }
  ]
}
```

---

## 🖥️ Web UI Usage

### Features

1. **Environment Variables Card**
   - Shows which API keys are set
   - Visual indicators (✓ or ✗)
   - Green badge = configured
   - Red badge = missing

2. **Provider Status Card**
   - Lists all registered providers
   - Shows if they're ready
   - Total count

3. **Model Registry Card**
   - Total models available
   - Free vs paid breakdown
   - Models per tier (1-4)
   - Models per provider

4. **Test Results Card** (after clicking "Test API Calls")
   - Success/failure for each provider
   - Response time in milliseconds
   - Preview of actual AI response
   - Error messages if failed

### Actions

**Refresh Status** - Reload provider status (doesn't test API)
**Test API Calls** - Actually calls each provider (uses free models)

---

## 🔍 Interpreting Results

### ✅ Everything Working

```
Environment:
  OPENROUTER_API_KEY: SET ✓
  GROQ_API_KEY: SET ✓

Providers: 2 available

Test Results:
  ✓ openrouter (2341ms) - Success
  ✓ groq (1245ms) - Success
```

**Meaning:** Both providers configured and working!

---

### ⚠️ No Providers Available

```
Environment:
  OPENROUTER_API_KEY: MISSING ✗
  GROQ_API_KEY: MISSING ✗

Providers: 0 available

Message: ⚠️ No AI providers available
```

**Problem:** No API keys set
**Solution:** Set `OPENROUTER_API_KEY` in Vercel environment variables

---

### ⚠️ Provider Fails Test

```
Environment:
  OPENROUTER_API_KEY: SET ✓

Providers: 1 available

Test Results:
  ✗ openrouter - Error: 401 Unauthorized
```

**Problem:** API key is set but invalid
**Solution:**

- Check if key is correct
- Ensure no extra spaces
- Verify key isn't expired
- Check OpenRouter dashboard

---

### ⚠️ Rate Limited

```
Test Results:
  ✗ openrouter - Error: 429 Too Many Requests
```

**Problem:** Hit rate limit
**Solution:** Wait a few minutes and test again

---

## 🛠️ Troubleshooting

### Issue: Debug page shows 404

**Cause:** Route not deployed yet
**Fix:**

```bash
git pull origin main
npm run build
# Deploy to Vercel
```

---

### Issue: "No providers available" but key is set

**Checks:**

1. Is the key actually in Vercel environment variables?
2. Did you redeploy after setting the key?
3. Check build logs for provider registration messages

**Vercel Steps:**

1. Go to project settings
2. Environment Variables tab
3. Check `OPENROUTER_API_KEY` exists
4. Click "Redeploy" on latest deployment

---

### Issue: Test hangs or times out

**Cause:** Provider API might be slow or down
**Fix:**

- Check provider status page
- Try different provider (set GROQ_API_KEY)
- Wait and retry

---

## 📊 What Each Status Means

| Status        | Meaning                            | Action                    |
| ------------- | ---------------------------------- | ------------------------- |
| `SET ✓`       | Environment variable is configured | ✅ Good                   |
| `MISSING ✗`   | Environment variable not set       | ⚠️ Set it                 |
| `0 available` | No providers registered            | ⚠️ Set API keys           |
| `1 available` | One provider working               | ✅ Good (minimal)         |
| `2 available` | Both providers working             | ✅ Excellent (redundancy) |
| Test `passed` | API call successful                | ✅ Provider working       |
| Test `failed` | API call failed                    | ❌ Check error message    |

---

## 🎓 Best Practices

### 1. Test After Every Deployment

Always visit `/debug/ai-providers` after deploying to verify providers are working.

### 2. Set Both Providers

For redundancy, set both:

- `OPENROUTER_API_KEY` (primary)
- `GROQ_API_KEY` (backup)

If one fails, the system falls back to the other.

### 3. Monitor Logs

After testing, check Vercel logs for:

```
[AI-PROVIDER-REGISTRY] ✓ OpenRouter provider registered
[AI-PROVIDER-REGISTRY] Total providers registered: 1
```

### 4. Regular Health Checks

Bookmark the debug page and check it:

- After environment variable changes
- After code deployments
- If users report AI issues

---

## 🔐 Security Note

This debug endpoint exposes:

- ✅ Whether API keys are set (yes/no)
- ✅ Provider availability
- ✅ Model registry info
- ❌ NOT the actual API key values
- ❌ NOT sensitive secrets

**Production Consideration:**
In production, you may want to:

1. Require authentication to access `/debug/*` routes
2. Only enable in development/staging
3. Add IP whitelisting

---

## 📝 Example Workflow

### Scenario: Fresh Deployment

1. **Deploy to Vercel**

   ```bash
   git push origin main
   ```

2. **Visit Debug Page**

   ```
   https://vettedcodewe.vercel.app/debug/ai-providers
   ```

3. **Check Environment**
   - See `OPENROUTER_API_KEY: MISSING ✗`

4. **Set API Key**
   - Go to Vercel → Settings → Environment Variables
   - Add `OPENROUTER_API_KEY`
   - Redeploy

5. **Verify**
   - Refresh debug page
   - See `OPENROUTER_API_KEY: SET ✓`
   - Click "Test API Calls"
   - See `✓ openrouter - Success`

6. **Done!** ✅
   AI chat now works in production

---

## 🔗 Related Files

- `app/api/debug/ai-providers/route.ts` - API endpoint
- `app/debug/ai-providers/page.tsx` - Web UI
- `lib/ai-providers.ts` - Provider implementations
- `lib/model-registry.ts` - Model definitions
- `docs/PRODUCTION_ERRORS_FIXED.md` - Error documentation

---

## 💡 Tips

1. **Bookmark the debug page** for quick access
2. **Check after deployments** to ensure providers work
3. **Use test mode** to verify actual API connectivity
4. **Monitor response times** to detect provider issues early
5. **Compare local vs production** to spot environment differences

---

## 🆘 Need Help?

If you see unexpected results:

1. Check the console logs (F12 in browser)
2. Check Vercel deployment logs
3. Review `docs/PRODUCTION_ERRORS_FIXED.md`
4. Ensure API keys are valid and not expired
5. Verify provider status at their websites:
   - OpenRouter: https://openrouter.ai/
   - Groq: https://console.groq.com/
