import { UserManager, User, type UserManagerSettings } from 'oidc-client-ts';
import { logService } from './log.service';

/**
 * Authentication service using oidc-client-ts for OAuth2/OIDC flows.
 * Provider-agnostic - works with Keycloak, Auth0, Okta, etc.
 */
class AuthService {
  private userManager: UserManager;

  private tokenRefreshCallbacks: Array<(user: User) => void> = [];

  constructor() {
    const settings: UserManagerSettings = {
      authority: import.meta.env.VITE_OIDC_AUTHORITY,
      client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI,
      post_logout_redirect_uri: import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI,
      response_type: import.meta.env.VITE_OIDC_RESPONSE_TYPE || 'code',
      scope: import.meta.env.VITE_OIDC_SCOPE || 'openid profile email',
      silent_redirect_uri: import.meta.env.VITE_OIDC_SILENT_REDIRECT_URI,
      automaticSilentRenew: true,
      loadUserInfo: true,
    };

    this.userManager = new UserManager(settings);

    // Setup event handlers
    this.userManager.events.addAccessTokenExpiring(() => {
      logService.debug('Access token expiring, silent renewal will trigger...', 'AuthService');
    });

    this.userManager.events.addAccessTokenExpired(() => {
      logService.debug('Access token expired', 'AuthService');
    });

    this.userManager.events.addUserSignedOut(() => {
      logService.info('User signed out', 'AuthService');
    });

    // Critical: Listen for silent token renewal
    this.userManager.events.addUserLoaded((user: User) => {
      logService.info('Token silently renewed', 'AuthService', {
        expiresAt: new Date(user.expires_at * 1000).toISOString()
      });
      // Notify all registered callbacks
      this.tokenRefreshCallbacks.forEach(callback => callback(user));
    });

    this.userManager.events.addSilentRenewError((error: Error) => {
      logService.error('Silent token renewal failed', 'AuthService', error);
    });
  }

  /**
   * Register callback for token refresh events
   * Returns unsubscribe function
   */
  onTokenRefresh(callback: (user: User) => void): () => void {
    this.tokenRefreshCallbacks.push(callback);
    return () => {
      const index = this.tokenRefreshCallbacks.indexOf(callback);
      if (index > -1) {
        this.tokenRefreshCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Initiate login flow (redirects to OAuth2 provider)
   */
  async login(): Promise<void> {
    await this.userManager.signinRedirect();
  }

  /**
   * Handle OAuth2 callback after redirect
   */
  async handleCallback(): Promise<User> {
    const user = await this.userManager.signinRedirectCallback();
    return user;
  }

  /**
   * Logout user and redirect to post_logout_redirect_uri
   */
  async logout(): Promise<void> {
    await this.userManager.signoutRedirect();
  }

  /**
   * Get current authenticated user
   */
  async getUser(): Promise<User | null> {
    return await this.userManager.getUser();
  }

  /**
   * Get access token (JWT)
   */
  async getAccessToken(): Promise<string | undefined> {
    const user = await this.getUser();
    return user?.access_token;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser();
    return !!user && !user.expired;
  }

  /**
   * Silently renew access token
   */
  async renewToken(): Promise<User | null> {
    return await this.userManager.signinSilent();
  }

  /**
   * Handle silent renew callback
   */
  async handleSilentCallback(): Promise<void> {
    await this.userManager.signinSilentCallback();
  }

  /**
   * Get Account Management URL
   * Returns the URL to the identity provider's account management page
   * Works with Keycloak, Auth0, Okta, and other OIDC-compliant providers
   */
  getAccountManagementUrl(): string | null {
    const authority = import.meta.env.VITE_OIDC_AUTHORITY;
    if (!authority) {
      return null;
    }

    // Standard OIDC account management URL format:
    // - Keycloak: https://host/realms/{realm}/account
    // - Auth0: https://{domain}/u/account
    // - Okta: https://{domain}/enduser/settings
    // The authority contains the base URL, append /account (Keycloak standard)
    return `${authority}/account`;
  }

  /**
   * Get Password Change URL
   * Returns the direct URL to the identity provider's password change page
   */
  getPasswordChangeUrl(): string | null {
    const accountUrl = this.getAccountManagementUrl();
    if (!accountUrl) {
      return null;
    }

    // Password change URL format (Keycloak standard):
    // https://host/realms/{realm}/account/#/security/signingin
    // Other providers may use different paths (configurable via env if needed)
    return `${accountUrl}/#/security/signingin`;
  }

  /**
   * Redirect to Identity Provider Account Management
   * Opens account management in a new tab
   */
  redirectToAccountManagement(): void {
    const url = this.getAccountManagementUrl();
    if (url) {
      window.open(url, '_blank');
    }
  }

  /**
   * Redirect to Identity Provider Password Change
   * Opens password change page in a new tab
   */
  redirectToPasswordChange(): void {
    const url = this.getPasswordChangeUrl();
    if (url) {
      window.open(url, '_blank');
    }
  }
}

export const authService = new AuthService();
