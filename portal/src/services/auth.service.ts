import { UserManager, User, type UserManagerSettings } from 'oidc-client-ts';

/**
 * Authentication service using oidc-client-ts for OAuth2/OIDC flows.
 * Provider-agnostic - works with Keycloak, Auth0, Okta, etc.
 */
class AuthService {
  private userManager: UserManager;

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
      console.log('Access token expiring...');
    });

    this.userManager.events.addAccessTokenExpired(() => {
      console.log('Access token expired');
    });

    this.userManager.events.addUserSignedOut(() => {
      console.log('User signed out');
    });
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
}

export const authService = new AuthService();
