/**
 * EventBus Service
 *
 * Communication bridge between Portal (Vue.js) and Web Components (Lit)
 * Uses EventEmitter3 for type-safe, cross-framework communication with wildcard support.
 *
 * Portal → Web Components: Logout events, locale changes, navigation
 * Web Components → Portal: Navigation requests, error notifications
 *
 * NOTE: Auth token/user are passed via Web Component properties, NOT via EventBus
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

export interface NavigationPayload {
  path: string;
  replace?: boolean;
}

export interface ErrorPayload {
  message: string;
  code?: string;
  source?: string;
}

export interface LocalePayload {
  locale: string;
}

export interface NotificationPayload {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

/**
 * Event types - strongly typed for TypeScript
 */
export const EventType = {
  // Portal → Web Components
  AUTH_LOGOUT: 'portal:auth:logout',
  LOCALE_CHANGE: 'portal:locale:change',

  // Web Components → Portal
  NAVIGATE: 'wc:navigate',
  ERROR: 'wc:error',
  NOTIFICATION: 'wc:notification',
} as const;

type EventTypeKeys = typeof EventType[keyof typeof EventType];

/**
 * Strongly typed EventEmitter events map
 */
interface EventMap {
  [EventType.AUTH_LOGOUT]: () => void;
  [EventType.LOCALE_CHANGE]: (payload: LocalePayload) => void;
  [EventType.NAVIGATE]: (payload: NavigationPayload) => void;
  [EventType.ERROR]: (payload: ErrorPayload) => void;
  [EventType.NOTIFICATION]: (payload: NotificationPayload) => void;
}

class MicroFrontendEventBus {
  private emitter: EventEmitter<EventMap>;

  constructor() {
    this.emitter = new EventEmitter<EventMap>();
    console.log('[EventBus] Initialized with EventEmitter3');

    // Expose emitter on window for Web Components to access
    (window as any).__AETHERWEAVE_EVENT_BUS__ = this.emitter;
    console.log('[EventBus] Exposed on window for Web Components');
  }

  // ============================================================================
  // PORTAL → WEB COMPONENTS (Publishers)
  // ============================================================================

  /**
   * Publish logout event to all Web Components
   * Web Components should clear their local state
   */
  publishLogout(): void {
    this.emitter.emit(EventType.AUTH_LOGOUT);
    console.log('[EventBus] Published logout');
  }

  /**
   * Publish locale change to all Web Components
   */
  publishLocale(payload: LocalePayload): void {
    this.emitter.emit(EventType.LOCALE_CHANGE, payload);
    console.log(`[EventBus] Published locale change: ${payload.locale}`);
  }

  // ============================================================================
  // PORTAL LISTENERS (for Web Component events)
  // ============================================================================

  /**
   * Listen for navigation requests from Web Components (Portal)
   */
  onNavigate(callback: (payload: NavigationPayload) => void): () => void {
    this.emitter.on(EventType.NAVIGATE, callback);
    return () => this.emitter.off(EventType.NAVIGATE, callback);
  }

  /**
   * Listen for error notifications from Web Components (Portal)
   */
  onError(callback: (payload: ErrorPayload) => void): () => void {
    this.emitter.on(EventType.ERROR, callback);
    return () => this.emitter.off(EventType.ERROR, callback);
  }

  /**
   * Listen for generic notifications from Web Components (Portal)
   */
  onNotification(callback: (payload: NotificationPayload) => void): () => void {
    this.emitter.on(EventType.NOTIFICATION, callback);
    return () => this.emitter.off(EventType.NOTIFICATION, callback);
  }

  // ============================================================================
  // WEB COMPONENT LISTENERS (for Portal events)
  // ============================================================================

  /**
   * Listen for logout (Web Components)
   */
  onLogout(callback: () => void): () => void {
    this.emitter.on(EventType.AUTH_LOGOUT, callback);
    return () => this.emitter.off(EventType.AUTH_LOGOUT, callback);
  }

  /**
   * Listen for locale changes (Web Components)
   */
  onLocaleChange(callback: (payload: LocalePayload) => void): () => void {
    this.emitter.on(EventType.LOCALE_CHANGE, callback);
    return () => this.emitter.off(EventType.LOCALE_CHANGE, callback);
  }

  // ============================================================================
  // WEB COMPONENT → PORTAL (Emitters)
  // ============================================================================

  /**
   * Request navigation from Web Component to Portal
   */
  requestNavigation(payload: NavigationPayload): void {
    this.emitter.emit(EventType.NAVIGATE, payload);
    console.log(`[EventBus] Navigation requested: ${payload.path}`);
  }

  /**
   * Emit error from Web Component to Portal
   */
  emitError(payload: ErrorPayload): void {
    this.emitter.emit(EventType.ERROR, payload);
    console.error(`[EventBus] Error emitted from ${payload.source}:`, payload.message);
  }

  /**
   * Emit notification from Web Component to Portal
   */
  emitNotification(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info'): void {
    this.emitter.emit(EventType.NOTIFICATION, { message, type });
    console.log(`[EventBus] Notification (${type}): ${message}`);
  }

  // ============================================================================
  // ADVANCED FEATURES (EventEmitter3 wildcards)
  // ============================================================================

  /**
   * Listen to all portal events (wildcard)
   * Useful for debugging or logging all events
   */
  onAllPortalEvents(callback: (eventName: EventTypeKeys, ...args: any[]) => void): () => void {
    const handler = (eventName: EventTypeKeys, ...args: any[]) => {
      if (eventName.startsWith('portal:')) {
        callback(eventName, ...args);
      }
    };
    this.emitter.on('*' as any, handler);
    return () => this.emitter.off('*' as any, handler);
  }

  /**
   * Listen to all Web Component events (wildcard)
   */
  onAllWebComponentEvents(callback: (eventName: EventTypeKeys, ...args: any[]) => void): () => void {
    const handler = (eventName: EventTypeKeys, ...args: any[]) => {
      if (eventName.startsWith('wc:')) {
        callback(eventName, ...args);
      }
    };
    this.emitter.on('*' as any, handler);
    return () => this.emitter.off('*' as any, handler);
  }

  /**
   * Get current listener count for an event (debugging)
   */
  listenerCount(eventName: EventTypeKeys): number {
    return this.emitter.listenerCount(eventName);
  }

  /**
   * Remove all listeners (cleanup)
   */
  removeAllListeners(): void {
    this.emitter.removeAllListeners();
    console.log('[EventBus] All listeners removed');
  }
}

// Export singleton instance
export const eventBus = new MicroFrontendEventBus();

// Export types for external use
export type { EventTypeKeys };
