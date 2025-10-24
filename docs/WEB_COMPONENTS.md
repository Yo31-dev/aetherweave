# Web Components Guide - AetherWeave

**Context**: This file explains how to create and integrate Web Components (micro-frontends) in AetherWeave.

**Read this file when**:
- Creating a new Web Component
- Working on WC frontend code
- Integrating a WC with the Portal
- Understanding WC architecture
- Debugging WC issues

## Overview

### What is a Web Component in AetherWeave?

A **Web Component** (WC) is a self-contained micro-frontend that:
- Is built with **Lit** (v3) - lightweight web components library
- Runs independently in the browser
- Receives authentication from the Portal via properties
- Communicates with the Portal via EventBus
- Has its own i18n system (lit-translate)
- Calls backend APIs directly (with JWT token)

### Technology Stack

- **Framework**: Lit 3 (Web Components standard)
- **Language**: TypeScript
- **UI**: Material Web Components (@material/web)
- **i18n**: lit-translate (JSON format, inline translations)
- **Build**: Vite
- **Dev Server**: Vite dev server (HMR)

## Directory Structure

```
services/my-service/
├── backend/              # NestJS backend (see BACKEND.md)
├── frontend/             # Web Component (THIS)
│   ├── src/
│   │   ├── my-service-app.ts       # Main WC class
│   │   ├── services/
│   │   │   └── event-listener.service.ts  # EventBus integration
│   │   ├── i18n/
│   │   │   ├── index.ts            # lit-translate config
│   │   │   └── locales/
│   │   │       ├── en.ts           # English (inline)
│   │   │       └── fr.ts           # French (inline)
│   │   ├── styles/
│   │   │   └── styles.ts           # Lit CSS
│   │   └── main.ts                 # Entry point
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── I18N_README.md              # i18n doc
├── docker-compose.yml
└── Dockerfile
```

## Creating a New Web Component

### Step 1: Create Service Directory

```bash
mkdir -p services/my-service/frontend
cd services/my-service/frontend
```

### Step 2: Initialize Project

```bash
pnpm init
```

### Step 3: Install Dependencies

```bash
# Core
pnpm add lit @lit/context

# Material Web Components
pnpm add @material/web

# i18n
pnpm add lit-translate

# Dev dependencies
pnpm add -D vite typescript
pnpm add -D @types/node
```

### Step 4: Create `vite.config.ts`

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      formats: ['es'],
      fileName: 'my-service',
    },
    rollupOptions: {
      external: [],
    },
  },
  server: {
    port: 3002, // Unique port per WC
    host: '0.0.0.0',
  },
});
```

### Step 5: Create `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "experimentalDecorators": true
  },
  "include": ["src"]
}
```

### Step 6: Create EventBus Integration

**File**: `src/services/event-listener.service.ts`

```typescript
/**
 * EventBus integration for Portal ↔ Web Component communication
 */

interface EventPayload {
  [key: string]: any;
}

class EventListenerService {
  /**
   * Subscribe to locale changes from Portal
   */
  onLocaleChange(callback: (payload: { locale: string }) => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent;
      callback(customEvent.detail);
    };

    window.addEventListener('portal:locale-change', handler);

    return () => window.removeEventListener('portal:locale-change', handler);
  }

  /**
   * Emit an error to Portal
   */
  emitError(message: string, code?: string, source?: string): void {
    window.dispatchEvent(
      new CustomEvent('wc:error', {
        detail: { message, code, source },
      })
    );
  }

  /**
   * Emit a notification to Portal
   */
  emitNotification(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info'): void {
    window.dispatchEvent(
      new CustomEvent('wc:notification', {
        detail: { message, type },
      })
    );
  }

  /**
   * Emit a log message to Portal
   */
  emitLog(
    message: string,
    level: 'error' | 'debug' | 'info' = 'info',
    source?: string,
    meta?: any
  ): void {
    window.dispatchEvent(
      new CustomEvent('wc:log', {
        detail: { message, level, source, meta },
      })
    );
  }
}

