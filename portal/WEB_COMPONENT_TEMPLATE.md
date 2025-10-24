# Web Component Template for AetherWeave

This template provides a starting point for creating Web Components that integrate with the AetherWeave portal.

## File Structure

```
your-service/
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── event-bus.service.ts     # EventBus integration
│   │   ├── your-component.ts             # Main Lit component
│   │   └── main.ts                       # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
```

## 1. event-bus.service.ts

```typescript
/**
 * EventBus Service for Web Components
 *
 * Connects to the shared EventBus instance exposed by the portal.
 * Provides type-safe event communication and auth state management.
 */

import EventEmitter from 'eventemitter3';

export interface AuthPayload {
  token: string;
  user: {
    username?: string;
    email?: string;
    name?: string;
    preferred_username?: string;
    roles?: string[];
    [key: string]: any;
  };
}

export interface LocalePayload {
  locale: string;
}

export const EventType = {
  // Portal → Web Components
  AUTH_UPDATE: 'portal:auth:update',
  AUTH_LOGOUT: 'portal:auth:logout',
  LOCALE_CHANGE: 'portal:locale:change',

  // Web Components → Portal
  NAVIGATE: 'wc:navigate',
  ERROR: 'wc:error',
  NOTIFICATION: 'wc:notification',
} as const;

/**
 * Get the shared EventBus instance from the portal
 */
function getSharedEventBus(): EventEmitter {
  if (!(window as any).__AETHERWEAVE_EVENT_BUS__) {
    throw new Error(
      '[EventBus] Portal EventBus not found. Ensure portal is loaded first.'
    );
  }
  return (window as any).__AETHERWEAVE_EVENT_BUS__;
}

class WebComponentEventBus {
  private emitter: EventEmitter;
  private token: string | null = null;
  private user: any = null;
  private locale: string = 'en';

  constructor() {
    try {
      this.emitter = getSharedEventBus();
      console.log('[WC EventBus] Connected to portal EventBus');

      // Load persisted state immediately
      this.loadPersistedState();
    } catch (error) {
      console.error('[WC EventBus] Failed to connect:', error);
      throw error;
    }
  }

  /**
   * Load persisted state from sessionStorage
   */
  private loadPersistedState(): void {
    // Load auth
    const token = sessionStorage.getItem('aetherweave:auth:token');
    const userJson = sessionStorage.getItem('aetherweave:auth:user');

    if (token && userJson) {
      try {
        this.token = token;
        this.user = JSON.parse(userJson);
        console.log('[WC EventBus] Loaded persisted auth:', this.user.username);
      } catch (error) {
        console.error('[WC EventBus] Failed to parse persisted auth:', error);
      }
    }

    // Load locale
    const locale = sessionStorage.getItem('aetherweave:locale');
    if (locale) {
      this.locale = locale;
    }
  }

  // ============================================================================
  // LISTENERS (Portal → Web Component)
  // ============================================================================

  /**
   * Listen for auth updates from portal
   * IMPORTANT: Immediately invoked with persisted state if available
   */
  onAuthUpdate(callback: (payload: AuthPayload) => void): () => void {
    const handler = (payload: AuthPayload) => {
      this.token = payload.token;
      this.user = payload.user;
      console.log('[WC EventBus] Auth updated:', this.user.username);
      callback(payload);
    };

    this.emitter.on(EventType.AUTH_UPDATE, handler);

    // Immediately invoke with persisted state
    if (this.token && this.user) {
      console.log('[WC EventBus] Providing persisted auth to listener');
      handler({ token: this.token, user: this.user });
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
   * Listen for locale changes from portal
   * IMPORTANT: Immediately invoked with persisted locale if available
   */
  onLocaleChange(callback: (payload: LocalePayload) => void): () => void {
    const handler = (payload: LocalePayload) => {
      this.locale = payload.locale;
      console.log('[WC EventBus] Locale changed:', this.locale);
      callback(payload);
    };

    this.emitter.on(EventType.LOCALE_CHANGE, handler);

    // Immediately invoke with persisted locale
    if (this.locale) {
      handler({ locale: this.locale });
    }

    return () => this.emitter.off(EventType.LOCALE_CHANGE, handler);
  }

  // ============================================================================
  // GETTERS (Synchronous access to state)
  // ============================================================================

  /**
   * Get current auth token (persisted across refresh)
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Get current user (persisted across refresh)
   */
  getUser(): any {
    return this.user;
  }

  /**
   * Get current locale
   */
  getLocale(): string {
    return this.locale;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // ============================================================================
  // EMITTERS (Web Component → Portal)
  // ============================================================================

  /**
   * Request navigation to a route
   */
  navigate(path: string, replace = false): void {
    this.emitter.emit(EventType.NAVIGATE, { path, replace });
    console.log(`[WC EventBus] Navigation requested: ${path}`);
  }

  /**
   * Emit error to portal (will show error snackbar)
   */
  emitError(message: string, code?: string, source?: string): void {
    this.emitter.emit(EventType.ERROR, { message, code, source });
    console.error(`[WC EventBus] Error emitted:`, message);
  }

  /**
   * Emit notification to portal (will show snackbar)
   */
  emitNotification(
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info'
  ): void {
    this.emitter.emit(EventType.NOTIFICATION, { message, type });
    console.log(`[WC EventBus] Notification (${type}): ${message}`);
  }
}

// Export singleton
export const eventBus = new WebComponentEventBus();
```

## 2. your-component.ts (Lit Example)

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { eventBus } from './services/event-bus.service';

@customElement('your-component')
export class YourComponent extends LitElement {
  @state() private authenticated = false;
  @state() private username = '';
  @state() private data: any[] = [];
  @state() private loading = false;
  @state() private locale = 'en';

