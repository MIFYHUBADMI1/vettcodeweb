# MirrorSite AI ↔ VettCode WEB Integration Audit

**Date**: January 2025  
**Status**: ✅ **FULLY IMPLEMENTED & CONNECTED**

---

## 🔗 Integration Architecture

The two applications are connected via a **server-to-server internal API** using a shared secret key authentication system.

### Authentication Flow

```
VettCode WEB (ATAI.ink)     →     MirrorSite AI (mirrorsite.atai.ink)
Server Component/API         →     Internal API Endpoint
                                   
   1. WEB sends request with:
      - X-Internal-Key header (shared secret)
      - User email as query parameter
   
   2. MirrorSite validates:
      - Checks ATAI_INTERNAL_KEY matches
      - Returns 401 if invalid
      - Returns 503 if not configured
   
   3. MirrorSite responds with:
      - User's projects list
      - Dashboard/New project URLs
      - Project states and metadata
```

---

## 📁 Key Files

### VettCode WEB (`/WEB`)

| File | Purpose |
|------|---------|
| `lib/mirrorsite.ts` | Server-side helper that fetches MirrorSite projects |
| `components/dashboard/MirrorSiteProjectsCard.tsx` | Dashboard widget showing latest projects |
| `components/dashboard/projects/MirrorSiteProjectsPage.tsx` | Full projects page |
| `.env.example` | Documents required env vars |

**Required Environment Variables:**
```env
MIRRORSITE_API_URL=https://mirrorsite.atai.ink
ATAI_INTERNAL_KEY=your_shared_internal_key_here_min_32_chars
```

### MirrorSite AI (`/mirrorsiteai`)

| File | Purpose |
|------|---------|
| `app/api/internal/projects/route.ts` | Internal API endpoint that WEB calls |
| `.env.example` | Documents required env vars |

**Required Environment Variables:**
```env
ATAI_INTERNAL_KEY=your_shared_internal_key_here_min_32_chars
```

---

## 🔐 Security Implementation

### ✅ What's Secure:

1. **Shared Secret Authentication**
   - Both apps must have matching `ATAI_INTERNAL_KEY`
   - Key is never exposed to browser/client-side
   - Minimum 32 characters recommended
   - Transmitted in `X-Internal-Key` header

2. **Server-Side Only**
   - `getMirrorSiteProjects()` is server-side only
   - Never imported in client components
   - Uses Next.js Server Components / Route Handlers

3. **Email-Based Lookup**
   - User identified by email (from NextAuth session)
   - No user IDs exposed in URLs
   - MirrorSite looks up user internally

4. **Graceful Degradation**
   - Returns `null` if integration not configured
   - Dashboard still loads, just shows config message
   - No crashes if MirrorSite is down

5. **Rate Limiting via Caching**
   - Next.js revalidates every 60 seconds
   - Prevents hammering MirrorSite on every page load

---

## 📊 Data Flow

### WEB → MirrorSite Request

**Endpoint**: `GET /api/internal/projects?email={userEmail}`

**Headers**:
```http
X-Internal-Key: {ATAI_INTERNAL_KEY}
Content-Type: application/json
```

### MirrorSite → WEB Response

**Success (200)**:
```json
{
  "ok": true,
  "data": {
    "projects": [
      {
        "id": "proj_abc123",
        "name": "My E-commerce Site",
        "mode": "website",
        "state": "ready",
        "sourceUrl": "https://example.com",
        "updatedAt": 1704067200000,
        "url": "https://mirrorsite.atai.ink/project/proj_abc123"
      }
    ],
    "mirrorSiteUrl": "https://mirrorsite.atai.ink/dashboard",
    "newProjectUrl": "https://mirrorsite.atai.ink/new"
  }
}
```

**User Not Found (200)**:
```json
{
  "ok": true,
  "data": {
    "projects": [],
    "mirrorSiteUrl": "https://mirrorsite.atai.ink/register"
  }
}
```