export const eventListener = new EventListenerService();
```

### Step 7: Setup i18n

**File**: `src/i18n/index.ts`

```typescript
import { registerTranslateConfig, use, translate as t } from 'lit-translate';

registerTranslateConfig({
  loader: async (lang: string) => {
    switch (lang) {
      case 'en':
        return (await import('./locales/en')).default;
      case 'fr':
        return (await import('./locales/fr')).default;
      default:
        return (await import('./locales/en')).default;
    }
  }
});

export { t as translate, use };
export { get } from 'lit-translate';

// Default language
use('en');
```

**File**: `src/i18n/locales/en.ts`

```typescript
export default {
  title: 'My Service',
  actions: {
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
  },
  // ... more translations
};
```

**File**: `src/i18n/locales/fr.ts`

```typescript
export default {
  title: 'Mon Service',
  actions: {
    create: 'Créer',
    edit: 'Modifier',
    delete: 'Supprimer',
  },
  // ... more translations
};
```

### Step 8: Create Main Web Component

**File**: `src/my-service-app.ts`

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { translate, use } from './i18n';
import { eventListener } from './services/event-listener.service';

@customElement('my-service-app')
export class MyServiceApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }
  `;

  /**
   * JWT token from Portal (passed as property)
   */
  @property({ type: String })
  token: string = '';

  /**
   * User profile from Portal (passed as property)
   */
  @property({ type: Object })
  user: any = null;

  /**
   * Language from Portal (passed as property)
   */
  @property({ type: String })
  lang: string = 'en';

  private unsubLocale?: () => void;

  connectedCallback() {
    super.connectedCallback();

    // Load initial locale
    use(this.lang).catch(err => {
      eventListener.emitLog(`Failed to load locale ${this.lang}: ${err}`, 'error', 'MyServiceApp');
    });

    // Listen to locale changes from Portal
    this.unsubLocale = eventListener.onLocaleChange(async (payload) => {
      eventListener.emitLog(`Locale changed to: ${payload.locale}`, 'debug', 'MyServiceApp');
      try {
        await use(payload.locale);
        this.requestUpdate(); // Force re-render
      } catch (err) {
        eventListener.emitLog(`Failed to change locale: ${err}`, 'error', 'MyServiceApp');
      }
    });

    // Log that component is loaded
    eventListener.emitLog('MyServiceApp loaded', 'info', 'MyServiceApp');
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Cleanup
    if (this.unsubLocale) {
      this.unsubLocale();
    }
  }

  updated(changedProperties: Map<string, any>) {
    // Watch for lang property changes from Portal
    if (changedProperties.has('lang') && this.lang) {
      use(this.lang).catch(err => {
        eventListener.emitLog(`Failed to load locale ${this.lang}: ${err}`, 'error', 'MyServiceApp');
      });
    }

    // Watch for token changes
    if (changedProperties.has('token')) {
      if (this.token) {
        eventListener.emitLog('Token received', 'debug', 'MyServiceApp');
        this.loadData();
      }
    }
  }

  private async loadData() {
    try {
      // Call backend API with JWT token
      const response = await fetch('http://localhost:3000/my-endpoint', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      eventListener.emitLog('Data loaded', 'info', 'MyServiceApp', { count: data.length });
    } catch (error) {
      eventListener.emitError(`Failed to load data: ${error}`, 'LOAD_ERROR', 'MyServiceApp');
    }
  }

  render() {
    if (!this.token) {
      return html`
        <div>
          <h2>${translate('messages.notAuthenticated')}</h2>
          <p>${translate('messages.pleaseLogin')}</p>
        </div>
      `;
    }

    return html`
      <h1>${translate('title')}</h1>
      <p>User: ${this.user?.preferred_username || 'Unknown'}</p>
      <!-- Your UI here -->
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-service-app': MyServiceApp;
  }
}
```

### Step 9: Create Entry Point

**File**: `src/main.ts`

```typescript
import './my-service-app';

// Optional: Material Web Components
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
// ... import other MWC components as needed
```

### Step 10: Create index.html (for dev)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Service - Dev</title>
  </head>
  <body>
    <my-service-app token="fake-token-for-dev" lang="en"></my-service-app>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

### Step 11: Add Scripts to package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Step 12: Register in Portal

**File**: `portal/src/config/microservices.config.ts`

```typescript
{
  id: 'my-service',
  name: 'My Service',
  title: 'My Service',
  icon: 'mdi-your-icon',
  path: '/my-service',
  componentTag: 'my-service-app',
  scriptUrl: import.meta.env.DEV
    ? 'http://localhost:3002/src/main.ts'
    : '/microservices/my-service/my-service.js',
  devPort: 3002,
  requiresAuth: true,
  description: 'My service description',
  showInNav: true,
  showInDashboard: true,
}
```

**File**: `portal/src/router/index.ts`

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

### Step 13: Add Translations to Portal

**File**: `portal/src/i18n/locales/en.json`

```json
{
  "nav": {
    "my-service": "My Service"
  }
}
```

## Web Component Properties

### Required Properties

The Portal passes these properties to every WC:

```typescript
@property({ type: String })
token: string = '';  // JWT access token

@property({ type: Object })
user: any = null;    // User profile (from OIDC)

@property({ type: String })
lang: string = 'en'; // Current locale
```

### Handling Token

**Check if authenticated**:
```typescript
if (!this.token) {
  return html`<p>Not authenticated</p>`;
}
```

**Call backend API**:
```typescript
const response = await fetch('http://localhost:3000/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${this.token}`,
    'Content-Type': 'application/json',
  },
});
```

**In development**: Use fake token in `index.html` for standalone testing

### Handling User

```typescript
// User profile structure (from OIDC)
{
  sub: string;                  // Subject (user ID)
  preferred_username: string;   // Username
  name: string;                 // Full name
  email: string;                // Email
  email_verified: boolean;      // Email verified
  // ... other OIDC claims
}
```

### Handling Language

```typescript
updated(changedProperties: Map<string, any>) {
  if (changedProperties.has('lang') && this.lang) {
    use(this.lang).catch(err => {
      eventListener.emitLog(`Failed to load locale: ${err}`, 'error');
    });
  }
}
```

## EventBus Communication

### Subscribe to Events

```typescript
// Locale change
this.unsubLocale = eventListener.onLocaleChange((payload) => {
  console.log('Locale changed:', payload.locale);
});

