# Portal Architecture - Micro-Frontend Communication

## Overview

The AetherWeave Portal uses a **hybrid communication model** for micro-frontends:
- **Web Component Properties** for auth state (token, user)
- **EventBus (eventemitter3)** for runtime events (logout, navigation, notifications)

This approach provides:
- ✅ **Zero coupling** with portal's auth provider (oidc-client-ts)
- ✅ **No storage duplication** - Portal manages its own auth storage
- ✅ **Standard Web Component pattern** - Properties for data, events for actions
- ✅ **Reactive updates** - Lit automatically re-renders when properties change
- ✅ **Refresh works** - Portal re-passes token on mount

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                       Portal (Vue.js)                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │          Auth Store (oidc-client-ts)                       │ │
│  │  - sessionStorage managed by oidc-client-ts library       │ │
│  │  - No custom storage layer                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
│                           │ accessToken, profile                 │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         MicroFrontendLoader.vue                            │ │
│  │                                                            │ │
│  │   const element = document.createElement('user-mgmt-app');│ │
│  │   element.token = authStore.accessToken;                  │ │
│  │   element.user = authStore.profile;                       │ │
│  │                                                            │ │
│  │   watch(() => authStore.accessToken, (token) => {         │ │
│  │     element.token = token; // Reactive update             │ │
│  │   });                                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │                                      │
└───────────────────────────┼──────────────────────────────────────┘
                            │ Properties
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│           <user-management-app                                   │
│             .token="${token}"                                    │
│             .user="${user}">                                     │
│           </user-management-app>                                 │
│                                                                  │
│  @property({ type: String }) token: string = '';                │
│  @property({ type: Object }) user: any = null;                  │
│                                                                  │
│  updated(changedProps) {                                         │
│    if (changedProps.has('token')) {                             │
│      this.loadUsers(); // React to token change                 │
│    }                                                             │
│  }                                                               │
└──────────────────────────────────────────────────────────────────┘
```

## Communication Flows

### 1. Auth State (Properties)

**Portal → Web Component** (one-way data flow)

```typescript
// Portal: MicroFrontendLoader.vue
const element = document.createElement('user-management-app');
element.token = authStore.accessToken || '';
element.user = authStore.profile || null;
container.appendChild(element);

// Watch for auth changes (login, token refresh)
watch(() => [authStore.accessToken, authStore.profile], ([token, profile]) => {
  if (element) {
    element.token = token || '';
    element.user = profile || null;
  }
});
```

```typescript
// Web Component: user-management-app.ts
@customElement('user-management-app')
export class UserManagementApp extends LitElement {
  @property({ type: String })
  token: string = '';

  @property({ type: Object })
  user: any = null;

  // Lit lifecycle: called when properties change
  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('token')) {
      if (this.token) {
        this.loadUsers(); // Token available, fetch data
      } else {
        this.users = []; // No token, clear data
      }
    }
  }
}
```

### 2. Runtime Events (EventBus)

**Portal → Web Component** (events)

```typescript
// Portal publishes logout
eventBus.publishLogout();

// Web Component listens
eventListener.onLogout(() => {
  this.users = [];
  this.loading = true;
});
```

**Web Component → Portal** (events)

```typescript
// Web Component emits notification
eventListener.emitNotification('User deleted', 'success');

// Portal listens and shows snackbar
eventBus.onNotification((payload) => {
  showSnackbar(payload.message, payload.type);
});
```

## Refresh Behavior

**How it works:**

1. **User refreshes page (F5)**
2. **Browser reloads**
3. **Portal initializes**
   - oidc-client-ts loads user from sessionStorage (built-in)
   - `authStore.loadUser()` gets the user
   - `authStore.accessToken` and `authStore.profile` are populated
4. **Router loads `/users` route**
   - `MicroFrontendLoader` mounts
   - Creates `<user-management-app>` element
   - Sets `element.token = authStore.accessToken`
   - Sets `element.user = authStore.profile`
5. **Web Component receives properties**
   - `updated()` lifecycle method called
   - `changedProperties.has('token')` returns true
   - `this.loadUsers()` called automatically
6. **Result**: ✅ User stays authenticated, data loads

**No custom storage needed** - The portal's oidc-client-ts already handles persistence.

## EventBus Events

### Portal → Web Components

| Event | Payload | Use Case |
|-------|---------|----------|
| `portal:auth:logout` | none | User logged out, clear state |
| `portal:locale:change` | `{ locale: string }` | UI language changed |

### Web Components → Portal

| Event | Payload | Use Case |
|-------|---------|----------|
| `wc:navigate` | `{ path: string, replace?: boolean }` | Request route navigation |
| `wc:error` | `{ message: string, code?: string, source?: string }` | Error occurred, show error snackbar |
| `wc:notification` | `{ message: string, type: 'success' \| 'info' \| 'warning' \| 'error' }` | Show notification snackbar |

## Why Properties > EventBus for Auth?

### ❌ EventBus for Auth (previous approach)
```typescript
// Portal publishes auth
eventBus.publishAuth({ token, user });

