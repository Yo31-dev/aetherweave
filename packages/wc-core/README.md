# @aetherweave/wc-core

Framework-agnostic core library for AetherWeave Web Components.

Provides types, EventBus client, and API client for seamless Portal ↔ Web Component communication.

## Features

- **Framework-agnostic**: Works with Lit, React, Vue, Angular, Svelte, etc.
- **Type-safe**: Full TypeScript support with exported types
- **EventBus communication**: Bidirectional events between Portal and Web Components
- **API client**: HTTP client with JWT authentication built-in
- **Stateful events**: Late joiner pattern for cross-component communication
- **Zero dependencies** (except eventemitter3)

## Installation

```bash
# In a pnpm workspace (local development)
pnpm add @aetherweave/wc-core

# Or from npm (when published)
npm install @aetherweave/wc-core
```

## Usage

### EventBus Client

Connect to the Portal's EventBus for bidirectional communication:

```typescript
import { EventBusClient } from '@aetherweave/wc-core';

// Create client instance
const eventBus = new EventBusClient({
  source: 'my-component',  // Component identifier for logging
  locale: 'en',            // Initial locale
  debug: true,             // Enable console logging
});

// Listen for Portal events
eventBus.onLogout(() => {
  console.log('User logged out');
  // Clear component state
});

eventBus.onLocaleChange((payload) => {
  console.log('Locale changed to:', payload.locale);
  // Update component translations
});

eventBus.onPortalReady(() => {
  console.log('Portal is ready');
  // Re-register metadata (handles refresh timing race)
});

// Emit events to Portal
eventBus.navigate('/users/123');
eventBus.emitNotification('Operation successful', 'success');
eventBus.emitError('Something went wrong', 'ERR_001');

// Set page title and navigation
eventBus.setPageTitle('User Management', 'List Users');
eventBus.registerNavigation([
  {
    label: 'Users',
    children: [
      { label: 'List', path: '/users' },
      { label: 'Create', path: '/users/create' }
    ]
  }
], '/users');
```

### API Client

HTTP client with automatic JWT token injection:

```typescript
import { ApiClient, EventBusClient } from '@aetherweave/wc-core';

// Basic usage (manual token management)
const api = new ApiClient({
  baseUrl: 'http://localhost:8000/api/v1',
  token: 'your-jwt-token',
  debug: true,
});

// Make requests
const users = await api.get('/users');
const newUser = await api.post('/users', { name: 'John', email: 'john@example.com' });
await api.put('/users/123', { name: 'Jane' });
await api.delete('/users/123');

// Update token dynamically
api.setToken('new-token');

// 🚀 RECOMMENDED: Auto-sync with EventBus (automatic token management!)
const eventBus = new EventBusClient({ source: 'my-component' });
const api = new ApiClient({
  baseUrl: 'http://localhost:8000/api/v1',
  token: 'your-jwt-token',
  eventBus: eventBus,  // ✨ MAGIC! Auto token refresh & logout
});

// Token is now automatically:
// - Updated when Portal emits AUTH_TOKEN_REFRESHED
// - Cleared when Portal emits AUTH_LOGOUT
// No manual token management needed! 🎉

// Don't forget cleanup
api.destroy();  // Unsubscribes from EventBus
```

### Stateful Events (Cross-Component Communication)

For composed pages with multiple Web Components that need to share state:

```typescript
// Component A emits user selection
eventBus.emitStateful('user:selected', { userId: 123, userName: 'John' });

// Component B (loaded later) receives the state immediately
eventBus.onStateful('user:selected', (data) => {
  console.log('Selected user:', data.userId);
  // Component B can react to the selection even if it loads after emission
});
```

### Types

Import shared types for type-safe event payloads:

```typescript
import type {
  AuthPayload,
  LocalePayload,
  NavigationItem,
  PageTitlePayload,
  ErrorPayload,
  NotificationPayload,
} from '@aetherweave/wc-core';

import { EventType } from '@aetherweave/wc-core';

console.log(EventType.AUTH_LOGOUT); // 'portal:auth:logout'
```

## Complete Example (Lit Web Component)

```typescript
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { EventBusClient, ApiClient } from '@aetherweave/wc-core';

@customElement('my-component')
export class MyComponent extends LitElement {
  @property({ type: String }) token = '';
  @property({ type: String }) lang = 'en';

  private eventBus!: EventBusClient;
  private api!: ApiClient;
  private unsubscribers: Array<() => void> = [];

  connectedCallback() {
    super.connectedCallback();

    // Initialize EventBus
    this.eventBus = new EventBusClient({
      source: 'my-component',
      locale: this.lang,
      debug: true,
    });

    // Initialize API client with auto-sync
    this.api = new ApiClient({
      baseUrl: 'http://localhost:8000/api/v1',
      token: this.token,
      eventBus: this.eventBus,  // ✨ Auto token refresh & logout!
    });

    // Listen for Portal events
    this.unsubscribers.push(
      this.eventBus.onLogout(() => this.handleLogout()),
      this.eventBus.onLocaleChange((p) => this.handleLocaleChange(p.locale)),
      this.eventBus.onPortalReady(() => this.registerMetadata()),

      // Still need to listen to token refresh for component properties
      this.eventBus.onTokenRefresh((payload) => {
        this.token = payload.token;  // Update Lit property
        // api.setToken() is automatic! ✨
      })
    );

    // Register with Portal
    this.registerMetadata();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Cleanup
    this.unsubscribers.forEach(unsub => unsub());
    this.eventBus.clearNavigation();
    this.api.destroy();  // ✨ Cleanup ApiClient subscriptions
  }

  private registerMetadata() {
    this.eventBus.setPageTitle('My Component');
    this.eventBus.registerNavigation([
      { label: 'Home', path: '/' }
    ], '/');
  }

  private handleLogout() {
    // Clear component state
    // api.clearToken() is automatic! ✨
  }

  private handleLocaleChange(locale: string) {
    // Update translations
  }

  render() {
    return html`<div>My Component</div>`;
  }
}
```