// Cleanup in disconnectedCallback
if (this.unsubLocale) {
  this.unsubLocale();
}
```

### Emit Events

```typescript
// Error
eventListener.emitError('Something went wrong', 'ERR_CODE', 'MyComponent');

// Notification (success, info, warning, error)
eventListener.emitNotification('User created successfully', 'success');

// Log (for debugging)
eventListener.emitLog('Debug info', 'debug', 'MyComponent', { foo: 'bar' });
```

## i18n System

### Configuration

See `I18N_README.md` in each WC directory

### Key Points

- **Format**: JSON (inline, bundled in JS)
- **Library**: lit-translate (0.8 KB gzipped)
- **Lazy loading**: Separate chunks per language (en-[hash].js, fr-[hash].js)
- **Sync with Portal**: Via EventBus (`portal:locale-change`)
- **Dual sync**: Property `lang` + EventBus (redundancy)

### Usage in Templates

```typescript
import { translate } from './i18n';

render() {
  return html`
    <h1>${translate('title')}</h1>
    <button>${translate('actions.create')}</button>
  `;
}
```

### Dynamic Translations

```typescript
import { get } from './i18n';

const message = get('messages.welcome', { name: 'John' });
```

## Styling

### Lit CSS

```typescript
static styles = css`
  :host {
    display: block;
    padding: 16px;
  }

  h1 {
    color: var(--md-sys-color-primary);
  }
`;
```

### Material Web Components

```typescript
import '@material/web/button/filled-button.js';

