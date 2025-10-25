/**
 * EventBus Client for Web Components
 *
 * Framework-agnostic client to connect to the Portal's EventBus.
 * Provides type-safe event communication for Portal ↔ Web Component interaction.
 *
 * Can be used with any framework: Lit, React, Vue, Angular, Svelte, etc.
 */

import EventEmitter from 'eventemitter3';
import type {
  AuthPayload,
  LocalePayload,
  ErrorPayload,
  NotificationPayload,
  LogPayload,
  PageTitlePayload,
  PageNavigationPayload,
} from '../types';
import { EventType } from '../types';

/**
 * Get the shared EventBus instance from the portal
 * @throws Error if Portal EventBus not found
 */
function getSharedEventBus(): EventEmitter {
  if (!(window as any).__AETHERWEAVE_EVENT_BUS__) {
    throw new Error(
      '[EventBus] Portal EventBus not found. Ensure portal is loaded first.'
    );
  }
  return (window as any).__AETHERWEAVE_EVENT_BUS__;
}

/**
 * Get the stateful EventBus instance from the portal
 * @throws Error if Portal Stateful EventBus not found
 */
function getStatefulEventBus(): any {
  if (!(window as any).__AETHERWEAVE_STATEFUL_BUS__) {
    throw new Error(
      '[EventBus] Portal Stateful EventBus not found. Ensure portal is loaded first.'
    );
  }
  return (window as any).__AETHERWEAVE_STATEFUL_BUS__;
}

/**
 * Configuration options for EventBusClient
 */
export interface EventBusClientConfig {
  /**
   * Source identifier for logs (e.g., 'user-management', 'product-catalog')
   */
  source: string;

  /**
   * Initial locale (default: 'en')
   */
  locale?: string;

  /**
   * Enable debug logging to console
   */
  debug?: boolean;
}

/**
 * EventBus Client
 * Framework-agnostic client for Portal ↔ Web Component communication
 *
 * @example
 * // Create client instance
 * const eventBus = new EventBusClient({ source: 'my-component' });
 *
 * // Listen for logout
 * const unsubscribe = eventBus.onLogout(() => {
 *   console.log('User logged out');
 * });
 *
 * // Emit notification
 * eventBus.emitNotification('Operation successful', 'success');
 *
 * // Clean up
 * unsubscribe();
 */
export class EventBusClient {
  private emitter: EventEmitter;
  private locale: string;
  private source: string;
  private debug: boolean;

  constructor(config: EventBusClientConfig) {
    this.source = config.source;
    this.locale = config.locale || 'en';
    this.debug = config.debug || false;

    try {
      this.emitter = getSharedEventBus();
      this.log('Connected to portal EventBus', 'debug');
    } catch (error) {
      console.error(`[${this.source}] Failed to connect to EventBus:`, error);
      throw error;
    }
  }

  // ============================================================================
  // LISTENERS (Portal → Web Component)
  // ============================================================================

  /**
   * Listen for logout events from portal
   * Web Components should clear their local state when receiving this event
   *
   * @param callback - Handler called when user logs out
   * @returns Unsubscribe function
   */
  onLogout(callback: () => void): () => void {
    const handler = () => {
      this.log('Logout event received', 'info');
      callback();
    };
    this.emitter.on(EventType.AUTH_LOGOUT, handler);
    return () => this.emitter.off(EventType.AUTH_LOGOUT, handler);
  }

  /**
   * Listen for token refresh events from portal
   * Web Components can update their stored token
   *
   * @param callback - Handler called with new auth payload
   * @returns Unsubscribe function
   */
  onTokenRefresh(callback: (payload: AuthPayload) => void): () => void {
    const handler = (payload: AuthPayload) => {
      this.log('Token refresh event received', 'info');
      callback(payload);
    };
    this.emitter.on(EventType.AUTH_TOKEN_REFRESHED, handler);
    return () => this.emitter.off(EventType.AUTH_TOKEN_REFRESHED, handler);
  }

