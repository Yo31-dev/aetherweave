/**
 * Event Listener Service for Web Components
 *
 * Connects to the shared EventBus instance exposed by the portal.
 * Provides type-safe event communication for logout, locale, notifications.
 *
 * NOTE: Auth token/user are passed via Web Component properties, NOT via EventBus
 */

import EventEmitter from 'eventemitter3';

export interface LocalePayload {
  locale: string;
}

export const EventType = {
  // Portal → Web Components
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

class EventListenerService {
  private emitter: EventEmitter;
  private locale: string = 'en';

  constructor() {
    try {
      this.emitter = getSharedEventBus();
      console.log('[WC EventListener] Connected to portal EventBus');
    } catch (error) {
      console.error('[WC EventListener] Failed to connect:', error);
      throw error;
    }
  }

  // ============================================================================
  // LISTENERS (Portal → Web Component)
  // ============================================================================

  /**
   * Listen for logout from portal
   */
  onLogout(callback: () => void): () => void {
    const handler = () => {
      console.log('[WC EventListener] Logged out');
      callback();
    };
    this.emitter.on(EventType.AUTH_LOGOUT, handler);
    return () => this.emitter.off(EventType.AUTH_LOGOUT, handler);
  }

  /**
   * Listen for locale changes from portal
   */
  onLocaleChange(callback: (payload: LocalePayload) => void): () => void {
    const handler = (payload: LocalePayload) => {
      this.locale = payload.locale;
      console.log('[WC EventListener] Locale changed:', this.locale);
      callback(payload);
    };

    this.emitter.on(EventType.LOCALE_CHANGE, handler);
    return () => this.emitter.off(EventType.LOCALE_CHANGE, handler);
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  /**
   * Get current locale
   */
  getLocale(): string {
    return this.locale;
  }

  // ============================================================================
  // EMITTERS (Web Component → Portal)
  // ============================================================================

  /**
   * Request navigation to a route
   */
  navigate(path: string, replace = false): void {
    this.emitter.emit(EventType.NAVIGATE, { path, replace });
    console.log(`[WC EventListener] Navigation requested: ${path}`);
  }

  /**
   * Emit error to portal (will show error snackbar)
   */
  emitError(message: string, code?: string, source = 'user-management'): void {
    this.emitter.emit(EventType.ERROR, { message, code, source });
    console.error(`[WC EventListener] Error emitted:`, message);
  }

  /**
   * Emit notification to portal (will show snackbar)
   */
  emitNotification(
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info'
  ): void {
    this.emitter.emit(EventType.NOTIFICATION, { message, type });
    console.log(`[WC EventListener] Notification (${type}): ${message}`);
  }
}

// Export singleton instance
export const eventListener = new EventListenerService();