render() {
  return html`
    <md-filled-button @click=${this.handleClick}>
      Click me
    </md-filled-button>
  `;
}
```

### Shadow DOM

Lit uses Shadow DOM by default:
- ✅ Styles are scoped (no leakage)
- ✅ Encapsulation
- ⚠️ Can't use global styles from Portal
- Use CSS custom properties (variables) for theming

## API Calls

### Pattern

```typescript
private async fetchData() {
  try {
    const response = await fetch(`${this.apiUrl}/endpoint`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    eventListener.emitError(`API call failed: ${error}`, 'API_ERROR', 'MyComponent');
    throw error;
  }
}
```

### Best Practices

- ✅ Always pass `Authorization` header with JWT token
- ✅ Handle errors gracefully
- ✅ Emit errors to Portal via EventBus
- ✅ Log important events
- ✅ Use environment variables for API URLs (dev vs prod)

## Development Workflow

### Run Standalone

```bash
cd services/my-service/frontend
pnpm run dev
# Open http://localhost:3002
```

### Run with Portal

Terminal 1 (Portal):
```bash
cd portal
pnpm run dev
# Open http://localhost:5173
```

Terminal 2 (WC):
```bash
cd services/my-service/frontend
pnpm run dev
# WC served on http://localhost:3002
```

Portal will load WC from dev server (HMR works!)

### Build for Production

```bash
pnpm run build
# Output: dist/my-service.js
```

Copy to portal public directory or serve via APISIX.

## Testing

### Unit Tests (TODO)

Use Vitest + @web/test-runner

### E2E Tests (TODO)

Use Playwright

### Manual Testing

1. Run WC standalone with fake token
2. Test in Portal (dev mode)
3. Test authentication flow
4. Test locale changes
5. Test error handling

## Common Issues

### WC not loading

- Check script URL in `microservices.config.ts`
- Check dev server is running (correct port)
- Check browser console for errors
- Check Network tab for script load

### "Multiple versions of Lit loaded"

- Check dependencies (use `pnpm why lit`)
- Add pnpm overrides in `package.json`:
  ```json
  {
    "pnpm": {
      "overrides": {
        "lit": "^3.3.1"
      }
    }
  }
  ```
- Run `pnpm install`

### Translations not working

- Check translations are inline (not HTTP fetched)
- Check lit-translate config uses dynamic imports
- Check browser console for import errors
- Verify translation keys exist

### Token not received

- Check Portal auth state (`authStore.isAuthenticated`)
- Check `MicroFrontendLoader` passes token
- Check WC `@property` decorator is correct
- Log token in `updated()` lifecycle

## Best Practices

### ✅ Do

- Use TypeScript for type safety
- Use Lit decorators (`@property`, `@state`, `@customElement`)
- Emit logs via EventBus (not console.log)
- Handle authentication (check `token` property)
- Use lit-translate for i18n
- Keep components small and focused
- Use Shadow DOM for encapsulation
- Log important events (load, errors, API calls)

### ❌ Don't

- Don't use global styles (use CSS custom properties)
- Don't bypass JWT authentication
- Don't hardcode API URLs (use env variables)
- Don't forget to cleanup subscriptions in `disconnectedCallback`
- Don't use `console.log` directly (use EventBus logs)
- Don't create circular dependencies
- Don't forget to handle errors

## Related Documentation

- [PORTAL.md](../portal/PORTAL.md) - Portal architecture
- [BACKEND.md](./BACKEND.md) - Backend services (NestJS)
- [CLAUDE.md](../CLAUDE.md) - Main project documentation
- `I18N_README.md` - Detailed i18n docs (in each WC directory)
