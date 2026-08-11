# VettCode Authentication Setup Guide

Complete guide to setting up Google OAuth and email verification with Gmail SMTP.

## Overview

VettCode uses **NextAuth.js** for authentication with:

- ✅ **Google OAuth** (Sign in with Google)
- ✅ **Email/Password** with email verification
- ✅ **Gmail SMTP** for sending verification emails

## Prerequisites

1. **Google Cloud Project** (for OAuth)
2. **Gmail Account** (for SMTP)
3. **MongoDB** (for user storage)

---

## 1. Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project"
3. Name it "VettCode" (or your preferred name)
4. Click "Create"

### Step 2: Enable Google+ API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click "Enable"

### Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure OAuth consent screen:
   - User Type: **External**
   - App name: **VettCode**
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add `email`, `profile`, `openid`
   - Test users: Add your email
4. Application type: **Web application**
5. Name: **VettCode Web**
6. Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```
7. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-production-domain.com/api/auth/callback/google
   ```
8. Click "Create"
9. **Copy Client ID and Client Secret** - you'll need these!

---

## 2. Gmail SMTP Setup

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**

### Step 2: Create App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other** (Custom name)
4. Name it: **VettCode**
5. Click "Generate"
6. **Copy the 16-character password** - you'll need this!

---

## 3. Environment Configuration

Create `.env.local` file:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/vettcode

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_32_char_string_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
SMTP_FROM=VettCode <noreply@vettcode.dev>
```

### Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 4. Install Dependencies

```bash
cd C:\Users\USER\Desktop\VETTCODE\WEB
npm install
```

---

## 5. Test Email Configuration

Create a test script `test-email.js`:

```javascript
import { verifyEmailConfig, sendVerificationEmail } from "./lib/email.js";

async function test() {
  console.log("Testing email configuration...");

  const isValid = await verifyEmailConfig();

  if (isValid) {
    console.log("✅ Email server is ready!");

    // Uncomment to send test email
    // await sendVerificationEmail(
    //   'your-email@gmail.com',
    //   'http://localhost:3000/auth/verify?token=test'
    // )
    // console.log('✅ Test email sent!')
  } else {
    console.log("❌ Email configuration error");
  }
}

test();
```

Run:

```bash
node test-email.js
```

---

## 6. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 7. Test Authentication Flow

### Test Email/Password Registration

1. Go to `/auth/signin`
2. Click "Sign up"
3. Enter email and password
4. Check your email for verification link
5. Click verification link
6. Sign in with email/password

### Test Google OAuth

1. Go to `/auth/signin`
2. Click "Sign in with Google"
3. Select your Google account
4. Grant permissions
5. You should be signed in!

---

## Troubleshooting

### Google OAuth Issues

**Error: "redirect_uri_mismatch"**

- Check that redirect URI in Google Console matches exactly
- Must include `/api/auth/callback/google`
- Check http vs https

**Error: "Access blocked"**

- OAuth consent screen not configured
- Add yourself as test user
- App needs to be verified for production

### Email Issues

**Error: "Invalid login"**

- Enable 2-Factor Authentication
- Generate new App Password
- Use App Password, not regular password

**Error: "Connection refused"**

- Check SMTP settings
- Port 587 for TLS
- Port 465 for SSL

**Emails not sending**

- Check spam folder
- Verify Gmail allows "Less secure apps" or use App Password
- Check firewall/antivirus blocking port 587

### MongoDB Issues

**Error: "MongoServerError"**

- MongoDB not running
- Start MongoDB: `mongod`
- Check connection string in .env

---

## Production Deployment

### 1. Vercel Environment Variables

Add all variables from `.env.local` to Vercel:

```bash
vercel env add MONGODB_URI
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASSWORD
vercel env add SMTP_FROM
```

### 2. Update Google OAuth

Add production URLs to Google Console:

```
https://your-app.vercel.app
https://your-app.vercel.app/api/auth/callback/google
```

### 3. Update NEXTAUTH_URL

```bash
NEXTAUTH_URL=https://your-app.vercel.app
```

---

## Security Best Practices

### 1. Environment Variables

- ✅ Never commit `.env.local` to git
- ✅ Use strong NEXTAUTH_SECRET (32+ characters)
- ✅ Rotate secrets periodically

### 2. Google OAuth

- ✅ Restrict API keys to specific domains
- ✅ Use different OAuth clients for dev/prod
- ✅ Verify OAuth consent screen

### 3. Email

- ✅ Use App Passwords, not regular passwords
- ✅ Enable 2FA on Gmail account
- ✅ Consider dedicated email service for production (SendGrid, AWS SES)

### 4. Password Requirements

- ✅ Minimum 8 characters
- ✅ Hashed with bcrypt (12 rounds)
- ✅ Consider adding complexity requirements

---

## Alternative Email Providers

### SendGrid (Recommended for Production)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

### AWS SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_ses_username
SMTP_PASSWORD=your_ses_password
```

### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_mailgun_username
SMTP_PASSWORD=your_mailgun_password
```

---

## Testing Checklist

- [ ] Google OAuth sign in works
- [ ] Email registration works
- [ ] Verification email received
- [ ] Email verification link works
- [ ] Welcome email received
- [ ] Password login works
- [ ] Session persists after refresh
- [ ] Sign out works
- [ ] Resend verification works

---

## API Endpoints

| Endpoint                        | Method | Description               |
| ------------------------------- | ------ | ------------------------- |
| `/api/auth/register`            | POST   | Create new account        |
| `/api/auth/verify-email`        | POST   | Verify email with token   |
| `/api/auth/resend-verification` | POST   | Resend verification email |
| `/api/auth/signin`              | POST   | Sign in (NextAuth)        |
| `/api/auth/signout`             | POST   | Sign out (NextAuth)       |
| `/api/auth/callback/google`     | GET    | Google OAuth callback     |

---

## Support

- **NextAuth.js**: https://next-auth.js.org/
- **Google OAuth**: https://console.cloud.google.com/
- **Gmail SMTP**: https://support.google.com/mail/answer/7126229

---

**Status:** ✅ Production Ready

**Features:**

- ✅ Google OAuth
- ✅ Email/Password with verification
- ✅ Session management
- ✅ MongoDB user storage
- ✅ Secure password hashing
- ✅ Email notifications
