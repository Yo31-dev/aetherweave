/**
 * API Client for Web Components
 *
 * Framework-agnostic HTTP client with JWT authentication support.
 * Handles token injection, error handling, and base URL configuration.
 *
 * Can be used with any framework: Lit, React, Vue, Angular, Svelte, etc.
 */

import type { EventBusClient } from '../eventbus';

/**
 * API Client configuration
 */
export interface ApiClientConfig {
  /**
   * Base URL for API requests
   * Example: 'http://localhost:8000/api/v1'
   */
  baseUrl: string;

  /**
   * JWT token for authentication
   * Can be updated later via setToken()
   */
  token?: string;

  /**
   * EventBus client for auto-sync token refresh and logout
   * When provided, ApiClient will automatically:
   * - Update token when Portal emits AUTH_TOKEN_REFRESHED
   * - Clear token when Portal emits AUTH_LOGOUT
   */
  eventBus?: EventBusClient;

  /**
   * Custom headers to include in all requests
   */
  headers?: Record<string, string>;

  /**
   * Request timeout in milliseconds (default: 30000)
   */
  timeout?: number;

  /**
   * Enable debug logging to console
   */
  debug?: boolean;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

/**
 * API Error
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API Client
 * Framework-agnostic HTTP client with JWT authentication
 *
 * @example
 * // Create client instance
 * const api = new ApiClient({
 *   baseUrl: 'http://localhost:8000/api/v1',
 *   token: 'eyJhbGc...',
 * });
 *
 * // GET request
 * const users = await api.get('/users');
 *
 * // POST request
 * const newUser = await api.post('/users', { name: 'John', email: 'john@example.com' });
 *
 * // Update token
 * api.setToken('new-token-here');
 */
export class ApiClient {
  private baseUrl: string;
  private token?: string;
  private headers: Record<string, string>;
  private timeout: number;
  private debug: boolean;
  private eventBus?: EventBusClient;
  private unsubscribers: Array<() => void> = [];

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.token = config.token;
    this.headers = config.headers || {};
    this.timeout = config.timeout || 30000;
    this.debug = config.debug || false;
    this.eventBus = config.eventBus;

    this.log('API Client initialized', { baseUrl: this.baseUrl });

    // Auto-subscribe to Portal events if EventBus provided
    if (this.eventBus) {
      // Auto-update token on refresh
      this.unsubscribers.push(
        this.eventBus.onTokenRefresh((payload) => {
          this.log('Token auto-refreshed from Portal');
          this.setToken(payload.token);
        })
      );

      // Auto-clear token on logout
      this.unsubscribers.push(
        this.eventBus.onLogout(() => {
          this.log('Logout detected, clearing token');
          this.clearToken();
        })
      );

      this.log('Auto-sync enabled (token refresh + logout)');
    }
  }

  /**
   * Cleanup subscriptions
   * Call this in component's disconnectedCallback/unmount lifecycle
   */
  destroy(): void {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
    this.log('API Client destroyed, subscriptions cleaned up');
  }

  /**
   * Update JWT token
   * @param token - New JWT token
   */
  setToken(token: string): void {
    this.token = token;
    this.log('Token updated');
  }

  /**
   * Clear JWT token
   */
  clearToken(): void {
    this.token = undefined;
    this.log('Token cleared');
  }

  /**
   * Get current token
   */
  getToken(): string | undefined {
    return this.token;
  }

  /**
   * Set custom header
   * @param key - Header name
   * @param value - Header value
   */
  setHeader(key: string, value: string): void {
    this.headers[key] = value;
  }

  /**
   * Remove custom header
   * @param key - Header name
   */
  removeHeader(key: string): void {
    delete this.headers[key];
  }

  /**
   * GET request
   * @param path - API endpoint path (e.g., '/users' or '/users/123')
   * @param options - Optional fetch options
   * @returns Response data
   */
  async get<T = any>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  /**
   * POST request
   * @param path - API endpoint path
   * @param body - Request body (will be JSON stringified)
   * @param options - Optional fetch options
   * @returns Response data
   */
  async post<T = any>(path: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   * @param path - API endpoint path
   * @param body - Request body (will be JSON stringified)
   * @param options - Optional fetch options
   * @returns Response data
   */
  async put<T = any>(path: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   * @param path - API endpoint path
   * @param body - Request body (will be JSON stringified)
   * @param options - Optional fetch options
   * @returns Response data
   */
  async patch<T = any>(path: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   * @param path - API endpoint path
   * @param options - Optional fetch options
   * @returns Response data
   */
  async delete<T = any>(path: string, options?: RequestInit): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  /**
   * Generic request method
   * @param path - API endpoint path
   * @param options - Fetch options
   * @returns Response data
   */
  private async request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.headers,
      ...(options.headers as Record<string, string> || {}),
    };

    // Add Authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Prepare fetch options
    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };

    this.log(`${options.method || 'GET'} ${path}`, { url, hasToken: !!this.token });

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      // Make request
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      let data: any;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle error responses
      if (!response.ok) {
        this.log(`Error ${response.status}: ${response.statusText}`, { url, status: response.status });
        throw new ApiError(
          data?.message || response.statusText || 'Request failed',
          response.status,
          data?.code,
          data
        );
      }

      this.log(`Success ${response.status}`, { url });
      return data as T;

    } catch (error: any) {
      // Handle timeout
      if (error.name === 'AbortError') {
        this.log('Request timeout', { url, timeout: this.timeout });
        throw new ApiError('Request timeout', undefined, 'TIMEOUT');
      }

      // Handle network errors
      if (error instanceof TypeError) {
        this.log('Network error', { url, error: error.message });
        throw new ApiError('Network error', undefined, 'NETWORK_ERROR', error);
      }

      // Re-throw ApiError
      if (error instanceof ApiError) {
        throw error;
      }

      // Unknown error
      this.log('Unknown error', { url, error });
      throw new ApiError(error.message || 'Unknown error', undefined, 'UNKNOWN_ERROR', error);
    }
  }

  /**
   * Internal logging helper
   */
  private log(message: string, meta?: any): void {
    if (this.debug) {
      console.debug('[ApiClient]', message, meta || '');
    }
  }
}
