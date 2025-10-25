/**
 * @aetherweave/wc-core
 *
 * Framework-agnostic core library for AetherWeave Web Components
 * Provides types, EventBus client, and API client for Portal ↔ Web Component communication
 *
 * Can be used with any framework: Lit, React, Vue, Angular, Svelte, etc.
 */

// Export types
export type {
  AuthPayload,
  LocalePayload,
  NavigationPayload,
  ErrorPayload,
  NotificationPayload,
  LogPayload,
  PageTitlePayload,
  NavigationSubItem,
  NavigationItem,
  PageNavigationPayload,
  EventTypeKeys,
} from './types';

export { EventType } from './types';

// Export EventBus client
export { EventBusClient } from './eventbus';
export type { EventBusClientConfig } from './eventbus';

// Export API client
export { ApiClient, ApiError } from './api';
export type { ApiClientConfig, ApiResponse } from './api';
