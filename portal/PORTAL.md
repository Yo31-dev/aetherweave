# Portal Architecture - AetherWeave

**Context**: This file documents the Portal (Vue.js shell app) that orchestrates micro-frontends.

**Read this file when**:
- Starting work on the portal
- Adding new features to the portal (routing, authentication, etc.)
- Understanding the portal architecture
- Debugging portal-level issues

## Architecture Overview

### Portal Role

The Portal is the **orchestrator shell** that:
- Manages authentication (OAuth2/OIDC)
- Loads and displays Web Components (micro-frontends)
- Provides shared services (EventBus, Logging, Settings)
- Handles navigation and routing
- Manages global state (auth, locale, logs)
- Composes multiple Web Components into single pages (see [COMPOSED_PAGES.md](../docs/COMPOSED_PAGES.md))

### Technology Stack

- **Framework**: Vue.js 3 + TypeScript
- **UI Library**: Vuetify 3 (Material Design)
- **State Management**: Pinia stores
- **Routing**: Vue Router
- **i18n**: vue-i18n (JSON format)
- **Build Tool**: Vite
- **Auth**: oidc-client-ts (provider-agnostic)

## Directory Structure

```
portal/
├── src/
│   ├── components/          # Reusable Vue components
│   │   ├── AppSidebar.vue   # Navigation sidebar
│   │   ├── AppBreadcrumbs.vue
│   │   └── MicroFrontendLoader.vue  # WC loader (IMPORTANT)
│   ├── views/               # Route views
│   │   ├── DashboardView.vue
│   │   ├── admin/
│   │   │   ├── SettingsView.vue
│   │   │   └── LogsAdminView.vue
│   │   └── CallbackView.vue # OAuth2 callback
│   ├── layouts/
│   │   └── DefaultLayout.vue # Main layout (header, sidebar, main)
│   ├── stores/              # Pinia stores
│   │   ├── auth.store.ts    # Authentication state
│   │   └── log.store.ts     # Log drawer state
│   ├── services/            # Shared services
│   │   ├── auth.service.ts  # OAuth2/OIDC authentication
│   │   ├── event-bus.service.ts  # Portal ↔ WC communication
│   │   ├── log.service.ts   # Centralized logging
│   │   ├── log-storage.service.ts # IndexedDB for logs
│   │   ├── settings.service.ts # IndexedDB for settings
│   │   └── data-reset.service.ts # Clear all data
│   ├── composables/
│   │   └── useMicroFrontend.ts # Script loading logic
│   ├── config/
│   │   └── microservices.config.ts  # WC registry (IMPORTANT)
│   ├── i18n/
│   │   └── locales/
│   │       ├── en.json      # English translations
│   │       └── fr.json      # French translations
│   ├── router/
│   │   └── index.ts         # Route definitions
│   ├── App.vue
│   └── main.ts
├── public/
├── .env                     # Environment variables
├── vite.config.ts
└── PORTAL.md (this file)
```

## Key Concepts

### 1. Micro-Frontend Loading

**File**: `components/MicroFrontendLoader.vue`

**How it works**:
1. Receives a `MicroService` config (from `microservices.config.ts`)
2. Checks if user is authenticated (if `requiresAuth: true`)
3. Loads the WC script dynamically (`<script type="module">`)
4. Waits for custom element registration
5. Creates the Web Component DOM element
6. Passes properties: `token`, `user`, `lang`
7. Mounts in the container

**States**:
- `Not Authenticated` - Shows login prompt
- `Loading` - Spinner while loading script
- `Error` - Error message with retry button
- `Loaded` - Web Component mounted

**Auto-reload on login/logout**: Watches `authStore.isAuthenticated`

### 2. Microservices Registry

**File**: `config/microservices.config.ts`

