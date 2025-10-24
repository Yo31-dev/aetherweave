# Security Considerations

## Current Implementation (Development)

### Token Storage

The portal currently uses **oidc-client-ts** default storage mechanism:
- Tokens stored in **sessionStorage** (not localStorage)
- Better than localStorage: cleared on browser close, not shared between tabs
- **⚠️ Still vulnerable to XSS attacks** - tokens accessible via JavaScript

This is **acceptable for development** but **NOT recommended for production**.

## Production Security Improvements

### Recommended: Backend-for-Frontend (BFF) Pattern

**Architecture**:
```
Browser → Portal BFF (NestJS) → APISIX Gateway → Backend Services
          ↓                      ↓
      HttpOnly Cookie        JWT Bearer Token
      (session_id)           (from BFF)
```

**How it works**:
1. User authenticates via OAuth2/OIDC flow handled by the BFF
2. BFF stores JWT in server-side session (Redis via Dapr State Store)
3. BFF sends browser an HttpOnly, Secure, SameSite cookie with session ID
4. Browser makes API calls to BFF endpoints
5. BFF retrieves JWT from session and proxies requests to APISIX with Bearer token
6. Tokens never exposed to browser JavaScript

**Benefits**:
- ✅ **Zero XSS risk**: JWT never accessible to JavaScript
- ✅ **CSRF protection**: SameSite cookie attribute
- ✅ **Session management**: Server-side control over token lifecycle
- ✅ **Automatic token refresh**: Handled transparently by BFF
- ✅ **Perfect fit for AetherWeave**: Uses existing NestJS + Dapr stack

**Implementation steps** (future):
1. Create `portal-bff` service (NestJS)
2. Install `@nestjs/passport` and `passport-openidconnect`
3. Configure session middleware with Dapr State Store (Redis)
4. Implement auth routes:
   - `POST /auth/login` - Initiate OAuth2 flow
   - `GET /auth/callback` - Handle OAuth2 callback
   - `GET /auth/logout` - End session
   - `GET /auth/me` - Get current user info
5. Implement API proxy routes:
   - `ALL /api/*` - Proxy to APISIX with JWT from session
6. Update portal to call BFF instead of APISIX directly
7. Configure cookies:
   ```typescript
   {
     httpOnly: true,
     secure: true, // HTTPS only in production
     sameSite: 'strict',
     maxAge: 3600000 // 1 hour
   }
   ```

**BFF service structure**:
```
portal-bff/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts    # Login, callback, logout endpoints
│   │   ├── auth.service.ts       # OAuth2/OIDC logic
│   │   ├── auth.guard.ts         # Session validation
│   │   └── session.strategy.ts   # Passport session strategy
│   ├── proxy/
│   │   └── proxy.controller.ts   # API proxy to APISIX
│   └── main.ts
├── Dockerfile
└── docker-compose.yml
```

### Alternative Options (Not Recommended)

#### Option 2: Memory-only storage
Store tokens only in memory (lost on page refresh).

**Configuration**:
```typescript
// auth.service.ts
const settings: UserManagerSettings = {
  userStore: new WebStorageStateStore({
    store: new InMemoryWebStorage()
  }),
  // ...
};
```

**Pros**:
- ✅ Tokens never persisted in browser storage

**Cons**:
- ❌ Token lost on page refresh → user must re-authenticate
- ❌ Silent token refresh becomes complex
- ❌ Poor user experience

#### Option 3: Service Worker + IndexedDB
Use Service Worker to intercept requests and add tokens from IndexedDB.

**Pros**:
- ✅ Better isolation than sessionStorage

**Cons**:
- ❌ High complexity
- ❌ Difficult to debug
- ❌ Browser compatibility concerns

## Additional Production Security Measures

### 1. Content Security Policy (CSP)
Add CSP headers in nginx.conf:
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://localhost:8000;";
```

### 2. HTTPS Only
- Enable HTTPS in production
- Set `Secure` flag on cookies
- Configure APISIX SSL/TLS

### 3. Token Validation
- Validate JWT signature on every request (APISIX already does this)
- Check token expiration
- Verify audience claim

### 4. Rate Limiting
- Implement rate limiting on auth endpoints
- Prevent brute force attacks

### 5. Audit Logging
- Log all authentication events
- Monitor for suspicious activity

## Migration Path

**Phase 1** (Current): Development with sessionStorage
- ✅ Quick prototyping
- ✅ Easy debugging
- ⚠️ Development only

**Phase 2** (Production): Implement BFF
- Create portal-bff service
- Migrate auth logic to server-side
- Use HttpOnly cookies
- Deploy behind HTTPS

**Phase 3** (Hardening): Additional security
- Enable CSP
- Add rate limiting
- Implement security monitoring
- Regular security audits

## Security Checklist for Production

- [ ] Implement BFF pattern for token management
- [ ] Enable HTTPS everywhere
- [ ] Configure HttpOnly, Secure, SameSite cookies
- [ ] Add Content Security Policy headers
- [ ] Enable rate limiting on auth endpoints
- [ ] Implement audit logging for auth events
- [ ] Regular dependency updates (npm audit)
- [ ] Security scanning in CI/CD pipeline
- [ ] Penetration testing
- [ ] Security incident response plan

## References

- [OAuth 2.0 for Browser-Based Apps (BCP)](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Backend-for-Frontend Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends)
