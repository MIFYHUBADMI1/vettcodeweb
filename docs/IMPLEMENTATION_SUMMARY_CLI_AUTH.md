# VettCode CLI Authentication Implementation Summary

## Overview

Successfully implemented web-based device authorization flow for VettCode CLI, allowing users to authenticate via the VettCode Web application without exposing passwords, OAuth secrets, or session cookies to the CLI.

---

## Architecture

### Flow Diagram

```
CLI                    VettCode Web                  Database
 │                          │                            │
 │──── POST /start ────────>│                            │
 │<──── session + code ─────│                            │
 │                          │                            │
 │──── opens browser ──────>│                            │
 │                          │                            │
 │                          │<──── user signs in ────────│
 │                          │                            │
 │                          │<──── user approves ────────│
 │                          │                            │
 │                          │──── store token hash ─────>│
 │                          │                            │
 │──── POST /poll ─────────>│                            │
 │<──── status=approved ────│                            │
 │<──── token ──────────────│                            │
 │                          │                            │
 │──── saves token locally ─│                            │
 │                          │                            │
 │──── GET /me ────────────>│                            │
 │    (Bearer: token)       │                            │
 │<──── user info ──────────│                            │
```

---

## What Was Implemented

### Phase 1: Database Models (WEB) ✅

**File:** `WEB/lib/models/CLICredential.ts`

- Stores hashed CLI authentication tokens
- Fields: userId, tokenHash (SHA-256), deviceName, deviceInfo, createdAt, lastUsedAt, expiresAt, revokedAt
- Methods: create(), findByToken(), findByUserId(), updateLastUsed(), revoke(), revokeById(), revokeAllForUser()
- Security: Cryptographically secure token generation (32 bytes), SHA-256 hashing before storage
- Expiration: 90 days by default

**File:** `WEB/lib/models/AuthorizationSession.ts`

- Temporary sessions for device authorization flow
- Fields: sessionId, verificationCode, status, userId, deviceInfo, cliToken, createdAt, expiresAt
- Methods: create(), findBySessionId(), findByVerificationCode(), approve(), deny(), getStatus()
- Verification code format: ABCD-EFGH (8 characters, human-friendly)
- Expiration: 15 minutes

### Phase 2: Authentication Middleware (WEB) ✅

**File:** `WEB/lib/cli-auth.ts`

- `extractBearerToken()`: Extracts Bearer token from Authorization header
- `authenticateCLIRequest()`: Validates CLI token and returns user info
- `requireCLIAuth()`: Throws error if not authenticated (use in API routes)
- Automatically updates lastUsedAt timestamp on successful auth

### Phase 3: API Endpoints (WEB) ✅

**Endpoint:** `POST /api/cli/auth/start`

- Creates authorization session
- Returns: sessionId, verificationCode, authorizationUrl, expiresAt, expiresInSeconds
- Collects device info from request

**Endpoint:** `POST /api/cli/auth/poll`

- CLI polls for authorization status
- Input: sessionId
- Returns: status ('pending' | 'approved' | 'denied' | 'expired'), token (if approved)
- Rate limiting: 2-second minimum interval between polls
- Automatic expiration handling

**Endpoint:** `POST /api/cli/auth/verify`

- Web frontend calls after user authorizes
- Requires authenticated NextAuth session
- Input: sessionId, deviceName (optional)
- Generates CLI credential, stores hash, approves session

**Endpoint:** `POST /api/cli/auth/revoke`

- Revokes CLI credential
- Can be called by CLI (self-revoke) or web (with session)
- Input: credentialId (web) or uses Authorization header (CLI)

**Endpoint:** `GET /api/cli/auth/me`

- Returns current user information
- Requires Bearer token authentication
- Returns: user id, email, name, plan, emailVerified, createdAt, scanCount

### Phase 4: Web Authorization Page (WEB) ✅

**File:** `WEB/app/cli/auth/page.tsx`

- Route: `/cli/auth?session=xxx`
- States: loading, not-authenticated, ready, authorizing, success, error
- Not authenticated: Redirects to sign-in with Google/Email options
- Authenticated: Shows authorization UI with:
  - User profile display
  - Permissions list (scan projects, view results, access AI)
  - Optional device name input
  - "Allow CLI Access" and "Cancel" buttons
- Success: Displays confirmation, user can return to terminal
- Premium dark-first design matching VettCode branding

### Phase 5: CLI Infrastructure ✅