// Web Component listens
eventBus.onAuthUpdate((payload) => {
  this.token = payload.token;
  this.user = payload.user;
});

// Problems:
// - Race condition: WC might mount before portal publishes
// - Need sessionStorage to persist across refresh
// - Duplicate storage (oidc-client-ts + custom storage)
// - Coupling with portal's storage keys
```

### ✅ Properties for Auth (current approach)
```typescript
// Portal sets properties
element.token = authStore.accessToken;
element.user = authStore.profile;

// Web Component receives via Lit properties
@property({ type: String }) token: string = '';

// Benefits:
// - Standard Web Component pattern (properties = data)
// - No race condition (property set before mount)
// - No custom storage (portal manages its own)
// - Zero coupling (WC doesn't know about oidc-client-ts)
// - Reactive (Lit re-renders on property change)
```

## Implementation Checklist

### Creating a New Web Component

1. **Define properties**
```typescript
@customElement('my-component')
export class MyComponent extends LitElement {
  @property({ type: String })
  token: string = '';

  @property({ type: Object })
  user: any = null;
}
```

2. **React to property changes**
```typescript
updated(changedProperties: Map<string, any>) {
  if (changedProperties.has('token')) {
    if (this.token) {
      this.loadData();
    }
  }
}
```

3. **Listen to EventBus events**
```typescript
connectedCallback() {
  super.connectedCallback();

  this.unsubLogout = eventListener.onLogout(() => {
    this.data = [];
  });
}

disconnectedCallback() {
  super.disconnectedCallback();
  this.unsubLogout?.();
}
```

4. **Emit events to Portal**
```typescript
private async deleteItem(id: number) {
  await api.delete(id, this.token);
  eventListener.emitNotification('Item deleted', 'success');
}
```

### Registering in Portal

Add to `portal/src/config/microservices.config.ts`:

```typescript
{
  id: 'my-service',
  name: 'My Service',
  componentTag: 'my-component',
  scriptUrl: import.meta.env.DEV
    ? 'http://localhost:3002/src/main.ts'
    : '/microservices/my-service/my-component.js',
  path: '/my-service',
  icon: 'mdi-icon-name',
  showInDashboard: true,
  showInSidebar: true,
}
```

Add route in `portal/src/router/index.ts`:

```typescript
{
  path: '/my-service',
  name: 'my-service',
  component: MicroFrontendLoader,
  props: () => {
    const microservice = getMicroServiceByPath('/my-service');
    if (!microservice) throw new Error('Microservice not found');
    return { microservice };
  },
}
```

## Debugging

### Check auth in Portal
```javascript
// In browser console
authStore = useAuthStore();
console.log('Token:', authStore.accessToken);
console.log('User:', authStore.profile);
```

### Check properties in Web Component
```javascript
// In browser console
const wc = document.querySelector('user-management-app');
console.log('Token:', wc.token);
console.log('User:', wc.user);
```

### Monitor EventBus
```javascript
// Listen to all portal events
eventBus.onAllPortalEvents((eventName, ...args) => {
  console.log('[Portal Event]', eventName, args);
});

// Listen to all WC events
eventBus.onAllWebComponentEvents((eventName, ...args) => {
  console.log('[WC Event]', eventName, args);
});
```

## Security

- **Token storage**: Managed by oidc-client-ts in sessionStorage (secure by default)
- **Token expiration**: oidc-client-ts handles automatic token refresh
- **No token in URLs**: Token passed via JavaScript properties, never in query params
- **HTTPS only in production**: Ensure all communication is encrypted
- **CSP**: Configure Content Security Policy to restrict script sources

## Performance

- **Lazy loading**: Web Components loaded on-demand (route-based)
- **Code splitting**: Each Web Component is a separate bundle
- **Caching**: Built bundles cached by browser
- **Hot reload**: Dev mode supports hot module replacement
- **Small footprint**: eventemitter3 adds only 2KB

## Future Enhancements

- **Shared state library**: Consider adding a shared state store (e.g., Zustand, Jotai) if cross-WC communication is needed
- **Web Component framework**: Evaluate migrating Vue components to Web Components for consistency
- **Module Federation**: Consider Webpack Module Federation for even better code sharing
- **Service Worker**: Add SW for offline support and faster loading
