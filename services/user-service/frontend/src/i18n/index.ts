/**
 * i18n Configuration using lit-translate
 *
 * Provides internationalization support for the user-management Web Component
 * with inline translations (bundled in the JavaScript).
 */

import { registerTranslateConfig, use, translate as t } from 'lit-translate';

// Register lit-translate configuration with dynamic imports
registerTranslateConfig({
  loader: async (lang: string) => {
    switch (lang) {
      case 'en':
        return (await import('./locales/en')).default;
      case 'fr':
        return (await import('./locales/fr')).default;
      default:
        // Fallback to English
        return (await import('./locales/en')).default;
    }
  }
});

// Export translate function with shorter alias
export { t as translate };

// Export use function for switching locales
export { use };

// Export get function for non-template usage
export { get } from 'lit-translate';

/**
 * Set the default locale
 * This will be overridden by:
 * 1. The 'lang' property passed by the portal
 * 2. Locale change events from the portal
 */
use('en');