**File:** `CLI/src/lib/config.ts`

- Configuration management
- API base URL: Defaults to production (https://vettedcodewe.vercel.app)
- Override via `VETTCODE_API_URL` environment variable
- Credential storage path: `~/.vettcode/credentials`

**File:** `CLI/src/lib/credential-store.ts`

- Secure local credential storage
- Location: `~/.vettcode/credentials` (cross-platform)
- File permissions: 0o600 (read/write for owner only)
- Methods: save(), load(), delete(), exists(), getPath()

**File:** `CLI/src/lib/browser.ts`

- Cross-platform browser opening
- Windows: `start ""`
- macOS: `open`
- Linux: `xdg-open`
- Graceful degradation if browser can't open

**File:** `CLI/src/lib/api-client.ts`

- HTTP client for VettCode API
- Methods: startAuth(), pollAuth(), getMe(), revoke()
- Automatic Bearer token injection from credential store
- User-friendly error messages

### Phase 6: CLI Commands ✅

**Command:** `vettcode login`

- **File:** `CLI/src/commands/login.ts`
- Flow:
  1. Check if already authenticated
  2. Start authorization (POST /api/cli/auth/start)
  3. Display authorization URL and verification code
  4. Open browser automatically
  5. Poll for authorization (every 3 seconds, max 15 minutes)
  6. Save token securely
  7. Verify authentication (GET /api/cli/auth/me)
  8. Display success message with user email and plan
- Handles: timeout, denial, expiration, network errors
- Visual feedback with ora spinners

**Command:** `vettcode whoami`

- **File:** `CLI/src/commands/whoami.ts`
- Displays current authenticated user information
- Shows: email, name, plan, email verification status, scan count, account age
- Error handling for expired/invalid credentials

**Command:** `vettcode logout`

- **File:** `CLI/src/commands/logout.ts`
- Revokes credential server-side (POST /api/cli/auth/revoke)
- Deletes local credential file
- Graceful handling if server-side revocation fails

**Updated:** `CLI/src/cli.ts`

- Added login, logout, whoami commands
- Updated help command to show authentication commands
- Imported command handlers

---

## Security Features Implemented

### Token Security

- ✅ Cryptographically secure random token generation (crypto.randomBytes)
- ✅ SHA-256 hashing before database storage
- ✅ Token only shown once (during authorization)
- ✅ 90-day expiration with lastUsedAt tracking

### Authorization Flow Security

- ✅ Short-lived authorization sessions (15 minutes)
- ✅ Human-friendly verification codes (no confusing characters)
- ✅ Rate limiting on polling endpoint (2-second minimum)
- ✅ Explicit user approval required (no automatic authorization)

### Credential Storage Security

- ✅ File permissions: 0o600 (owner read/write only)
- ✅ Stored in ~/.vettcode/ (hidden directory)
- ✅ Never stored in project files or Git repositories

### API Security

- ✅ Bearer token authentication for CLI requests
- ✅ Server-side user ID resolution (never trust client)
- ✅ Automatic lastUsedAt timestamp updates
- ✅ Revocation support (both CLI and web)

### What CLI NEVER Receives

- ✅ User passwords
- ✅ Google OAuth client secret
- ✅ NextAuth secret
- ✅ NextAuth session cookies
- ✅ Raw database credentials

---

## Testing Status

### Build Status

- ✅ WEB: TypeScript compilation successful
- ✅ CLI: TypeScript compilation successful (`npm run build` passed)
- ✅ No linting errors

### Manual Testing Required

**WEB Testing:**

1. ✅ Deploy to Vercel (already pushed to GitHub)
2. ⏳ Test authorization page renders correctly
3. ⏳ Test Google OAuth sign-in flow
4. ⏳ Test email/password sign-in flow
5. ⏳ Test authorization approval
6. ⏳ Test authorization denial
7. ⏳ Test session expiration
8. ⏳ Test database credential creation

**CLI Testing:**

1. ⏳ Build CLI: `npm run build`
2. ⏳ Test `vettcode login` command
3. ⏳ Verify browser opens automatically
4. ⏳ Verify fallback URL display
5. ⏳ Test authorization flow end-to-end
6. ⏳ Test `vettcode whoami` command
7. ⏳ Test `vettcode logout` command
8. ⏳ Test expired credential handling
9. ⏳ Test network error handling

**Integration Testing:**

1. ⏳ Complete flow: CLI → Browser → Authorize → CLI authenticated
2. ⏳ Test multiple devices (multiple CLI credentials)
3. ⏳ Test credential revocation from web
4. ⏳ Test credential revocation from CLI
5. ⏳ Test API authentication with Bearer token

---

## Files Created

### WEB (9 new files)

1. `WEB/lib/models/CLICredential.ts` - CLI token model
2. `WEB/lib/models/AuthorizationSession.ts` - Device flow session model
3. `WEB/lib/cli-auth.ts` - Authentication middleware
4. `WEB/app/api/cli/auth/start/route.ts` - Start authorization
5. `WEB/app/api/cli/auth/poll/route.ts` - Poll authorization status
6. `WEB/app/api/cli/auth/verify/route.ts` - Approve authorization
7. `WEB/app/api/cli/auth/revoke/route.ts` - Revoke credential
8. `WEB/app/api/cli/auth/me/route.ts` - Get current user
9. `WEB/app/cli/auth/page.tsx` - Authorization page

### CLI (7 new files)

1. `CLI/src/lib/config.ts` - Configuration management
2. `CLI/src/lib/credential-store.ts` - Secure credential storage
3. `CLI/src/lib/browser.ts` - Browser opening utilities
4. `CLI/src/lib/api-client.ts` - VettCode API client
5. `CLI/src/commands/login.ts` - Login command
6. `CLI/src/commands/whoami.ts` - Whoami command
7. `CLI/src/commands/logout.ts` - Logout command

### CLI (1 modified file)

1. `CLI/src/cli.ts` - Added auth commands

---

## Integration with Existing Systems

### Reused Existing Infrastructure ✅

- NextAuth authentication system (unchanged)
- MongoDB database and connection
- User model (no modifications needed)
- Google OAuth configuration (unchanged)
- Existing API route patterns
- Existing CLI command structure

### No Breaking Changes ✅

- Existing web authentication works unchanged
- Existing CLI commands work unchanged
- No modifications to existing database models
- No modifications to existing API routes

---

## Environment Variables

### Required (Already Set)

- `NEXTAUTH_URL` = https://vettedcodewe.vercel.app
- `NEXTAUTH_SECRET` = (already set)
- `MONGODB_URI` = (already set)

### Optional (For Development)

- `VETTCODE_API_URL` = Override API URL for CLI testing

---

## Next Steps

### Immediate (To Complete Feature)

1. **Deploy WEB changes to Vercel** (auto-deploy from GitHub)
2. **Test complete flow**:
   - Terminal: `vettcode login`
   - Browser opens
   - Sign in with Google/Email
   - Authorize CLI
   - Return to terminal
   - See success message
3. **Test API authentication**:
   - Verify Bearer token works
   - Test `vettcode whoami`
   - Test `vettcode logout`

### Future Enhancements

1. **Web Account Management**:
   - View connected CLI devices
   - Revoke specific devices from web UI
   - Show last used timestamps
2. **CLI Enhancements**:
   - Use authenticated API for scan uploads
   - Auto-authentication for scan results
   - Integration with web dashboard
3. **Security Improvements**:
   - Redis-based rate limiting (currently in-memory)
   - IP-based suspicious activity detection
   - Email notifications for new CLI authorizations

---

## Commands Reference

### Authentication Commands

```bash
# Sign in to VettCode
vettcode login

# Show current user
vettcode whoami

# Sign out
vettcode logout
```

### Existing Commands (Unchanged)

```bash
# Scan project
vettcode scan .

# Check requirements
vettcode setup

# Show help
vettcode help
```

---

## Production URLs

- **Web Application**: https://vettedcodewe.vercel.app
- **Authorization Page**: https://vettedcodewe.vercel.app/cli/auth
- **API Base**: https://vettedcodewe.vercel.app/api

---

## Summary

✅ **Implemented**: Complete web-based device authorization flow for CLI
✅ **Security**: No passwords, secrets, or cookies exposed to CLI
✅ **User Experience**: Browser-based authorization with clear instructions
✅ **Integration**: Reuses existing auth system, no breaking changes
✅ **Database**: New models for CLI credentials and authorization sessions
✅ **API**: 5 new secure endpoints for authentication flow
✅ **CLI**: 3 new commands (login, whoami, logout)
✅ **Build**: All TypeScript compilation successful
⏳ **Testing**: Requires manual end-to-end testing

**Status**: Implementation complete, ready for testing and deployment.