**Auth Failure (401)**:
```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing internal API key."
  }
}
```

**Not Configured (503)**:
```json
{
  "ok": false,
  "error": {
    "code": "PROVIDER_NOT_CONFIGURED",
    "message": "Internal API key is not configured."
  }
}
```

---

## 🎨 UI Integration Points

### 1. Dashboard Overview (`/dashboard`)
- **Component**: `MirrorSiteProjectsCard`
- **Shows**: Latest 3 projects + quick actions
- **Actions**: 
  - Create new project → MirrorSite `/new`
  - View project → MirrorSite `/project/{id}`
  - View all → WEB `/dashboard/projects`

### 2. Projects Page (`/dashboard/projects`)
- **Component**: `MirrorSiteProjectsPage`
- **Shows**: All user projects with full details
- **Features**:
  - Project cards with state badges
  - Mode icons (website vs idea)
  - Relative timestamps
  - Direct links to MirrorSite workspace

### 3. Empty States
- **Component**: `EmptyWorkspace`
- **Action**: Prompts user to create first project
- **CTA**: Links to MirrorSite `/new`

### 4. Quick Actions
- **Component**: `NextActionCard`
- **Suggests**: "Build your first project" if no projects exist

---

## 📋 Project States & UI Mapping

| MirrorSite State | WEB Label | Color | Description |
|------------------|-----------|-------|-------------|
| `created` | Analysing | Gray | Initial state, analyzing source |
| `analysis_complete` | Ready to build | Gray | Analysis done, awaiting build |
| `specification_ready` | Ready to build | Gray | Spec generated, ready |
| `building` | Building… | Yellow | Build in progress |
| `deploying` | Deploying… | Yellow | Deployment in progress |
| `ready` | Live | Green | Successfully deployed |
| `build_complete` | Built | Green | Build done, not deployed |
| `build_failed` | Build failed | Red | Build encountered errors |
| `deploy_failed` | Deploy failed | Red | Deployment failed |

**Mapping Functions**:
- `mirrorSiteStateLabel(state)` - Human-readable label
- `mirrorSiteStateColor(state)` - Tailwind color class

---

## 🚀 Setup Instructions

### For Development

1. **Generate Shared Secret**:
   ```bash
   openssl rand -hex 32
   ```

2. **Configure WEB App** (`/WEB/.env`):
   ```env
   MIRRORSITE_API_URL=http://localhost:3001  # Local MirrorSite
   ATAI_INTERNAL_KEY=<generated_secret>
   ```

3. **Configure MirrorSite** (`/mirrorsiteai/.env`):
   ```env
   ATAI_INTERNAL_KEY=<same_generated_secret>
   ```

4. **Restart Both Apps**:
   ```bash
   # Terminal 1 - WEB
   cd WEB
   npm run dev  # Port 3000
   
   # Terminal 2 - MirrorSite
   cd mirrorsiteai
   npm run dev  # Port 3001
   ```

### For Production

1. **Same Key in Both Apps**:
   - Set `ATAI_INTERNAL_KEY` in both Vercel deployments
   - Use environment variables (never commit)

2. **WEB Production** (atai.ink):
   ```env
   MIRRORSITE_API_URL=https://mirrorsite.atai.ink
   ATAI_INTERNAL_KEY=<production_secret>
   ```

3. **MirrorSite Production** (mirrorsite.atai.ink):
   ```env
   ATAI_INTERNAL_KEY=<same_production_secret>
   ```

---

## ✅ Integration Checklist

- [x] Server-to-server authentication implemented
- [x] Shared secret key system in place
- [x] Email-based user lookup working
- [x] Dashboard widget shows projects
- [x] Full projects page implemented
- [x] Empty states with CTAs
- [x] Project state mapping
- [x] Direct links to MirrorSite workspaces
- [x] Graceful degradation if not configured
- [x] Caching to prevent API hammering
- [x] Security: No client-side exposure
- [x] Documentation complete

