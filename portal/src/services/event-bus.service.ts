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
import { logService } from './log.service';

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

export interface LogPayload {
  message: string;
  level: 'error' | 'debug' | 'info';
  source: string;
  meta?: any;
}

export interface PageTitlePayload {
  title: string;
  subtitle?: string;
}

export interface NavigationSubItem {
  label: string;
  path: string;
}

export interface NavigationItem {
  label: string;
  path?: string;          // Optional: only for direct links (no dropdown)
  icon?: string;          // Deprecated: will be removed
  active?: boolean;
  children?: NavigationSubItem[];  // For dropdown menus
}

export interface PageNavigationPayload {
  items: NavigationItem[];
  baseRoute: string;
}

/**
 * Event types - strongly typed for TypeScript
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

type EventTypeKeys = typeof EventType[keyof typeof EventType];

/**
 * Strongly typed EventEmitter events map
 */
interface EventMap {
  [EventType.AUTH_LOGOUT]: () => void;
  [EventType.AUTH_TOKEN_REFRESHED]: (payload: AuthPayload) => void;
  [EventType.LOCALE_CHANGE]: (payload: LocalePayload) => void;
  [EventType.NAVIGATE]: (payload: NavigationPayload) => void;
  [EventType.ERROR]: (payload: ErrorPayload) => void;
  [EventType.NOTIFICATION]: (payload: NotificationPayload) => void;
  [EventType.LOG]: (payload: LogPayload) => void;
  [EventType.PAGE_TITLE_SET]: (payload: PageTitlePayload) => void;
  [EventType.PAGE_NAVIGATION_REGISTER]: (payload: PageNavigationPayload) => void;
  [EventType.PAGE_NAVIGATION_CLEAR]: () => void;
}

class MicroFrontendEventBus {
  private emitter: EventEmitter<EventMap>;
  private lastState: Map<string, { data: any; timestamp: number }>;

  constructor() {
    this.emitter = new EventEmitter<EventMap>();
    this.lastState = new Map();

    // Expose emitter on window for Web Components to access
    (window as any).__AETHERWEAVE_EVENT_BUS__ = this.emitter;

    // Expose stateful methods on window for Web Components
    (window as any).__AETHERWEAVE_STATEFUL_BUS__ = {
      emitStateful: this.emitStateful.bind(this),
      onStateful: this.onStateful.bind(this),
      clearState: this.clearState.bind(this),
      getState: this.getState.bind(this),
      hasState: this.hasState.bind(this),
    };

    logService.debugVerbose('EventBus initialized (with stateful support)', 'EventBus');
  }

  // ============================================================================
  // PORTAL → WEB COMPONENTS (Publishers)
  // ============================================================================

  /**
   * Publish logout event to all Web Components
   * Web Components should clear their local state
   * Also clears all stateful event state
   */
  publishLogout(): void {
    this.emitter.emit(EventType.AUTH_LOGOUT);
    // Clear all stateful event state on logout
    this.clearState();
    logService.debugVerbose('Published logout event and cleared stateful state', 'EventBus');
  }

  /**
   * Publish token refresh event to all Web Components
   * Web Components should update their auth token
   */
  publishTokenRefresh(payload: AuthPayload): void {
    this.emitter.emit(EventType.AUTH_TOKEN_REFRESHED, payload);
    logService.debugVerbose('Published token refresh event', 'EventBus');
  }

  /**
   * Publish locale change to all Web Components
   */
  publishLocale(payload: LocalePayload): void {
    this.emitter.emit(EventType.LOCALE_CHANGE, payload);
    logService.debugVerbose(`Published locale change: ${payload.locale}`, 'EventBus');
  }

