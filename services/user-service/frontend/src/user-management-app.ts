import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { eventListener } from './services/event-listener.service';
import { userApi, type User } from './services/user-api.service';

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
 */
@customElement('user-management-app')
export class UserManagementApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      padding: 24px;
      font-family: var(--font-family, 'Roboto', sans-serif);
      background-color: var(--md-sys-color-background, #fafafa);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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
      background-color: var(--md-sys-color-surface-variant, #e7e0ec);
      font-weight: var(--font-weight-medium, 500);
      color: var(--md-sys-color-on-surface-variant, #49454f);
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

  connectedCallback() {
    super.connectedCallback();
    console.log('[UserManagement] Component connected');

    // Listen for logout from portal
    this.unsubLogout = eventListener.onLogout(() => {
      console.log('[UserManagement] Logout received, clearing state');
      this.users = [];
      this.loading = true;
    });

    // Listen for locale changes (future use)
    this.unsubLocale = eventListener.onLocaleChange((payload) => {
      console.log('[UserManagement] Locale changed:', payload.locale);
      // TODO: Update i18n
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    console.log('[UserManagement] Component disconnected');

    // Cleanup event listeners
    this.unsubLogout?.();
    this.unsubLocale?.();
  }

  /**
   * Lit lifecycle: called when properties change
   * This is where we react to token/user changes from the portal
   */
  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    // If token changed, reload users
    if (changedProperties.has('token')) {
      console.log('[UserManagement] Token changed:', this.token ? 'Present' : 'Absent');

      if (this.token) {
        console.log('[UserManagement] User:', this.user?.username || this.user?.email);
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

      console.log('[UserManagement] Loaded users:', this.users.length);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load users';
      console.error('[UserManagement] Load error:', err);
    } finally {
      this.loading = false;
    }
  }

  private async handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await userApi.deleteUser(id, this.token);
      await this.loadUsers(); // Reload list
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  render() {
    const isAuthenticated = !!this.token;

    return html`
      <div class="container">
        <div class="header">
          <h1>User Management</h1>
          <md-filled-button @click=${() => alert('Create user form - TODO')}>
            <md-icon slot="icon">add</md-icon>
            Add User
          </md-filled-button>
        </div>

        ${!isAuthenticated ? html`
          <div class="error">
            <strong>Not Authenticated</strong>
            <p>Please login to view users.</p>
          </div>
        ` : ''}

        ${this.loading && isAuthenticated ? html`
          <div class="loading">
            <md-circular-progress indeterminate></md-circular-progress>
            <p>Loading users...</p>
          </div>
        ` : this.error ? html`
          <div class="error">
            <strong>Error:</strong> ${this.error}
            <br><br>
            <md-text-button @click=${this.loadUsers}>
              <md-icon slot="icon">refresh</md-icon>
              Retry
            </md-text-button>
          </div>
        ` : this.users.length === 0 && isAuthenticated ? html`
          <div class="user-table">
            <div class="empty-state">
              <md-icon>person_off</md-icon>
              <h3>No Users Found</h3>
              <p>Click "Add User" to create your first user.</p>
            </div>
          </div>
        ` : isAuthenticated ? html`
          <div class="user-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Created</th>
                  <th>Actions</th>
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
                          Edit
                        </md-text-button>
                        <md-text-button @click=${() => this.handleDelete(user.id)}>
                          <md-icon slot="icon">delete</md-icon>
                          Delete
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