---

## 🔧 Testing the Integration

### Manual Test Flow

1. **Set up environment**:
   ```bash
   # Same key in both .env files
   echo "ATAI_INTERNAL_KEY=$(openssl rand -hex 32)" >> WEB/.env
   echo "ATAI_INTERNAL_KEY=<copy_from_above>" >> mirrorsiteai/.env
   ```

2. **Start both apps**:
   ```bash
   # WEB on :3000, MirrorSite on :3001
   cd WEB && npm run dev
   cd mirrorsiteai && npm run dev
   ```

3. **Sign in to WEB**:
   - Go to `http://localhost:3000/signin`
   - Sign in with Google

4. **Check Dashboard**:
   - Should see "MirrorSite AI Projects" card
   - If you have MirrorSite projects, they'll appear
   - If not, you'll see "No projects yet"

5. **Create Project on MirrorSite**:
   - Click "Start building" → Opens MirrorSite
   - Create a project
   - Return to WEB dashboard → Should appear within 60s

### Testing Without Real Projects

Replace the `getMirrorSiteProjects` function temporarily:

```typescript
// lib/mirrorsite.ts - TEST VERSION
export async function getMirrorSiteProjects(email: string) {
  return {
    projects: [
      {
        id: 'test-1',
        name: 'Test E-commerce',
        mode: 'website',
        state: 'ready',
        sourceUrl: 'https://example.com',
        updatedAt: Date.now(),
        url: 'https://mirrorsite.atai.ink/project/test-1'
      }
    ],
    mirrorSiteUrl: 'https://mirrorsite.atai.ink/dashboard',
    newProjectUrl: 'https://mirrorsite.atai.ink/new'
  }
}
```

---

## 🐛 Troubleshooting

### "Integration not configured" message

**Cause**: Missing or mismatched environment variables

**Fix**:
1. Check both `.env` files have `ATAI_INTERNAL_KEY`
2. Verify keys match exactly
3. Restart both dev servers
4. Check WEB has `MIRRORSITE_API_URL` set

### Projects don't appear

**Cause**: User email mismatch or API error

**Debug**:
1. Check WEB console for `[mirrorsite]` logs
2. Verify same email in both apps
3. Check MirrorSite has projects for that user
4. Inspect Network tab for `/api/internal/projects` call

### 401 Unauthorized

**Cause**: Key mismatch

**Fix**:
1. Regenerate key: `openssl rand -hex 32`
2. Update both `.env` files
3. Restart servers

### 503 Service Unavailable

**Cause**: MirrorSite `ATAI_INTERNAL_KEY` not set

**Fix**:
1. Add to `mirrorsiteai/.env`
2. Restart MirrorSite dev server

---

## 📈 Future Enhancements

### Potential Improvements:

1. **Webhook Integration**
   - MirrorSite sends webhooks when project state changes
   - WEB invalidates cache immediately
   - Real-time updates without polling

2. **Project Actions from WEB**
   - Start/stop builds
   - Delete projects
   - View logs
   - Deploy to different environments

3. **Enhanced Metrics**
   - Build times
   - Deployment history
   - Resource usage
   - Error rates

4. **Direct Embedding**
   - Embed MirrorSite workspace in WEB iframe
   - Single sign-on flow
   - Unified navigation

5. **Unified Notifications**
   - Build complete notifications in WEB
   - Deployment status updates
   - Error alerts

---

## 🎯 Summary

The integration is **fully functional** and follows security best practices:

✅ **Secure**: Server-to-server with shared secret  
✅ **Reliable**: Graceful degradation, caching  
✅ **Maintainable**: Clean separation of concerns  
✅ **User-Friendly**: Seamless navigation between apps  
✅ **Production-Ready**: Deployed and tested  

The key authentication system allows both apps to remain **completely separate** while sharing user data securely. Users experience a unified ecosystem without complex auth flows or data synchronization issues.
