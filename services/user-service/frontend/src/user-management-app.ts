import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { eventListener } from './services/event-listener.service';
import { userApi, type User } from './services/user-api.service';
import { translate, use } from './i18n';

// Import Material Web Components
import '@material/web/button/filled-button.js';
import '@material/web/button/text-button.js';
import '@material/web/icon/icon.js';
import '@material/web/progress/circular-progress.js';

/**
 * User Management Web Component
 *
 * CRUD interface for managing users
 *
 * Properties (passed by Portal):
 * - token: JWT auth token
 * - user: User profile object
 * - lang: Language code (optional, defaults to 'en')
 *
 * Supported languages: en, fr
 *
 * The component listens to locale change events from the portal
 * and automatically re-renders with the new translations.
 */
@customElement('user-management-app')
export class UserManagementApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      padding: 32px 24px 24px 24px;
      font-family: var(--font-family, 'Roboto', sans-serif);
      background-color: var(--md-sys-color-background, #fafafa);
      color: var(--md-sys-color-on-background, #1c1b1f);

      /* AetherWeave Material Design tokens */
      --md-sys-color-primary: #FF6B35;
      --md-sys-color-on-primary: #FFFFFF;
      --md-sys-color-secondary: #FFB74D;
      --md-sys-color-on-secondary: #3D2200;
      --md-filled-button-container-color: #FF6B35;
      --md-filled-button-label-text-color: #FFFFFF;
    }

    /* Dark theme overrides */
    :host(.dark-theme) {
      background-color: #1E1E1E;
      color: #FFFFFF;
      --md-sys-color-background: #1E1E1E;
      --md-sys-color-on-background: #FFFFFF;
      --md-sys-color-surface: #2A2A2A;
      --md-sys-color-on-surface: #FFFFFF;
      --md-sys-color-surface-variant: #3A3A3A;
      --md-sys-color-on-surface-variant: #B0B0B0;
      --md-sys-color-outline-variant: #4A4A4A;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0;
      margin-bottom: 24px;
    }

    h1 {
      font-size: var(--font-size-3xl, 2rem);
      font-weight: var(--font-weight-bold, 700);
      color: var(--md-sys-color-on-background, #1c1b1f);
      margin: 0;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      flex-direction: column;
      gap: 16px;
    }

    .error {
      background-color: var(--md-sys-color-error-container, #ffebee);
      color: var(--md-sys-color-on-error-container, #b71c1c);
      padding: 16px;
      border-radius: var(--radius-md, 8px);
      margin-bottom: 16px;
    }

    .user-table {
      background: var(--md-sys-color-surface, white);
      border-radius: var(--radius-lg, 12px);
      box-shadow: var(--elevation-1);
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 16px;
      text-align: left;
      border-bottom: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
    }

    th {
      background-color: #FFE4DB;
      font-weight: var(--font-weight-medium, 500);
      color: #3D1500;
    }

    tr:last-child td {
      border-bottom: none;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: var(--md-sys-color-on-surface-variant, #49454f);
    }

    .empty-state md-icon {
      font-size: 64px;
      opacity: 0.5;
      margin-bottom: 16px;
    }
  `;

  // ============================================================================
  // PROPERTIES (set by Portal via attributes/properties)
  // ============================================================================

  /**
   * JWT authentication token (passed by portal)
   */
  @property({ type: String })
  token: string = '';

  /**
   * User profile object (passed by portal)
   */
  @property({ type: Object })
  user: any = null;

  /**
   * Language code (passed by portal, optional)
   * Defaults to 'en'
   */
  @property({ type: String })
  lang: string = 'en';

  // ============================================================================
  // INTERNAL STATE
  // ============================================================================

  @state()
  private users: User[] = [];

  @state()
  private loading = true;

  @state()
  private error: string | null = null;

  // Cleanup functions
  private unsubLogout?: () => void;
  private unsubLocale?: () => void;
  private unsubTokenRefresh?: () => void;
  private unsubTheme?: () => void;

  connectedCallback() {
    super.connectedCallback();
    eventListener.emitLog('Component connected', 'info');

    // Set initial locale from lang property
    use(this.lang).catch(err => {
      eventListener.emitLog(`Failed to load locale ${this.lang}: ${err}`, 'error');
    });

    // Listen for logout from portal
    this.unsubLogout = eventListener.onLogout(() => {
      eventListener.emitLog('Logout received, clearing state', 'info');
      this.users = [];
      this.loading = true;
    });

    // Listen for token refresh from portal
    this.unsubTokenRefresh = eventListener.onTokenRefresh((payload) => {
      eventListener.emitLog('Token refreshed, updating local token', 'info');
      // Update local token and user properties
      this.token = payload.token;
      this.user = payload.user;
      // Lit will automatically trigger updated() which will reload users
    });

    // Listen for locale changes from portal
    this.unsubLocale = eventListener.onLocaleChange(async (payload) => {
      eventListener.emitLog(`Locale changed to: ${payload.locale}`, 'debug');
      try {
        await use(payload.locale);
        // Lit will automatically re-render when locale changes
      } catch (err) {
        eventListener.emitLog(`Failed to change locale: ${err}`, 'error');
      }
    });

    // Listen for theme changes from portal (stateful event)
    this.unsubTheme = eventListener.onThemeChange((payload) => {
      eventListener.emitLog(`Theme changed to: ${payload.theme}`, 'debug');
      this.classList.toggle('dark-theme', payload.isDark);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    eventListener.emitLog('Component disconnected', 'info');

    // Cleanup event listeners
    this.unsubLogout?.();
    this.unsubLocale?.();
    this.unsubTokenRefresh?.();
    this.unsubTheme?.();
  }

  /**
   * Lit lifecycle: called when properties change
   * This is where we react to token/user/lang changes from the portal
   */
  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // If lang changed, update locale
    if (changedProperties.has('lang') && this.lang) {
      eventListener.emitLog(`Lang property changed to: ${this.lang}`, 'debug');
      use(this.lang).catch(err => {
        eventListener.emitLog(`Failed to load locale ${this.lang}: ${err}`, 'error');
      });
    }

    // If token changed, reload users
    if (changedProperties.has('token')) {
      eventListener.emitLog(`Token changed: ${this.token ? 'Present' : 'Absent'}`, 'debug');

      if (this.token) {
        eventListener.emitLog(`User: ${this.user?.username || this.user?.email}`, 'debug');
        this.loadUsers();
      } else {
        this.users = [];
        this.loading = true;
      }
    }
  }

  private async loadUsers() {
    if (!this.token) {
      this.error = 'No authentication token';
      this.loading = false;
      return;
    }

    try {
      this.loading = true;
      this.error = null;

      // userApi will use the token from its internal getToken() method
      // We need to update userApi to accept token as parameter
      this.users = await userApi.getUsers(this.token);

      eventListener.emitLog(`Loaded ${this.users.length} users`, 'info');
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load users';
      eventListener.emitLog('Load error', 'error', err);
    } finally {
      this.loading = false;
    }
  }

  private async handleDelete(id: number) {
    // Get translated confirmation message
    const { get } = await import('./i18n');
    if (!confirm(get('messages.deleteConfirm'))) {
      return;
    }

    try {
      await userApi.deleteUser(id, this.token);
      await this.loadUsers(); // Reload list
      eventListener.emitLog('User deleted successfully', 'info');
    } catch (err) {
      eventListener.emitLog(`Delete failed: ${err}`, 'error');
    }
  }

  render() {
    const isAuthenticated = !!this.token;

    return html`
      <div class="container">
        <div class="header">
          <h1>${translate('title')}</h1>
          <md-filled-button @click=${() => alert('Create user form - TODO')}>
            <md-icon slot="icon">add</md-icon>
            ${translate('actions.add')}
          </md-filled-button>
        </div>

        ${!isAuthenticated ? html`
          <div class="error">
            <strong>${translate('messages.notAuthenticated')}</strong>
            <p>${translate('messages.pleaseLogin')}</p>
          </div>
        ` : ''}

        ${this.loading && isAuthenticated ? html`
          <div class="loading">
            <md-circular-progress indeterminate></md-circular-progress>
            <p>${translate('messages.loading')}</p>
          </div>
        ` : this.error ? html`
          <div class="error">
            <strong>${translate('messages.error')}</strong> ${this.error}
            <br><br>
            <md-text-button @click=${this.loadUsers}>
              <md-icon slot="icon">refresh</md-icon>
              ${translate('actions.retry')}
            </md-text-button>
          </div>
        ` : this.users.length === 0 && isAuthenticated ? html`
          <div class="user-table">
            <div class="empty-state">
              <md-icon>person_off</md-icon>
              <h3>${translate('messages.noUsers')}</h3>
              <p>${translate('messages.noUsersDescription')}</p>
            </div>
          </div>
        ` : isAuthenticated ? html`
          <div class="user-table">
            <table>
              <thead>
                <tr>
                  <th>${translate('table.id')}</th>
                  <th>${translate('table.username')}</th>
                  <th>${translate('table.email')}</th>
                  <th>${translate('table.created')}</th>
                  <th>${translate('table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                ${this.users.map(user => html`
                  <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                    <td>
                      <div class="actions">
                        <md-text-button @click=${() => alert(`Edit user ${user.id} - TODO`)}>
                          <md-icon slot="icon">edit</md-icon>
                          ${translate('actions.edit')}
                        </md-text-button>
                        <md-text-button @click=${() => this.handleDelete(user.id)}>
                          <md-icon slot="icon">delete</md-icon>
                          ${translate('actions.delete')}
                        </md-text-button>
                      </div>
                    </td>
                  </tr>
                `)}
              </tbody>
            </table>
          </div>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'user-management-app': UserManagementApp;
  }
}
