/**
 * Shared types for AetherWeave Portal and Web Components communication
 * Framework-agnostic - can be used by React, Vue, Lit, Angular, etc.
 */

/**
 * Authentication payload
 * Contains JWT token and user profile information
 */
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

/**
 * Navigation request payload
 * Used by Web Components to request navigation in the Portal
 */
export interface NavigationPayload {
  path: string;
  replace?: boolean;
}

/**
 * Error notification payload
 * Used by Web Components to report errors to the Portal
 */
export interface ErrorPayload {
  message: string;
  code?: string;
  source?: string;
}

/**
 * Locale change payload
 * Portal notifies Web Components of language changes
 */
export interface LocalePayload {
  locale: string;
}

/**
 * Generic notification payload
 * Used for toast/snackbar notifications
 */
export interface NotificationPayload {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

/**
 * Log message payload
 * Web Components can send logs to Portal for centralized logging
 */
export interface LogPayload {
  message: string;
  level: 'error' | 'debug' | 'info';
  source: string;
  meta?: any;
}

/**
 * Page title payload
 * Web Components set the page title and optional subtitle
 */
export interface PageTitlePayload {
  title: string;
  subtitle?: string;
}

/**
 * Navigation sub-item (dropdown menu item)
 */
export interface NavigationSubItem {
  label: string;
  path: string;
}

/**
 * Navigation item
 * Can be a direct link (path only) or a dropdown menu (children)
 */
export interface NavigationItem {
  label: string;
  path?: string;          // Optional: only for direct links (no dropdown)
  icon?: string;          // Deprecated: will be removed
  active?: boolean;
  children?: NavigationSubItem[];  // For dropdown menus
}

/**
 * Page navigation registration payload
 * Web Components register their navigation menu items
 */
export interface PageNavigationPayload {
  items: NavigationItem[];
  baseRoute: string;
}

/**
 * Event types - strongly typed event names
 * Const object to ensure consistency across Portal and Web Components
 */
export const EventType = {
  // Portal → Web Components
  AUTH_LOGOUT: 'portal:auth:logout',
  AUTH_TOKEN_REFRESHED: 'portal:auth:token-refreshed',
  LOCALE_CHANGE: 'portal:locale:change',
  PORTAL_READY: 'portal:ready',

  // Web Components → Portal
  NAVIGATE: 'wc:navigate',
  ERROR: 'wc:error',
  NOTIFICATION: 'wc:notification',
  LOG: 'wc:log',
  PAGE_TITLE_SET: 'wc:page:setTitle',
  PAGE_NAVIGATION_REGISTER: 'wc:page:registerNavigation',
  PAGE_NAVIGATION_CLEAR: 'wc:page:clearNavigation',
} as const;

/**
 * Type-safe event type keys
 */
export type EventTypeKeys = typeof EventType[keyof typeof EventType];