**Interface**:
```typescript
interface MicroService {
  id: string;              // Unique identifier
  name: string;            // Display name
  title: string;           // Short title for nav
  icon: string;            // MDI icon (mdi-*)
  path: string;            // Route path
  componentTag: string;    // Custom element tag
  scriptUrl: string;       // Script URL (dev/prod)
  devPort?: number;        // Vite dev server port
  requiresAuth?: boolean;  // Requires auth (default: true)
  requiredRoles?: string[]; // RBAC roles
  description?: string;    // For dashboard
  showInNav?: boolean;     // Show in sidebar (default: true)
  showInDashboard?: boolean; // Show in dashboard (default: true)
}
```

**Functions**:
- `getVisibleMicroServices(isAuthenticated, forNav, forDashboard)` - **Centralized filtering** (clean!)
- `getMicroServiceById(id)` - Get by ID
- `getMicroServiceByPath(path)` - Get by route path
- `canAccessMicroService(ms, userRoles)` - RBAC check

**Adding a new Web Component**:
```typescript
{
  id: 'product-management',
  name: 'Product Management',
  title: 'Products',
  icon: 'mdi-package-variant',
  path: '/products',
  componentTag: 'product-management-app',
  scriptUrl: import.meta.env.DEV
    ? 'http://localhost:3002/src/main.ts'
    : '/microservices/product-management/product-management.js',
  devPort: 3002,
  requiresAuth: true,
  description: 'Manage products and inventory',
  showInNav: true,
  showInDashboard: true,
}
```

Then add route in `router/index.ts`:
```typescript
{
  path: '/products',
  name: 'products',
  component: MicroFrontendLoader,
  props: () => ({ microservice: getMicroServiceByPath('/products') }),
}
```

### 3. Authentication Flow

**Provider-agnostic**: Works with Keycloak, Auth0, Okta, any OIDC provider

**Configuration**: `.env`
```env
VITE_OIDC_AUTHORITY=http://localhost:8080/realms/aetherweave
VITE_OIDC_CLIENT_ID=aetherweave-portal
VITE_OIDC_REDIRECT_URI=http://localhost:5173/callback
VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
VITE_OIDC_SILENT_REDIRECT_URI=http://localhost:5173/silent-renew
VITE_OIDC_RESPONSE_TYPE=code
VITE_OIDC_SCOPE=openid profile email
```

**Flow**:
1. User clicks "Login" → `authStore.login()`
2. Redirect to IDP (Keycloak)
3. User authenticates
4. Redirect to `/callback` → `authService.handleCallback()`
5. Store user + token in `authStore`
6. Navigate to dashboard
7. Web Components receive `token` property

**Token passing to WC**:
```typescript
element.token = authStore.accessToken || '';
element.user = authStore.profile || null;
```

**Auto-refresh**: Silent renew configured (`automaticSilentRenew: true`)

### 4. EventBus (Portal ↔ Web Components)

**File**: `services/event-bus.service.ts`

**Purpose**: Decoupled communication between Portal and Web Components

**Library**: `eventemitter3` with wildcard support

**Events**:

| Event | Direction | Payload | Usage |
|-------|-----------|---------|-------|
| `portal:locale-change` | Portal → WC | `{ locale: string }` | Language change |
| `wc:error` | WC → Portal | `{ message, code?, source? }` | Error notification |
| `wc:notification` | WC → Portal | `{ message, type }` | Success/info/warning |
| `wc:log` | WC → Portal | `{ level, message, source, meta }` | Log messages |

**Usage in Portal**:
```typescript
// Publish
eventBus.publishLocale({ locale: 'fr' });

// Subscribe
eventBus.onError((payload) => { ... });
```

**Usage in Web Component**:
```typescript
// Import shared event-listener service
import { eventListener } from './services/event-listener.service';

// Subscribe to locale changes
eventListener.onLocaleChange((payload) => {
  console.log('Locale changed:', payload.locale);
});

// Emit events
eventListener.emitError('Something went wrong', 'E001', 'MyComponent');
eventListener.emitNotification('User created', 'success');
eventListener.emitLog('Debug info', 'debug', 'MyComponent', { foo: 'bar' });
```