  /**
   * Listen for locale changes from portal
   * Web Components should update their UI language
   *
   * @param callback - Handler called with new locale
   * @returns Unsubscribe function
   */
  onLocaleChange(callback: (payload: LocalePayload) => void): () => void {
    const handler = (payload: LocalePayload) => {
      this.locale = payload.locale;
      this.log(`Locale changed to: ${this.locale}`, 'debug');
      callback(payload);
    };
    this.emitter.on(EventType.LOCALE_CHANGE, handler);
    return () => this.emitter.off(EventType.LOCALE_CHANGE, handler);
  }

  /**
   * Listen for portal:ready event
   * Portal emits this when ready to receive metadata (handles timing race on refresh)
   *
   * @param callback - Handler called when portal is ready
   * @returns Unsubscribe function
   */
  onPortalReady(callback: () => void): () => void {
    const handler = () => {
      this.log('Portal ready signal received', 'debug');
      callback();
    };
    this.emitter.on(EventType.PORTAL_READY, handler);
    return () => this.emitter.off(EventType.PORTAL_READY, handler);
  }

  // ============================================================================
  // EMITTERS (Web Component → Portal)
  // ============================================================================

  /**
   * Request navigation to a route
   * Portal will handle the actual routing
   *
   * @param path - Target route path
   * @param replace - Use replace instead of push (default: false)
   */
  navigate(path: string, replace = false): void {
    this.emitter.emit(EventType.NAVIGATE, { path, replace });
    this.log(`Navigation requested: ${path}`, 'debug');
  }

  /**
   * Emit error to portal
   * Portal will display error notification (snackbar/toast)
   *
   * @param message - Error message
   * @param code - Optional error code
   * @param source - Optional source override (default: config.source)
   */
  emitError(message: string, code?: string, source?: string): void {
    const payload: ErrorPayload = {
      message,
      code,
      source: source || this.source,
    };
    this.emitter.emit(EventType.ERROR, payload);
    this.log(`Error emitted: ${message}`, 'error', { code });
  }

  /**
   * Emit notification to portal
   * Portal will display notification (snackbar/toast)
   *
   * @param message - Notification message
   * @param type - Notification type (default: 'info')
   */
  emitNotification(
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info'
  ): void {
    const payload: NotificationPayload = { message, type };
    this.emitter.emit(EventType.NOTIFICATION, payload);
    this.log(`Notification (${type}): ${message}`, 'debug');
  }

  /**
   * Emit log message to portal
   * Portal can display logs in a log panel or send to centralized logging
   *
   * @param message - Log message
   * @param level - Log level
   * @param meta - Optional metadata
   */
  emitLog(message: string, level: 'error' | 'debug' | 'info', meta?: any): void {
    const payload: LogPayload = {
      message,
      level,
      source: this.source,
      meta,
    };
    this.emitter.emit(EventType.LOG, payload);
  }

  /**
   * Set page title and optional subtitle
   * Portal will update the title bar
   *
   * IMPORTANT: If using translations, ensure they are loaded BEFORE calling this!
   * Example (Lit): await use(this.lang); then call setPageTitle()
   *
   * @param title - Page title
   * @param subtitle - Optional subtitle
   */
  setPageTitle(title: string, subtitle?: string): void {
    const payload: PageTitlePayload = { title, subtitle };
    // Use stateful emit to handle timing race (WC loads before Portal listens)
    try {
      const statefulBus = getStatefulEventBus();
      statefulBus.emitStateful(EventType.PAGE_TITLE_SET, payload);
      this.log(`Page title set: ${title}`, 'debug');
    } catch (error) {
      console.warn(`[${this.source}] Stateful EventBus not available, falling back to regular emit`);
      this.emitter.emit(EventType.PAGE_TITLE_SET, payload);
    }
  }

  /**
   * Register navigation items for this Web Component
   * Portal will display these in the header navigation menu
   *
   * IMPORTANT: If using translations, ensure they are loaded BEFORE calling this!
   * Example (Lit): await use(this.lang); then call registerNavigation()
   *
   * @param items - Navigation items (can include dropdown children)
   * @param baseRoute - Base route for this Web Component (e.g., '/users')
   */
  registerNavigation(items: PageNavigationPayload['items'], baseRoute: string): void {
    const payload: PageNavigationPayload = { items, baseRoute };
    // Use stateful emit to handle timing race (WC loads before Portal listens)
    try {
      const statefulBus = getStatefulEventBus();
      statefulBus.emitStateful(EventType.PAGE_NAVIGATION_REGISTER, payload);
      this.log(`Navigation registered for ${baseRoute}`, 'debug', payload);
    } catch (error) {
      console.warn(`[${this.source}] Stateful EventBus not available, falling back to regular emit`);
      this.emitter.emit(EventType.PAGE_NAVIGATION_REGISTER, payload);
    }
  }