## API Reference

### EventBusClient

#### Constructor

```typescript
new EventBusClient(config: EventBusClientConfig)
```

**Config options:**
- `source: string` - Component identifier for logging
- `locale?: string` - Initial locale (default: 'en')
- `debug?: boolean` - Enable console logging (default: false)

#### Portal → Web Component Events (Listeners)

- `onLogout(callback: () => void): () => void`
- `onTokenRefresh(callback: (payload: AuthPayload) => void): () => void`
- `onLocaleChange(callback: (payload: LocalePayload) => void): () => void`
- `onPortalReady(callback: () => void): () => void`

#### Web Component → Portal Events (Emitters)

- `navigate(path: string, replace?: boolean): void`
- `emitError(message: string, code?: string, source?: string): void`
- `emitNotification(message: string, type?: 'success' | 'info' | 'warning' | 'error'): void`
- `emitLog(message: string, level: 'error' | 'debug' | 'info', meta?: any): void`
- `setPageTitle(title: string, subtitle?: string): void`
- `registerNavigation(items: NavigationItem[], baseRoute: string): void`
- `clearNavigation(): void`

#### Stateful Events

- `emitStateful(eventName: string, payload: any): void`
- `onStateful(eventName: string, callback: (payload: any) => void): () => void`
- `getState(eventName: string): any | undefined`
- `clearState(eventName?: string): void`

#### Utilities

- `getLocale(): string`
- `getSource(): string`

### ApiClient

#### Constructor

```typescript
new ApiClient(config: ApiClientConfig)
```

**Config options:**
- `baseUrl: string` - API base URL
- `token?: string` - JWT token
- `eventBus?: EventBusClient` - EventBus for auto-sync (token refresh & logout)
- `headers?: Record<string, string>` - Custom headers
- `timeout?: number` - Request timeout in ms (default: 30000)
- `debug?: boolean` - Enable console logging (default: false)

#### HTTP Methods

- `get<T>(path: string, options?: RequestInit): Promise<T>`
- `post<T>(path: string, body?: any, options?: RequestInit): Promise<T>`
- `put<T>(path: string, body?: any, options?: RequestInit): Promise<T>`
- `patch<T>(path: string, body?: any, options?: RequestInit): Promise<T>`
- `delete<T>(path: string, options?: RequestInit): Promise<T>`

#### Token Management

- `setToken(token: string): void`
- `clearToken(): void`
- `getToken(): string | undefined`

#### Header Management

- `setHeader(key: string, value: string): void`
- `removeHeader(key: string): void`

#### Lifecycle

- `destroy(): void` - Cleanup EventBus subscriptions (call in disconnectedCallback)

## Event Types

All event type constants are available in the `EventType` object:

```typescript
EventType.AUTH_LOGOUT              // 'portal:auth:logout'
EventType.AUTH_TOKEN_REFRESHED     // 'portal:auth:token-refreshed'
EventType.LOCALE_CHANGE            // 'portal:locale:change'
EventType.PORTAL_READY             // 'portal:ready'
EventType.NAVIGATE                 // 'wc:navigate'
EventType.ERROR                    // 'wc:error'
EventType.NOTIFICATION             // 'wc:notification'
EventType.LOG                      // 'wc:log'
EventType.PAGE_TITLE_SET           // 'wc:page:setTitle'
EventType.PAGE_NAVIGATION_REGISTER // 'wc:page:registerNavigation'
EventType.PAGE_NAVIGATION_CLEAR    // 'wc:page:clearNavigation'
```

## Important Notes

### Translation Loading

When using `setPageTitle()` or `registerNavigation()` with translations, **always load translations first**:

```typescript
// ❌ BAD - translations not loaded, will show keys
eventBus.setPageTitle(get('title'));

// ✅ GOOD - wait for translations
await use(this.lang);
eventBus.setPageTitle(get('title'));
```

### Portal Ready Event

To handle timing race conditions on page refresh, listen for `portal:ready`:

```typescript
eventBus.onPortalReady(async () => {
  await use(this.lang);  // Load translations
  eventBus.setPageTitle(get('title'));
  eventBus.registerNavigation(/* ... */);
});
```

## License

MIT
