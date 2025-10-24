# User Service Frontend - Web Component

Lit-based Web Component for user management (CRUD operations).

## Overview

This is a micro-frontend Web Component that integrates with the AetherWeave Portal:
- Built with Lit (lightweight web components)
- Uses Material Web Components for UI
- Communicates with portal via Custom Events (EventBus)
- Receives JWT token from portal for authenticated API calls
- Standalone and reusable

## Technology Stack

- **Framework**: Lit 3
- **UI Components**: Material Web Components (@material/web)
- **Build Tool**: Vite
- **Language**: TypeScript

## Development

### Prerequisites

- Node.js 20+
- pnpm

### Install Dependencies

```bash
pnpm install
```

### Development Server

```bash
pnpm dev
```

Access at http://localhost:3001

### Build

```bash
pnpm build
```

Output: `dist/user-management.js` (single bundle)

## Architecture

### Communication with Portal

The Web Component listens to events from the portal:

**Auth Events** (from portal):
```javascript
window.addEventListener('portal:auth:update', (event) => {
  const { token, user } = event.detail;
  // Use token for API calls
});

window.addEventListener('portal:auth:logout', () => {
  // Clear state
});
```

**Locale Events** (from portal):
```javascript
window.addEventListener('portal:locale:change', (event) => {
  const { locale } = event.detail; // 'en' or 'fr'
  // Update component language
});
```

**Navigation/Notification Events** (to portal):
```javascript
window.dispatchEvent(new CustomEvent('wc:navigate', {
  detail: { path: '/users', replace: false }
}));

window.dispatchEvent(new CustomEvent('wc:notification', {
  detail: { message: 'User created', type: 'success' }
}));
```

### API Service

The `userApi` service makes authenticated API calls to the backend:

```typescript
import { userApi } from './services/user-api.service';

// Get all users
const users = await userApi.getUsers();

// Create user
const newUser = await userApi.createUser({
  username: 'john',
  email: 'john@example.com',
  password: 'secret'
});

// Update user
await userApi.updateUser(userId, { email: 'newemail@example.com' });

// Delete user
await userApi.deleteUser(userId);
```

API calls automatically include the JWT token received from the portal.

## Project Structure

```
frontend/
├── src/
│   ├── services/
│   │   ├── event-listener.service.ts  # Listen to portal events
│   │   └── user-api.service.ts        # API calls to backend
│   ├── user-management-app.ts         # Root Web Component
│   └── main.ts                        # Entry point
├── public/
│   └── design-tokens.css              # Shared design tokens
├── vite.config.ts                     # Vite configuration
├── tsconfig.json                      # TypeScript configuration
└── package.json
```

## Usage in Portal

The portal loads this Web Component dynamically:

```typescript
// Portal configuration
{
  id: 'user-management',
  componentTag: 'user-management-app',
  scriptUrl: '/microservices/user-management/user-management.js',
  devPort: 3001
}
```

```html
<!-- Portal renders -->
<user-management-app></user-management-app>
```

The component automatically receives auth state and locale from the portal.

## Features

### Current (MVP)

- ✅ User list (table view)
- ✅ Delete user with confirmation
- ✅ Loading states
- ✅ Error handling
- ✅ Authentication integration
- ✅ API integration

### Planned

- 🔲 Create user form
- 🔲 Edit user form
- 🔲 Search/filter users
- 🔲 Pagination
- 🔲 i18n (EN/FR)
- 🔲 Role management
- 🔲 Bulk operations

## Material Web Components Used

- `<md-filled-button>` - Primary actions
- `<md-text-button>` - Secondary actions
- `<md-icon>` - Icons
- `<md-circular-progress>` - Loading indicator

For more components: https://material-web.dev/

## Styling

The component uses CSS custom properties (design tokens) for theming:
- `--md-sys-color-primary`
- `--md-sys-color-background`
- `--md-sys-color-error`
- etc.

These tokens are defined in `design-tokens.css` and shared with the portal for visual consistency.

## Development Notes

- Hot reload works in dev mode (`pnpm dev`)
- Shadow DOM provides style isolation
- Material Web Components match Vuetify's Material Design theme
- JWT token is stored in memory (not localStorage)
- API calls go through APISIX Gateway (port 8000)

## Troubleshooting

### Web Component not loading

1. Check portal console for script loading errors
2. Verify dev server is running on port 3001
3. Check CORS configuration

### API calls failing

1. Verify JWT token is being passed correctly
2. Check APISIX routes configuration
3. Verify backend service is running
4. Check browser network tab for errors

### Material Web Components not rendering

Ensure Material Web imports are correct:
```typescript
import '@material/web/button/filled-button.js';
```

## License

MIT