  /**
   * Clear navigation items
   * Portal will remove the navigation menu
   */
  clearNavigation(): void {
    this.emitter.emit(EventType.PAGE_NAVIGATION_CLEAR);
    this.log('Navigation cleared', 'debug');
  }

  // ============================================================================
  // STATEFUL EVENTS (for cross-component communication in composed pages)
  // ============================================================================

  /**
   * Emit a stateful event for cross-component communication
   * State is persisted and replayed to late joiners
   *
   * Use this when multiple Web Components need to share state on a composed page
   *
   * @param eventName - Custom event name (e.g., 'user:selected', 'filter:changed')
   * @param payload - Event data
   *
   * @example
   * // Component A emits user selection
   * eventBus.emitStateful('user:selected', { userId: 123, userName: 'John' });
   *
   * // Component B (loaded later) receives the state immediately
   * eventBus.onStateful('user:selected', (data) => {
   *   console.log('Selected user:', data.userId);
   * });
   */
  emitStateful(eventName: string, payload: any): void {
    try {
      const statefulBus = getStatefulEventBus();
      statefulBus.emitStateful(eventName, payload);
      this.log(`Stateful event emitted: ${eventName}`, 'debug');
    } catch (error) {
      console.warn(`[${this.source}] Stateful EventBus not available, falling back to regular emit`);
      this.emitter.emit(eventName as any, payload);
    }
  }

  /**
   * Listen to a stateful event
   * Immediately receives current state if it exists (late joiner pattern)
   *
   * @param eventName - Custom event name
   * @param callback - Handler called with event payload
   * @returns Unsubscribe function
   *
   * @example
   * const unsubscribe = eventBus.onStateful('user:selected', (data) => {
   *   console.log('User selected:', data.userId);
   * });
   * // Later: unsubscribe();
   */
  onStateful(eventName: string, callback: (payload: any) => void): () => void {
    try {
      const statefulBus = getStatefulEventBus();
      return statefulBus.onStateful(eventName, callback);
    } catch (error) {
      console.warn(`[${this.source}] Stateful EventBus not available, falling back to regular listener`);
      this.emitter.on(eventName as any, callback);
      return () => this.emitter.off(eventName as any, callback);
    }
  }

  /**
   * Get current state for an event without subscribing
   *
   * @param eventName - Event name
   * @returns Current state or undefined
   */
  getState(eventName: string): any | undefined {
    try {
      const statefulBus = getStatefulEventBus();
      return statefulBus.getState(eventName);
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Clear stateful event state
   *
   * @param eventName - Optional event name. If omitted, clears all state.
   */
  clearState(eventName?: string): void {
    try {
      const statefulBus = getStatefulEventBus();
      statefulBus.clearState(eventName);
      this.log(eventName ? `State cleared: ${eventName}` : 'All state cleared', 'debug');
    } catch (error) {
      // Silent fail if stateful bus not available
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Get current locale
   */
  getLocale(): string {
    return this.locale;
  }

  /**
   * Get source identifier
   */
  getSource(): string {
    return this.source;
  }

  /**
   * Internal logging helper
   * Emits log to portal and optionally logs to console
   */
  private log(message: string, level: 'error' | 'debug' | 'info', meta?: any): void {
    // Always emit to portal
    this.emitLog(message, level, meta);

    // Optionally log to console if debug enabled
    if (this.debug) {
      const prefix = `[${this.source}]`;
      if (level === 'error') {
        console.error(prefix, message, meta || '');
      } else if (level === 'info') {
        console.info(prefix, message, meta || '');
      } else {
        console.debug(prefix, message, meta || '');
      }
    }
  }
}