  /**
   * Publish portal ready event to all Web Components
   * Web Components should re-emit their metadata when receiving this event
   */
  publishPortalReady(): void {
    this.emitter.emit(EventType.PORTAL_READY);
    logService.debugVerbose('Published portal:ready event', 'EventBus');
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

  /**
   * Listen for log messages from Web Components (Portal)
   */
  onLog(callback: (payload: LogPayload) => void): () => void {
    this.emitter.on(EventType.LOG, callback);
    return () => this.emitter.off(EventType.LOG, callback);
  }

  /**
   * Listen for page title changes from Web Components (Portal)
   * Uses stateful listener to receive replayed events (handles timing race)
   */
  onPageTitleChange(callback: (payload: PageTitlePayload) => void): () => void {
    return this.onStateful(EventType.PAGE_TITLE_SET, callback);
  }

  /**
   * Listen for navigation registration from Web Components (Portal)
   * Uses stateful listener to receive replayed events (handles timing race)
   */
  onNavigationRegister(callback: (payload: PageNavigationPayload) => void): () => void {
    return this.onStateful(EventType.PAGE_NAVIGATION_REGISTER, callback);
  }

  /**
   * Listen for navigation clear from Web Components (Portal)
   */
  onNavigationClear(callback: () => void): () => void {
    this.emitter.on(EventType.PAGE_NAVIGATION_CLEAR, callback);
    return () => this.emitter.off(EventType.PAGE_NAVIGATION_CLEAR, callback);
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
   * Listen for token refresh (Web Components)
   */
  onTokenRefresh(callback: (payload: AuthPayload) => void): () => void {
    this.emitter.on(EventType.AUTH_TOKEN_REFRESHED, callback);
    return () => this.emitter.off(EventType.AUTH_TOKEN_REFRESHED, callback);
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
    logService.debugVerbose(`Navigation requested: ${payload.path}`, 'EventBus');
  }

  /**
   * Emit error from Web Component to Portal
   */
  emitError(payload: ErrorPayload): void {
    this.emitter.emit(EventType.ERROR, payload);
    logService.error(`Error from ${payload.source}: ${payload.message}`, 'EventBus', payload);
  }

  /**
   * Emit notification from Web Component to Portal
   */
  emitNotification(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info'): void {
    this.emitter.emit(EventType.NOTIFICATION, { message, type });
    logService.debugVerbose(`Notification (${type}): ${message}`, 'EventBus');
  }

  /**
   * Emit log message from Web Component to Portal
   */
  emitLog(message: string, level: 'error' | 'debug' | 'info', source: string, meta?: any): void {
    this.emitter.emit(EventType.LOG, { message, level, source, meta });
  }

  /**
   * Set page title from Web Component or composed page
   * Uses stateful emit to handle timing race conditions (WC loads before Portal listens)
   */
  setPageTitle(payload: PageTitlePayload): void {
    this.emitStateful(EventType.PAGE_TITLE_SET, payload);
    logService.debugVerbose(`Page title set: ${payload.title}`, 'EventBus');
  }

  /**
   * Register navigation items from Web Component
   * Uses stateful emit to handle timing race conditions (WC loads before Portal listens)
   */
  registerNavigation(payload: PageNavigationPayload): void {
    this.emitStateful(EventType.PAGE_NAVIGATION_REGISTER, payload);
    logService.debugVerbose(`Navigation registered for ${payload.baseRoute}`, 'EventBus', payload);
  }

  /**
   * Clear navigation items
   */
  clearNavigation(): void {
    this.emitter.emit(EventType.PAGE_NAVIGATION_CLEAR);
    logService.debugVerbose('Navigation cleared', 'EventBus');
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
    logService.debugVerbose('All listeners removed', 'EventBus');
  }

  // ============================================================================
  // STATEFUL EVENTS (for cross-component communication in composed pages)
  // ============================================================================

  /**
   * Emit an event and persist its state for late joiners
   * Use this for cross-component communication where components may load in any order
   *
   * @param eventName - Event identifier (e.g., 'user:selected', 'filter:changed')
   * @param payload - Event data to persist and emit
   *
   * @example
   * eventBus.emitStateful('user:selected', { userId: 123, userName: 'John' });
   */
  emitStateful(eventName: string, payload: any): void {
    // Persist state with timestamp
    this.lastState.set(eventName, {
      data: payload,
      timestamp: Date.now(),
    });

    // Emit to current listeners
    this.emitter.emit(eventName as any, payload);

    logService.debugVerbose(
      `Stateful event emitted: ${eventName}`,
      'EventBus',
      { payload, stateCount: this.lastState.size }
    );
  }

  /**
   * Listen to an event and immediately receive current state if it exists
   * Automatically delivers persisted state to late joiners
   *
   * @param eventName - Event identifier to listen to
   * @param callback - Handler called with event payload
   * @returns Unsubscribe function to clean up the listener
   *
   * @example
   * const unsubscribe = eventBus.onStateful('user:selected', (data) => {
   *   console.log('User selected:', data.userId);
   * });
   * // Later: unsubscribe();
   */
  onStateful(eventName: string, callback: (payload: any) => void): () => void {
    // Deliver current state immediately if exists
    const currentState = this.lastState.get(eventName);
    if (currentState) {
      logService.debugVerbose(
        `Delivering persisted state for: ${eventName}`,
        'EventBus',
        { age: Date.now() - currentState.timestamp }
      );
      callback(currentState.data);
    }

    // Listen for future events
    this.emitter.on(eventName as any, callback);

    // Return unsubscribe function
    return () => {
      this.emitter.off(eventName as any, callback);
      logService.debugVerbose(`Unsubscribed from: ${eventName}`, 'EventBus');
    };
  }

  /**
   * Clear persisted state for one or all events
   * Use this when state is no longer valid (e.g., logout, page change)
   *
   * @param eventName - Optional event name to clear. If omitted, clears all state.
   *
   * @example
   * eventBus.clearState('user:selected'); // Clear specific
   * eventBus.clearState(); // Clear all
   */
  clearState(eventName?: string): void {
    if (eventName) {
      const existed = this.lastState.delete(eventName);
      if (existed) {
        logService.debugVerbose(`Cleared state: ${eventName}`, 'EventBus');
      }
    } else {
      const count = this.lastState.size;
      this.lastState.clear();
      logService.debugVerbose(`Cleared all state (${count} events)`, 'EventBus');
    }
  }

  /**
   * Get current state without subscribing to future events
   * Useful for one-time state checks
   *
   * @param eventName - Event identifier
   * @returns Current state data or undefined if no state exists
   *
   * @example
   * const currentUser = eventBus.getState('user:selected');
   * if (currentUser) {
   *   console.log('Current user:', currentUser.userId);
   * }
   */
  getState(eventName: string): any | undefined {
    return this.lastState.get(eventName)?.data;
  }

  /**
   * Get all persisted state (debugging/inspection)
   *
   * @returns Map of all event states with timestamps
   */
  getAllState(): Map<string, { data: any; timestamp: number }> {
    return new Map(this.lastState);
  }

  /**
   * Check if state exists for an event
   *
   * @param eventName - Event identifier
   * @returns True if state exists
   */
  hasState(eventName: string): boolean {
    return this.lastState.has(eventName);
  }
}

// Export singleton instance
export const eventBus = new MicroFrontendEventBus();

// Export types for external use
export type { EventTypeKeys };
