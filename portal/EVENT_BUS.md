# EventBus - Micro-Frontend Communication

This document describes how to use the **EventBus** service for communication between the Portal (Vue.js) and Web Components (Lit, vanilla JS, etc.).

## Overview

The EventBus uses **[eventemitter3](https://github.com/primus/eventemitter3)** - a high-performance, framework-agnostic event emitter library with:
- **Wildcard support** - Listen to patterns like `portal:*` or `wc:*`
- **TypeScript first-class support** - Strongly typed events
- **Small footprint** - ~2KB minified
- **Cross-framework** - Works with Vue, Lit, React, vanilla JS
- **SessionStorage persistence** - Auth state survives page refresh

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Portal (Vue.js)                      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │           EventBus (eventemitter3)              │  │
│  │  ┌─────────────────────────────────────────┐   │  │
│  │  │     sessionStorage Persistence          │   │  │
│  │  │  - auth token                           │   │  │
│  │  │  - user profile                         │   │  │
│  │  │  - locale                               │   │  │
│  │  └─────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
           │                           ▲
           │ publish events            │ emit events
           │ (auth, locale)            │ (navigate, error)
           ▼                           │
┌─────────────────────────────────────────────────────────┐
│              Web Components (Lit, etc.)                 │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ user-service │  │ todo-service │  │  other-wc   │  │
│  └──────────────┘  └──────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Event Types

### Portal → Web Components

| Event | Payload | Description |
|-------|---------|-------------|
| `portal:auth:update` | `AuthPayload` | User authenticated, JWT token available |
| `portal:auth:logout` | none | User logged out, clear local state |
| `portal:locale:change` | `LocalePayload` | UI language changed |

### Web Components → Portal

| Event | Payload | Description |
|-------|---------|-------------|
| `wc:navigate` | `NavigationPayload` | Request navigation to a route |
| `wc:error` | `ErrorPayload` | Error occurred, show error message |
| `wc:notification` | `NotificationPayload` | Show success/info/warning message |

## Usage in Portal (Vue.js)

The EventBus is already integrated in the portal. Here's how it's used:

### Publishing Auth State

```typescript
// In auth.store.ts
import { eventBus } from '@/services/event-bus.service';

// After successful authentication
eventBus.publishAuth({
  token: user.access_token,
  user: user.profile,
});

// On logout
eventBus.publishLogout();
```

### Listening to Web Component Events

```typescript
// In DefaultLayout.vue
import { eventBus } from '@/services/event-bus.service';
import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  // Listen for navigation requests
  const unsubNav = eventBus.onNavigate((payload) => {
    router.push(payload.path);
  });

  // Listen for errors
  const unsubError = eventBus.onError((payload) => {
    console.error(payload.message);
  });

  // Listen for notifications
  const unsubNotif = eventBus.onNotification((payload) => {
    showSnackbar(payload.message, payload.type);
  });

  // Cleanup on unmount
  onUnmounted(() => {
    unsubNav();
    unsubError();
    unsubNotif();
  });
});
```

## Usage in Web Components

### Step 1: Install eventemitter3

```bash
pnpm add eventemitter3
```

### Step 2: Create EventBus Service

Create a service to access the shared EventBus instance:

```typescript
// src/services/event-bus.service.ts
import EventEmitter from 'eventemitter3';

// Import types from portal (or copy them)
export interface AuthPayload {
  token: string;
  user: {
    username?: string;
    email?: string;
    name?: string;
    roles?: string[];
    [key: string]: any;
  };
}

export const EventType = {
  AUTH_UPDATE: 'portal:auth:update',
  AUTH_LOGOUT: 'portal:auth:logout',
  LOCALE_CHANGE: 'portal:locale:change',
  NAVIGATE: 'wc:navigate',
  ERROR: 'wc:error',
  NOTIFICATION: 'wc:notification',
} as const;

/**
 * Get the shared EventBus instance from the portal
 * The portal exposes it on window for cross-framework access
 */
function getSharedEventBus(): EventEmitter {
  // The portal exposes the EventBus on window
  if (!(window as any).__AETHERWEAVE_EVENT_BUS__) {
    throw new Error('[EventBus] Portal EventBus not found. Ensure portal is loaded first.');
  }
  return (window as any).__AETHERWEAVE_EVENT_BUS__;
}

class WebComponentEventBus {
  private emitter: EventEmitter;
  private token: string | null = null;
  private user: any = null;

  constructor() {
    this.emitter = getSharedEventBus();
    console.log('[WC EventBus] Connected to portal EventBus');

    // Try to get persisted auth immediately
    const persistedAuth = this.getPersistedAuth();
    if (persistedAuth) {
      this.token = persistedAuth.token;
      this.user = persistedAuth.user;
      console.log('[WC EventBus] Loaded persisted auth:', this.user.username);
    }
  }

  /**
   * Get persisted auth from sessionStorage
   */
  private getPersistedAuth(): AuthPayload | null {
    const token = sessionStorage.getItem('aetherweave:auth:token');
    const userJson = sessionStorage.getItem('aetherweave:auth:user');

    if (token && userJson) {
      try {
        return {
          token,
          user: JSON.parse(userJson),
        };
      } catch (error) {
        console.error('[WC EventBus] Failed to parse persisted auth:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Listen for auth updates from portal
   */
  onAuthUpdate(callback: (payload: AuthPayload) => void): () => void {
    const handler = (payload: AuthPayload) => {
      this.token = payload.token;
      this.user = payload.user;
      console.log('[WC EventBus] Auth updated:', this.user.username);
      callback(payload);
    };

    this.emitter.on(EventType.AUTH_UPDATE, handler);

    // Immediately call with persisted auth if available
    const persistedAuth = this.getPersistedAuth();
    if (persistedAuth) {
      handler(persistedAuth);
    }

    return () => this.emitter.off(EventType.AUTH_UPDATE, handler);
  }

  /**
   * Listen for logout from portal
   */
  onLogout(callback: () => void): () => void {
    const handler = () => {
      this.token = null;
      this.user = null;
      console.log('[WC EventBus] Logged out');
      callback();
    };
    this.emitter.on(EventType.AUTH_LOGOUT, handler);
    return () => this.emitter.off(EventType.AUTH_LOGOUT, handler);
  }

  /**
   * Get current auth token (synced from portal)
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Get current user (synced from portal)
   */
  getUser(): any {
    return this.user;
  }

  /**
   * Request navigation to a route
   */
  navigate(path: string, replace = false): void {
    this.emitter.emit(EventType.NAVIGATE, { path, replace });
  }

  /**
   * Emit error to portal
   */
  emitError(message: string, code?: string, source?: string): void {
    this.emitter.emit(EventType.ERROR, { message, code, source });
  }

  /**
   * Emit notification to portal
   */
  emitNotification(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info'): void {
    this.emitter.emit(EventType.NOTIFICATION, { message, type });
  }
}

// Export singleton
export const eventBus = new WebComponentEventBus();
```

### Step 3: Use in Lit Component

```typescript
// user-management-app.ts
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { eventBus } from './services/event-bus.service';

@customElement('user-management-app')
export class UserManagementApp extends LitElement {
  @state() private authenticated = false;
  @state() private users: any[] = [];

  private unsubAuth?: () => void;
  private unsubLogout?: () => void;

  connectedCallback() {
    super.connectedCallback();

    // Listen for auth updates
    this.unsubAuth = eventBus.onAuthUpdate((payload) => {
      this.authenticated = true;
      this.loadUsers();
    });

    // Listen for logout
    this.unsubLogout = eventBus.onLogout(() => {
      this.authenticated = false;
      this.users = [];
    });

    // Check if already authenticated (persisted state)
    if (eventBus.getToken()) {
      this.authenticated = true;
      this.loadUsers();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Cleanup listeners
    this.unsubAuth?.();
    this.unsubLogout?.();
  }

  private async loadUsers() {
    const token = eventBus.getToken();
    if (!token) {
      eventBus.emitError('No authentication token', 'AUTH_ERROR', 'user-management');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/users/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      this.users = await response.json();
      eventBus.emitNotification('Users loaded successfully', 'success');
    } catch (error) {
      eventBus.emitError(`Failed to load users: ${error}`, 'API_ERROR', 'user-management');
    }
  }

  private handleCreateUser() {
    // Navigate to create user page
    eventBus.navigate('/users/create');
  }

  render() {
    if (!this.authenticated) {
      return html`<div>Please log in to view users.</div>`;
    }

    return html`
      <div>
        <h2>User Management</h2>
        <button @click=${this.handleCreateUser}>Create User</button>
        <ul>
          ${this.users.map(user => html`<li>${user.username}</li>`)}
        </ul>
      </div>
    `;
  }
}
```

## Refresh Behavior

**Key feature**: Auth state persists across page refreshes using `sessionStorage`.

### How it works:

1. **Portal publishes auth** → Token saved to `sessionStorage`
2. **Web Component loads** → Checks `sessionStorage` for token
3. **Page refreshes** → Portal restores auth from `sessionStorage`
4. **EventBus re-publishes** → Web Components receive auth again (100ms delay)

### For Web Components:

When a Web Component mounts, it should:
1. Register `onAuthUpdate` listener
2. Check `eventBus.getToken()` immediately for persisted state
3. If token exists, proceed with authenticated state

```typescript
connectedCallback() {
  super.connectedCallback();

  // Listen for future auth updates
  this.unsubAuth = eventBus.onAuthUpdate((payload) => {
    this.authenticated = true;
    this.loadData();
  });

  // Check for existing auth (handles refresh case)
  if (eventBus.getToken()) {
    this.authenticated = true;
    this.loadData();
  }
}
```

## Advanced Features

### Wildcard Listeners (EventEmitter3 feature)

```typescript
// Listen to ALL portal events
eventBus.onAllPortalEvents((eventName, ...args) => {
  console.log(`Portal event: ${eventName}`, args);
});

// Listen to ALL Web Component events
eventBus.onAllWebComponentEvents((eventName, ...args) => {
  console.log(`WC event: ${eventName}`, args);
});
```

### Debugging

```typescript
// Check listener count
console.log('Auth listeners:', eventBus.listenerCount('portal:auth:update'));

// Remove all listeners (cleanup)
eventBus.removeAllListeners();
```

## Security Considerations

1. **Token storage**: Tokens are stored in `sessionStorage` (cleared on tab close)
2. **No localStorage**: Avoids XSS persistence across sessions
3. **HTTPS only in production**: Ensure secure transmission
4. **Token expiration**: Portal handles token refresh via oidc-client-ts

## Migration from CustomEvents

If you have existing Web Components using `window.addEventListener`:

**Before (CustomEvent)**:
```typescript
window.addEventListener('portal:auth:update', (event: Event) => {
  const customEvent = event as CustomEvent;
  const token = customEvent.detail.token;
});
```

**After (EventEmitter3)**:
```typescript
import { eventBus } from './services/event-bus.service';

eventBus.onAuthUpdate((payload) => {
  const token = payload.token;
});
```

## Troubleshooting

### "Portal EventBus not found"
- Ensure the portal is loaded before the Web Component
- Check browser console for `[EventBus] Initialized with EventEmitter3`

### Auth state not persisting on refresh
- Check `sessionStorage` contains `aetherweave:auth:token`
- Verify `eventBus.getPersistedAuth()` returns data
- Check browser console for `[EventBus] Restoring auth state from sessionStorage`

### Events not received
- Verify listener is registered before event is published
- Check `eventBus.listenerCount()` to ensure listener is registered
- Use wildcard listeners for debugging

## References

- [eventemitter3 on GitHub](https://github.com/primus/eventemitter3)
- [EventEmitter3 vs mitt comparison](https://npm-compare.com/eventemitter3,mitt)
- [Micro-Frontend Communication Patterns](https://martinfowler.com/articles/micro-frontends.html)