  // Cleanup functions
  private unsubAuth?: () => void;
  private unsubLogout?: () => void;
  private unsubLocale?: () => void;

  static styles = css\`
    :host {
      display: block;
      padding: 16px;
    }

    .loading {
      text-align: center;
      padding: 20px;
    }

    .not-authenticated {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  \`;

  connectedCallback() {
    super.connectedCallback();
    console.log('[YourComponent] Connected');

    // Listen for auth updates
    this.unsubAuth = eventBus.onAuthUpdate((payload) => {
      this.authenticated = true;
      this.username = payload.user.username || payload.user.email || 'User';
      console.log('[YourComponent] Authenticated as:', this.username);
      this.loadData();
    });

    // Listen for logout
    this.unsubLogout = eventBus.onLogout(() => {
      this.authenticated = false;
      this.username = '';
      this.data = [];
      console.log('[YourComponent] Logged out');
    });

    // Listen for locale changes
    this.unsubLocale = eventBus.onLocaleChange((payload) => {
      this.locale = payload.locale;
      console.log('[YourComponent] Locale changed:', this.locale);
    });

    // Check if already authenticated (handles page refresh)
    if (eventBus.isAuthenticated()) {
      this.authenticated = true;
      this.username = eventBus.getUser()?.username || 'User';
      this.locale = eventBus.getLocale();
      console.log('[YourComponent] Already authenticated, loading data');
      this.loadData();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    console.log('[YourComponent] Disconnected');

    // Cleanup event listeners
    this.unsubAuth?.();
    this.unsubLogout?.();
    this.unsubLocale?.();
  }

  private async loadData() {
    const token = eventBus.getToken();
    if (!token) {
      eventBus.emitError(
        'No authentication token',
        'AUTH_ERROR',
        'your-component'
      );
      return;
    }

    this.loading = true;

    try {
      const response = await fetch('http://localhost:8000/api/v1/your-endpoint/', {
        headers: {
          Authorization: \`Bearer \${token}\`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }

      this.data = await response.json();
      eventBus.emitNotification('Data loaded successfully', 'success');
    } catch (error: any) {
      console.error('[YourComponent] Failed to load data:', error);
      eventBus.emitError(
        \`Failed to load data: \${error.message}\`,
        'API_ERROR',
        'your-component'
      );
    } finally {
      this.loading = false;
    }
  }

  private handleNavigate(path: string) {
    eventBus.navigate(path);
  }

  render() {
    if (!this.authenticated) {
      return html\`
        <div class="not-authenticated">
          <p>Please log in to view this content.</p>
        </div>
      \`;
    }

    if (this.loading) {
      return html\`
        <div class="loading">
          <p>Loading...</p>
        </div>
      \`;
    }

    return html\`
      <div>
        <h2>Your Component</h2>
        <p>Welcome, \${this.username}!</p>
        <p>Current locale: \${this.locale}</p>

        <div>
          <h3>Data</h3>
          <ul>
            \${this.data.map((item) => html\`<li>\${item.name}</li>\`)}
          </ul>
        </div>

        <button @click=\${() => this.handleNavigate('/other-page')}>
          Navigate
        </button>
      </div>
    \`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'your-component': YourComponent;
  }
}
```

## 3. main.ts (Entry Point)

```typescript
import './your-component';

console.log('[YourComponent] Web Component loaded');
```

## 4. package.json

```json
{
  "name": "your-service-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 3001",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "eventemitter3": "^5.0.1",
    "lit": "^3.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "vite": "^7.0.0"
  }
}
```

## 5. vite.config.ts

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      formats: ['es'],
      fileName: () => 'your-component.js',
    },
    rollupOptions: {
      external: [],
    },
  },
  server: {
    port: 3001, // Unique port for each Web Component
  },
});
```

## 6. tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "useDefineForClassFields": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Usage in Portal

Add your Web Component to the portal configuration:

```typescript
// portal/src/config/microservices.config.ts
export const microservices: MicroserviceConfig[] = [
  {
    id: 'your-service',
    name: 'Your Service',
    tagName: 'your-component',
    scriptUrl: import.meta.env.DEV
      ? 'http://localhost:3001/src/main.ts'
      : '/microservices/your-service/your-component.js',
    route: '/your-service',
    icon: 'mdi-youricon',
  },
];
```

## Key Patterns

### ✅ DO: Check for existing auth on mount
```typescript
connectedCallback() {
  super.connectedCallback();

  // Register listener
  this.unsubAuth = eventBus.onAuthUpdate((payload) => {
    this.loadData();
  });

  // Check existing state (handles refresh)
  if (eventBus.isAuthenticated()) {
    this.loadData();
  }
}
```

### ❌ DON'T: Only rely on events
```typescript
connectedCallback() {
  super.connectedCallback();

  // BAD: Won't work on page refresh!
  eventBus.onAuthUpdate((payload) => {
    this.loadData();
  });
  // Missing: Check for existing token
}
```

### ✅ DO: Clean up listeners
```typescript
disconnectedCallback() {
  super.disconnectedCallback();
  this.unsubAuth?.();
  this.unsubLogout?.();
}
```

## Testing Refresh

1. Log in to the portal
2. Navigate to your Web Component
3. Refresh the page (F5)
4. ✅ Component should remain authenticated
5. ✅ Data should load automatically

Check browser console for:
```
[EventBus] Initialized with EventEmitter3
[EventBus] Restoring auth state from sessionStorage
[WC EventBus] Connected to portal EventBus
[WC EventBus] Loaded persisted auth: username
[YourComponent] Already authenticated, loading data
```

## Troubleshooting

See [EVENT_BUS.md](./EVENT_BUS.md) for detailed troubleshooting.