### 5. Logging System

**Architecture**: Centralized logging with IndexedDB persistence

**Components**:
- `log.service.ts` - Main API for logging
- `log-storage.service.ts` - IndexedDB storage (Dexie)
- `log.store.ts` - Pinia store for UI state (drawer, filters)
- `LogsAdminView.vue` - Full admin page with stats, filters, export
- `LogDrawer.vue` - **REMOVED** (was in header, now only admin page)

**Usage**:
```typescript
import { logService } from '@/services/log.service';

// Log levels
logService.error('API call failed', 'UserService', { error });
logService.info('User logged in', 'Auth', { userId: '123' });
logService.debug('Token refreshed', 'Auth', { exp: 123456 });
```

**Features**:
- IndexedDB persistence (Dexie)
- Filtering (level, source, date range, search)
- Export (JSON, TXT)
- Statistics (total, errors, sources, level distribution)
- Storage size tracking
- Clear all logs
- Auto-serialization (handles Error objects, circular refs)

**Web Components**: Emit logs via EventBus, routed to `logService`

**Admin page**: `/admin/logs`

### 6. Settings System

**Architecture**: IndexedDB storage for user preferences

**File**: `services/settings.service.ts`

**API**:
```typescript
// Get setting
const locale = await settingsService.get(SettingKeys.LOCALE, 'en');

// Set setting
await settingsService.set(SettingKeys.LOCALE, 'fr');

// Delete setting
await settingsService.delete(SettingKeys.LOCALE);

// Get all
const all = await settingsService.getAll();

// Clear all
await settingsService.clearAll();

// Export/Import
const exported = await settingsService.export();
await settingsService.import(data);
```

**Common keys** (SettingKeys):
- `LOCALE` - User language preference
- `THEME` - Theme preference (future)
- `SIDEBAR_COLLAPSED` - Sidebar state (future)
- `NOTIFICATIONS_ENABLED` - Notifications (future)

**Storage**: IndexedDB database `AetherWeaveSettings`

**Dual storage**: Settings saved in both localStorage (fast sync) and IndexedDB (persistent, structured)

### 7. Data Reset System

**File**: `services/data-reset.service.ts`

**Purpose**: Clear all local data (IndexedDB, localStorage, sessionStorage, cookies)

**API**:
```typescript
// Clear all
await dataResetService.clearAll();

// Clear specific
await dataResetService.clearIndexedDB();
dataResetService.clearLocalStorage();
dataResetService.clearSessionStorage();
dataResetService.clearCookies();

// Get stats
const stats = await dataResetService.getStorageStats();
// Returns: indexedDB, localStorage, sessionStorage, cookies counts + sizes
```

**Usage**: Admin Settings page → "Data Management" → "Reset All Data"

**Behavior**: Clears everything and reloads page

### 8. i18n (Internationalization)

**Library**: vue-i18n

**Format**: JSON (universal, framework-agnostic)

**Supported languages**: EN, FR

**Structure**:
```json
{
  "common": { "login": "Login", ... },
  "nav": { "dashboard": "Dashboard", ... },
  "dashboard": { ... },
  "loader": { ... },
  "logs": { ... },
  "settings": { ... }
}
```

**Usage in templates**:
```vue
{{ $t('common.login') }}
{{ $t('dashboard.welcomeUser', { name: 'John' }) }}
```

**Usage in script**:
```typescript
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();
console.log(t('common.login'));
locale.value = 'fr'; // Change language
```

**Locale change flow**:
1. User changes language in Settings
2. Portal updates `locale.value`
3. Save to localStorage + IndexedDB
4. Publish to EventBus → `portal:locale-change`
5. Web Components receive event and update their translations

**Web Components i18n**: See `WEB_COMPONENTS.md`

