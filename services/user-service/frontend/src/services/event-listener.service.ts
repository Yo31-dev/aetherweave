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
  LOG: 'wc:log',
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
  private source: string = 'user-management';

  constructor() {
    try {
      this.emitter = getSharedEventBus();
      this.emitLog('Connected to portal EventBus', 'debug');
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
      this.emitLog('Logged out', 'info');
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
      this.emitLog(`Locale changed: ${this.locale}`, 'debug');
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
    this.emitLog(`Navigation requested: ${path}`, 'debug');
  }

  /**
   * Emit error to portal (will show error snackbar)
   */
  emitError(message: string, code?: string, source = 'user-management'): void {
    this.emitter.emit(EventType.ERROR, { message, code, source });
    this.emitLog(`Error emitted: ${message}`, 'error', { code });
  }

  /**
   * Emit notification to portal (will show snackbar)
   */
  emitNotification(
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info'
  ): void {
    this.emitter.emit(EventType.NOTIFICATION, { message, type });
    this.emitLog(`Notification (${type}): ${message}`, 'debug');
  }

  /**
   * Emit log message to portal (will appear in log panel)
   */
  emitLog(message: string, level: 'error' | 'debug' | 'info', meta?: any): void {
    this.emitter.emit(EventType.LOG, { message, level, source: this.source, meta });
  }
}

// Export singleton instance
export const eventListener = new EventListenerService();
