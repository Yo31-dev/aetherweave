# Internationalization (i18n) Implementation

This Web Component supports internationalization using **lit-translate** with JSON-based translation files.

## Supported Languages

- **English (en)** - Default language
- **French (fr)**

## Architecture

### Files Structure

```
frontend/
├── src/
│   ├── i18n/
│   │   ├── index.ts       # lit-translate configuration
│   │   └── locales/
│   │       ├── en.ts      # English translations (bundled)
│   │       └── fr.ts      # French translations (bundled)
│   └── user-management-app.ts
└── dist/
    ├── en-[hash].js       # English translation chunk (lazy-loaded)
    ├── fr-[hash].js       # French translation chunk (lazy-loaded)
    └── user-management.js # Main bundle
```

### Dependencies

- **lit-translate** (2.0.1) - ~0.8 KB gzipped

### Bundle Size Impact

- **Before i18n**: 21.56 KB gzipped
- **After i18n**: 24.91 KB gzipped (main bundle)
- **Increase**: +3.35 KB (+15.5%)
- **Translation chunks** (lazy-loaded):
  - en-[hash].js: ~0.37 KB gzipped
  - fr-[hash].js: ~0.44 KB gzipped

## Usage

### From Portal (Automatic)

The portal automatically passes the current locale to the Web Component:

```typescript
// Portal creates WC with lang property
const element = document.createElement('user-management-app');
element.lang = 'fr';  // Current portal locale
```

The portal also listens to locale changes and updates the WC:

```typescript
// When portal locale changes
watch(locale, (newLocale) => {
  webComponentInstance.lang = newLocale;
});
```

### Standalone Usage

```html
<!-- Default (English) -->
<user-management-app token="..." user="..."></user-management-app>

<!-- French -->
<user-management-app token="..." user="..." lang="fr"></user-management-app>
```

### Programmatic Locale Change

The component also listens to EventBus locale change events:

```typescript
// Portal publishes locale change
eventBus.publishLocale({ locale: 'fr' });

// WC receives and applies the change automatically
```

## How It Works

### 1. Initial Load

When the component is mounted:
1. The `lang` property is set (default: 'en')
2. lit-translate loads the corresponding JSON file (`/locales/en.json`)
3. Component renders with translated text

### 2. Locale Change

When the locale changes (via property or EventBus):
1. `updated()` lifecycle method detects the change
2. `use(newLang)` is called to load the new locale
3. lit-translate automatically triggers a re-render
4. All `translate()` calls update with new translations

### 3. Translation in Templates

```typescript
import { translate } from './i18n';

render() {
  return html`
    <h1>${translate('title')}</h1>
    <button>${translate('actions.add')}</button>
  `;
}
```

## Adding New Languages

### 1. Create Translation File

Create `src/i18n/locales/{lang}.ts`:

```typescript
export default {
  title: '...',
  actions: {
    add: '...',
    edit: '...',
    delete: '...',
    retry: '...',
  },
  table: {
    id: '...',
    username: '...',
    email: '...',
    created: '...',
    actions: '...',
  },
  messages: {
    notAuthenticated: '...',
    pleaseLogin: '...',
    loading: '...',
    error: '...',
    noUsers: '...',
    noUsersDescription: '...',
    deleteConfirm: '...',
  },
};
```

### 2. Update Loader

Add the new language to `src/i18n/index.ts`:

```typescript
loader: async (lang: string) => {
  switch (lang) {
    case 'en':
      return (await import('./locales/en')).default;
    case 'fr':
      return (await import('./locales/fr')).default;
    case 'es':  // Add new language here
      return (await import('./locales/es')).default;
    default:
      return (await import('./locales/en')).default;
  }
}
```

### 3. Update Documentation

Update this file and `user-management-app.ts` documentation with the new supported language.

### 4. Rebuild

```bash
pnpm run build
```

A new translation chunk `{lang}-[hash].js` will be generated in `dist/`.

## Translation Keys Reference

All available translation keys are documented in the TypeScript files (`src/i18n/locales/*.ts`):

- `title` - Main page title
- `actions.*` - Button labels
- `table.*` - Table column headers
- `messages.*` - User-facing messages (errors, empty states, etc.)

## Error Handling

If a translation file fails to load:
- An error is logged to the portal's log system
- The component continues to work with the previous locale
- A console error is displayed for debugging

## Development

### Testing Translations

1. Build the component:
   ```bash
   pnpm run build
   ```

2. Changes to translation files in `src/i18n/locales/*.ts` require a rebuild

3. Use the portal in dev mode to test language switching

### Production Build

```bash
pnpm run build
```

Translation chunks are generated from `src/i18n/locales/*.ts` and bundled into separate JS files in `dist/`.

## Notes

- **Bundled Translations**: Translations are bundled into the JavaScript (no external HTTP requests)
- **Code Splitting**: Each language is a separate chunk, loaded on-demand
- **Caching**: lit-translate caches loaded translations for performance
- **Re-rendering**: The component automatically re-renders when translations change
- **Type Safety**: Translation keys are strings (no TypeScript validation yet)

## Future Improvements

- Add TypeScript type safety for translation keys
- Support for pluralization
- Support for date/number formatting per locale
- Translation management UI