## Theme System (Dark/Light Mode)

### Overview

The Portal supports **dark and light themes** via Vuetify 3's theming system. Theme changes are propagated to Web Components via the **stateful EventBus**.

### Theme Configuration

**File**: `portal/src/plugins/vuetify.ts`

```typescript
export default createVuetify({
  theme: {
    defaultTheme: localStorage.getItem('theme') || 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#FF6B35',      // AetherWeave Orange
          secondary: '#FFB74D',    // AetherWeave Yellow
          accent: '#FFA726',
          background: '#FAFAFA',
          surface: '#FFFFFF',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#FF6B35',      // Same orange
          secondary: '#FFB74D',    // Same yellow
          accent: '#FFA726',
          background: '#121212',
          surface: '#1E1E1E',
        },
      },
    },
  },
});
```

**Key Points**:
- Primary/Secondary colors stay the same in both themes (brand consistency)
- Background/Surface colors change for dark mode
- Theme preference saved in `localStorage`

### useTheme Composable

**File**: `portal/src/composables/useTheme.ts`

Provides theme management:

```typescript
import { useTheme } from '@/composables/useTheme';

const { isDark, toggleTheme, setTheme, getCurrentTheme } = useTheme();

// Toggle between light/dark
toggleTheme();

// Set specific theme
setTheme('dark');

// Get current theme
const theme = getCurrentTheme(); // 'light' | 'dark'
```

**Features**:
- ✅ Toggles theme via Vuetify API
- ✅ Persists preference in localStorage
- ✅ Emits `theme:changed` event to Web Components (stateful)
- ✅ Returns reactive `isDark` ref for UI updates

### Theme Toggle Button

**Location**: `portal/src/layouts/DefaultLayout.vue` (header)

```vue
<v-btn icon @click="toggleTheme" class="mr-2">
  <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
</v-btn>
```

Sun icon = currently dark (click for light)
Moon icon = currently light (click for dark)

### Web Component Integration

Theme changes are automatically sent to Web Components via EventBus:

```typescript
// In useTheme.ts
eventBus.emitStateful('theme:changed', {
  theme: newTheme,
  isDark: isDark.value
});
```

**Web Components** listen via `event-listener.service.ts`:

```typescript
this.unsubscribeTheme = eventListener.onThemeChange((payload) => {
  this.classList.toggle('dark-theme', payload.isDark);
});
```

See [WEB_COMPONENTS.md](../docs/WEB_COMPONENTS.md) for WC theme implementation.

### Material Symbols Font

**File**: `portal/index.html`

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
```

**Required** for Material Web Components icons (`<md-icon>`) used in WC.

### Styling Web Component Container

**File**: `portal/src/components/MicroFrontendLoader.vue`

```css
.micro-frontend-container {
  padding-top: 16px; /* Space between header and WC content */
}
```

Provides visual separation between Portal header and WC content.

## Navigation & Routing

### Route Structure

```
/ - Dashboard (public)
/users - User Management WC (requires auth)
/admin/settings - Admin Settings (public)
/admin/logs - Logs Admin (public)
/callback - OAuth2 callback (no layout)
/silent-renew - Silent token renewal (no layout)
```

### Route Guards

**No explicit guards** - Protection via:
1. `MicroFrontendLoader` checks `authStore.isAuthenticated`
2. `getVisibleMicroServices()` filters menu items
3. Web Components check `token` property

**Future**: Add route-level guards if needed

## Stores (Pinia)

### auth.store.ts

**State**:
```typescript
{
  user: User | null,
  isLoading: boolean,
  error: string | null
}
```

**Getters**:
- `isAuthenticated` - Boolean
- `accessToken` - JWT token string
- `profile` - User profile object
- `username` - Preferred username

**Actions**:
- `login()` - Initiate OAuth2 login
- `logout()` - Logout and redirect
- `handleCallback()` - Handle OAuth2 callback
- `loadUser()` - Load user from storage

### log.store.ts

**State**:
```typescript
{
  drawerOpen: boolean,
  logCount: number,
  filters: LogFilters
}
```

**Actions**:
- `initializeListeners()` - Setup EventBus listeners
- `toggleDrawer()` - **DEPRECATED** (drawer removed)
- `updateLogCount()` - Update badge count

## Common Tasks

### Adding a New Page

1. Create view in `src/views/MyView.vue`
2. Add route in `router/index.ts`:
```typescript
{
  path: '/my-page',
  name: 'my-page',
  component: MyView,
}
```
3. Add nav item in `AppSidebar.vue` if needed
4. Add translations in `i18n/locales/*.json`

### Adding a Translation

1. Edit `src/i18n/locales/en.json`:
```json
{
  "mySection": {
    "myKey": "My Value"
  }
}
```
2. Edit `src/i18n/locales/fr.json`:
```json
{
  "mySection": {
    "myKey": "Ma Valeur"
  }
}
```
3. Use in component: `{{ $t('mySection.myKey') }}`

### Debugging

**Vue DevTools**: Install browser extension

**Logs**: Check browser console + `/admin/logs` page

**IndexedDB**: Browser DevTools → Application → IndexedDB
- `AetherWeaveLogs` - Log entries
- `AetherWeaveSettings` - User settings

**Network**: Browser DevTools → Network
- Check WC script loading
- Check API calls from WCs

**Auth issues**:
- Check `.env` configuration
- Check Keycloak client config
- Inspect JWT token: `authStore.accessToken`
- Check Keycloak logs: `docker-compose logs keycloak`

## Best Practices

### ✅ Do

- Use centralized services (`logService`, `eventBus`, `settingsService`)
- Use Pinia stores for shared state
- Use TypeScript interfaces for type safety
- Use computed properties for reactive filtering
- Follow Vue 3 Composition API style
- Keep business logic in composables/services, not components
- Use `logService` instead of `console.log`
- Emit logs from Web Components via EventBus

### ❌ Don't

- Don't add auth logic in multiple places (it's centralized in `authService` + `authStore`)
- Don't hardcode URLs (use environment variables)
- Don't scatter `v-if` conditions (use centralized filtering like `getVisibleMicroServices`)
- Don't add business logic in components (use services/composables)
- Don't use `console.log` directly (use `logService`)
- Don't create new global state (use existing stores or create new Pinia store)

## Environment Variables

**File**: `.env`

```env
# OAuth2/OIDC Configuration
VITE_OIDC_AUTHORITY=http://localhost:8080/realms/aetherweave
VITE_OIDC_CLIENT_ID=aetherweave-portal
VITE_OIDC_REDIRECT_URI=http://localhost:5173/callback
VITE_OIDC_POST_LOGOUT_REDIRECT_URI=http://localhost:5173
VITE_OIDC_SILENT_REDIRECT_URI=http://localhost:5173/silent-renew
VITE_OIDC_RESPONSE_TYPE=code
VITE_OIDC_SCOPE=openid profile email
```

**Access in code**:
```typescript
import.meta.env.VITE_OIDC_AUTHORITY
```

## Deployment

**Build**:
```bash
pnpm run build
```

**Output**: `dist/` directory

**Serve**:
```bash
pnpm run preview
```

**Docker**: See `docker-compose.yml` (production mode via APISIX on port 8000)

## Related Documentation

- [COMPOSED_PAGES.md](../docs/COMPOSED_PAGES.md) - **Architecture for composable micro-frontend pages** (multiple WC on one page)
- [WEB_COMPONENTS.md](../docs/WEB_COMPONENTS.md) - Guide for creating Web Components
- [CLAUDE.md](../CLAUDE.md) - Main project documentation
- [architecture/dream.md](../architecture/dream.md) - Vision and architecture
