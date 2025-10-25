import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { EventBusClient, ApiClient } from '@aetherweave/wc-core';
import { userApi, type User, type Role, type CreateUserData, type UpdateUserData } from './services/user-api.service';
import { roleApi, type CreateRoleData, type UpdateRoleData } from './services/role-api.service';
import { translate, use, get } from './i18n';

// Import Material Web Components
import '@material/web/button/filled-button.js';
import '@material/web/button/text-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/icon/icon.js';
import '@material/web/progress/circular-progress.js';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';

type ViewType = 'user-list' | 'user-create' | 'user-detail' | 'role-list' | 'role-create' | 'role-detail';

/**
 * User & Role Management Web Component
 *
 * CRUD interface for managing users and roles with internal routing
 *
 * Routes:
 * - /users → User list
 * - /users/create → Create user
 * - /users/:id → Edit user
 * - /users/roles → Role list
 * - /users/roles/create → Create role
 * - /users/roles/:id → Edit role
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

      --md-sys-color-primary: #FF6B35;
      --md-sys-color-on-primary: #FFFFFF;
      --md-sys-color-secondary: #FFB74D;
      --md-sys-color-on-secondary: #3D2200;
      --md-filled-button-container-color: #FF6B35;
      --md-filled-button-label-text-color: #FFFFFF;
    }

    :host(.dark-theme) {
      background-color: #1E1E1E;
      color: #FFFFFF;
      --md-sys-color-background: #1E1E1E;
      --md-sys-color-on-background: #FFFFFF;
      --md-sys-color-surface: #2A2A2A;
      --md-sys-color-on-surface: #FFFFFF;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
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
      background-color: #ffebee;
      color: #b71c1c;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .success {
      background-color: #e8f5e9;
      color: #2e7d32;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .user-table, .role-table {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 16px;
      text-align: left;
      border-bottom: 1px solid #cac4d0;
    }

    th {
      background-color: #F5F5F5;
      font-weight: 500;
      color: #212121;
      border-bottom: 2px solid #FF6B35;
    }

    tbody tr {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    tbody tr:hover {
      background-color: rgba(255, 107, 53, 0.08);
    }

    .form-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12);
      padding: 32px;
      max-width: 800px;
    }

    .form-field {
      margin-bottom: 24px;
    }

    .form-field md-filled-text-field {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #cac4d0;
    }

    .role-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .role-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      background-color: rgba(255, 107, 53, 0.1);
      color: #FF6B35;
      font-size: 12px;
      font-weight: 500;
      margin-right: 4px;
    }

    .checkbox-field {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
    }
  `;

  @property({ type: String })
  token: string = '';

  @property({ type: Object })
  user: any = null;

  @property({ type: String })
  lang: string = 'en';

  @state()
  private currentView: ViewType = 'user-list';

  @state()
  private currentItemId: string | null = null;

  @state()
  private users: User[] = [];

  @state()
  private currentUser: User | null = null;

  @state()
  private roles: Role[] = [];

  @state()
  private currentRole: Role | null = null;

  @state()
  private loading = true;

  @state()
  private error: string | null = null;

  @state()
  private successMessage: string | null = null;

  @state()
  private formData: any = {};

  private eventBus!: EventBusClient;
  private api!: ApiClient;
  private unsubLogout?: () => void;
  private unsubLocale?: () => void;
  private unsubTokenRefresh?: () => void;
  private unsubTheme?: () => void;
  private unsubPortalReady?: () => void;
  private popStateListener?: (e: PopStateEvent) => void;

  connectedCallback() {
    super.connectedCallback();

    this.eventBus = new EventBusClient({
      source: 'user-management',
      locale: this.lang,
      debug: true,
    });

    this.api = new ApiClient({
      baseUrl: '/api/v1',
      token: this.token,
      eventBus: this.eventBus,
      debug: true,
    });

    userApi.setClient(this.api, this.eventBus);
    roleApi.setClient(this.api, this.eventBus);
    
    this.eventBus.emitLog('Component connected', 'info');

    use(this.lang).catch(err => {
      this.eventBus.emitLog(`Failed to load locale ${this.lang}: ${err}`, 'error');
    });

    this.parseRoute();

    this.popStateListener = () => this.parseRoute();
    window.addEventListener('popstate', this.popStateListener);

    this.registerPageMetadata();

    this.unsubLogout = this.eventBus.onLogout(() => {
      this.users = [];
      this.roles = [];
      this.loading = true;
    });

    this.unsubTokenRefresh = this.eventBus.onTokenRefresh((payload) => {
      this.token = payload.token;
      this.user = payload.user;
    });

    this.unsubLocale = this.eventBus.onLocaleChange(async (payload) => {
      try {
        await use(payload.locale);
      } catch (err) {
        this.eventBus.emitLog(`Failed to change locale: ${err}`, 'error');
      }
    });

    this.unsubTheme = this.eventBus.onStateful('theme:changed', (payload: any) => {
      this.classList.toggle('dark-theme', payload.isDark);
    });

    this.unsubPortalReady = this.eventBus.onPortalReady(async () => {
      await this.registerPageMetadata();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.clearPageMetadata();
    this.unsubLogout?.();
    this.unsubLocale?.();
    this.unsubTokenRefresh?.();
    this.unsubTheme?.();
    this.unsubPortalReady?.();
    if (this.popStateListener) {
      window.removeEventListener('popstate', this.popStateListener);
    }
    this.api.destroy();
  }

  updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);

    if (changedProperties.has('lang') && this.lang) {
      use(this.lang).catch(err => {
        this.eventBus.emitLog(`Failed to load locale ${this.lang}: ${err}`, 'error');
      });
    }

    if (changedProperties.has('token')) {
      if (this.token) {
        this.loadDataForCurrentView();
      } else {
        this.users = [];
        this.roles = [];
        this.loading = true;
      }
    }
  }

  private parseRoute() {
    const path = window.location.pathname;

    if (path === '/users' || path === '/users/') {
      this.currentView = 'user-list';
      this.currentItemId = null;
      this.updatePageTitle();
      if (this.token) this.loadUsers();
    } else if (path === '/users/create') {
      this.currentView = 'user-create';
      this.currentItemId = null;
      this.resetUserForm();
      this.updatePageTitle();
      if (this.token) this.loadRoles();
    } else if (path === '/users/roles' || path === '/users/roles/') {
      this.currentView = 'role-list';
      this.currentItemId = null;
      this.updatePageTitle();
      if (this.token) this.loadRoles();
    } else if (path === '/users/roles/create') {
      this.currentView = 'role-create';
      this.currentItemId = null;
      this.resetRoleForm();
      this.updatePageTitle();
    } else if (path.startsWith('/users/roles/')) {
      const parts = path.split('/');
      const id = parts[3];
      if (id && id !== 'create') {
        this.currentView = 'role-detail';
        this.currentItemId = id;
        this.updatePageTitle();
        if (this.token) this.loadRoleDetail(id);
      }
    } else if (path.startsWith('/users/')) {
      const parts = path.split('/');
      const id = parts[2];
      if (id && id !== 'create' && id !== 'roles') {
        this.currentView = 'user-detail';
        this.currentItemId = id;
        this.updatePageTitle();
        if (this.token) this.loadUserDetail(id);
      }
    }
  }

  private navigateTo(path: string) {
    window.history.pushState({}, '', path);
    this.parseRoute();
  }

  private loadDataForCurrentView() {
    if (this.currentView === 'user-list') {
      this.loadUsers();
    } else if (this.currentView === 'user-create') {
      this.loadRoles();
    } else if (this.currentView === 'user-detail' && this.currentItemId) {
      this.loadUserDetail(this.currentItemId);
    } else if (this.currentView === 'role-list') {
      this.loadRoles();
    } else if (this.currentView === 'role-detail' && this.currentItemId) {
      this.loadRoleDetail(this.currentItemId);
    }
  }

  private updatePageTitle() {
    let subtitle = '';
    if (this.currentView === 'user-list') subtitle = get('subtitle.listUsers');
    else if (this.currentView === 'user-create') subtitle = get('subtitle.createUser');
    else if (this.currentView === 'user-detail') subtitle = get('subtitle.editUser');
    else if (this.currentView === 'role-list') subtitle = get('subtitle.listRoles');
    else if (this.currentView === 'role-create') subtitle = get('subtitle.createRole');
    else if (this.currentView === 'role-detail') subtitle = get('subtitle.editRole');
    this.eventBus.setPageTitle(get('title'), subtitle);
  }

  // ============================================================================
  // USER DATA LOADING
  // ============================================================================

  private async loadUsers() {
    if (!this.token) return;

    try {
      this.loading = true;
      this.error = null;
      this.users = await userApi.getUsers();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load users';
    } finally {
      this.loading = false;
    }
  }

  private async loadUserDetail(id: string) {
    if (!this.token) return;

    try {
      this.loading = true;
      this.error = null;

      const [user, roles] = await Promise.all([
        userApi.getUser(id),
        userApi.getRoles(),
      ]);

      this.currentUser = user;
      this.roles = roles;

      this.formData = {
        firstName: user.firstName,
        lastName: user.lastName,
        roleIds: user.roles.map(r => r.id),
        isActive: user.isActive,
      };
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load user';
    } finally {
      this.loading = false;
    }
  }

  private resetUserForm() {
    this.formData = {
      email: '',
      firstName: '',
      lastName: '',
      roleIds: [],
      isActive: true,
    };
    this.error = null;
    this.successMessage = null;
  }

  private async handleCreateUser() {
    try {
      this.loading = true;
      this.error = null;

      const newUser = await userApi.createUser(this.formData as CreateUserData);
      this.navigateTo(`/users/${newUser.id}`);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to create user';
    } finally {
      this.loading = false;
    }
  }

  private async handleUpdateUser() {
    if (!this.currentItemId) return;

    try {
      this.loading = true;
      this.error = null;

      await userApi.updateUser(this.currentItemId, this.formData as UpdateUserData);
      this.successMessage = 'User updated successfully';

      await this.loadUserDetail(this.currentItemId);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to update user';
    } finally {
      this.loading = false;
    }
  }

  private async handleDeleteUser(id: string) {
    const { get } = await import('./i18n');
    if (!confirm(get('messages.deleteConfirm'))) return;

    try {
      await userApi.deleteUser(id);
      this.navigateTo('/users');
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to delete user';
    }
  }

  // ============================================================================
  // ROLE DATA LOADING
  // ============================================================================

  private async loadRoles() {
    try {
      this.loading = true;
      this.error = null;
      this.roles = await roleApi.getRoles();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load roles';
    } finally {
      this.loading = false;
    }
  }

  private async loadRoleDetail(id: string) {
    if (!this.token) return;

    try {
      this.loading = true;
      this.error = null;

      this.currentRole = await roleApi.getRole(id);

      this.formData = {
        name: this.currentRole.name,
        description: this.currentRole.description || '',
      };
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to load role';
    } finally {
      this.loading = false;
    }
  }

  private resetRoleForm() {
    this.formData = {
      name: '',
      description: '',
    };
    this.error = null;
    this.successMessage = null;
  }

  private async handleCreateRole() {
    try {
      this.loading = true;
      this.error = null;

      const newRole = await roleApi.createRole(this.formData as CreateRoleData);
      this.navigateTo(`/users/roles/${newRole.id}`);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to create role';
    } finally {
      this.loading = false;
    }
  }

  private async handleUpdateRole() {
    if (!this.currentItemId) return;

    try {
      this.loading = true;
      this.error = null;

      await roleApi.updateRole(this.currentItemId, this.formData as UpdateRoleData);
      this.successMessage = 'Role updated successfully';

      await this.loadRoleDetail(this.currentItemId);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to update role';
    } finally {
      this.loading = false;
    }
  }

  private async handleDeleteRole(id: string) {
    const { get } = await import('./i18n');
    if (!confirm(get('messages.deleteRoleConfirm'))) return;

    try {
      await roleApi.deleteRole(id);
      this.navigateTo('/users/roles');
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to delete role';
    }
  }

  // ============================================================================
  // FORM HANDLING
  // ============================================================================

  private handleInputChange(field: string, value: any) {
    this.formData = { ...this.formData, [field]: value };
  }

  private toggleRole(roleId: string) {
    const roleIds = this.formData.roleIds || [];
    const index = roleIds.indexOf(roleId);

    if (index > -1) {
      this.formData = {
        ...this.formData,
        roleIds: roleIds.filter((id: string) => id !== roleId),
      };
    } else {
      this.formData = {
        ...this.formData,
        roleIds: [...roleIds, roleId],
      };
    }
  }

  // ============================================================================
  // PORTAL INTEGRATION
  // ============================================================================

  private async registerPageMetadata() {
    await use(this.lang);

    this.eventBus.setPageTitle(get('title'), get('subtitle.listUsers'));

    this.eventBus.registerNavigation([
      {
        label: get('navigation.users'),
        children: [
          { label: get('navigation.usersList'), path: '/users' },
          { label: get('navigation.usersCreate'), path: '/users/create' }
        ]
      },
      {
        label: get('navigation.roles'),
        children: [
          { label: get('navigation.rolesList'), path: '/users/roles' },
          { label: get('navigation.rolesCreate'), path: '/users/roles/create' }
        ]
      }
    ], '/users');
  }

  private clearPageMetadata() {
    this.eventBus.clearNavigation();
  }

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  render() {
    if (!this.token) {
      return html`
        <div class="container">
          <div class="error">
            <strong>${translate('messages.notAuthenticated')}</strong>
            <p>${translate('messages.pleaseLogin')}</p>
          </div>
        </div>
      `;
    }

    if (this.currentView === 'user-list') return this.renderUserListView();
    if (this.currentView === 'user-create') return this.renderUserCreateView();
    if (this.currentView === 'user-detail') return this.renderUserDetailView();
    if (this.currentView === 'role-list') return this.renderRoleListView();
    if (this.currentView === 'role-create') return this.renderRoleCreateView();
    if (this.currentView === 'role-detail') return this.renderRoleDetailView();

    return html`<div class="container">Unknown view</div>`;
  }

  private renderUserListView() {
    return html`
      <div class="container">
        <div class="header">
          <div></div>
          <md-filled-button @click=${() => this.navigateTo('/users/create')}>
            <md-icon slot="icon">add</md-icon>
            ${translate('actions.add')}
          </md-filled-button>
        </div>

        ${this.error ? html`<div class="error"><strong>Error:</strong> ${this.error}</div>` : ''}

        ${this.loading ? html`
          <div class="loading">
            <md-circular-progress indeterminate></md-circular-progress>
            <p>Loading...</p>
          </div>
        ` : this.users.length === 0 ? html`
          <div class="user-table">
            <div style="text-align: center; padding: 48px;">
              <p>No users found</p>
            </div>
          </div>
        ` : html`
          <div class="user-table">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Roles</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${this.users.map(user => html`
                  <tr @click=${() => this.navigateTo(`/users/${user.id}`)}>
                    <td>${user.email}</td>
                    <td>${user.firstName}</td>
                    <td>${user.lastName}</td>
                    <td>
                      ${(user.roles || []).map(role => html`<span class="role-badge">${role.name}</span>`)}
                    </td>
                    <td>${user.isActive ? '✓' : '✗'}</td>
                    <td @click=${(e: Event) => e.stopPropagation()}>
                      <md-text-button @click=${() => this.handleDeleteUser(user.id)}>
                        <md-icon slot="icon">delete</md-icon>
                        Delete
                      </md-text-button>
                    </td>
                  </tr>
                `)}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }

  private renderUserCreateView() {
    return html`
      <div class="container">
        ${this.error ? html`<div class="error"><strong>Error:</strong> ${this.error}</div>` : ''}

        <div class="form-container">
          <div class="form-field">
            <md-filled-text-field
              label="Email"
              type="email"
              required
              .value=${this.formData.email || ''}
              @input=${(e: any) => this.handleInputChange('email', e.target.value)}
            ></md-filled-text-field>
          </div>

          <div class="form-field">
            <md-filled-text-field
              label="First Name"
              required
              .value=${this.formData.firstName || ''}
              @input=${(e: any) => this.handleInputChange('firstName', e.target.value)}
            ></md-filled-text-field>
          </div>

          <div class="form-field">
            <md-filled-text-field
              label="Last Name"
              required
              .value=${this.formData.lastName || ''}
              @input=${(e: any) => this.handleInputChange('lastName', e.target.value)}
            ></md-filled-text-field>
          </div>

          <div class="form-field">
            <label>Roles</label>
            <div class="role-chips">
              ${this.roles.map(role => html`
                <md-filter-chip
                  label="${role.name}"
                  ?selected=${(this.formData.roleIds || []).includes(role.id)}
                  @click=${() => this.toggleRole(role.id)}
                ></md-filter-chip>
              `)}
            </div>
          </div>

          <div class="checkbox-field">
            <md-checkbox
              ?checked=${this.formData.isActive !== false}
              @change=${(e: any) => this.handleInputChange('isActive', e.target.checked)}
            ></md-checkbox>
            <label>Active</label>
          </div>

          <div class="form-actions">
            <md-outlined-button @click=${() => this.navigateTo('/users')}>
              Cancel
            </md-outlined-button>
            <md-filled-button @click=${this.handleCreateUser} ?disabled=${this.loading}>
              <md-icon slot="icon">save</md-icon>
              Create
            </md-filled-button>
          </div>
        </div>
      </div>
    `;
  }

  private renderUserDetailView() {
    if (this.loading) {
      return html`
        <div class="container">
          <div class="loading">
            <md-circular-progress indeterminate></md-circular-progress>
            <p>Loading...</p>
          </div>
        </div>
      `;
    }

    if (!this.currentUser) {
      return html`<div class="container"><div class="error">User not found</div></div>`;
    }

    return html`
      <div class="container">
        ${this.error ? html`<div class="error"><strong>Error:</strong> ${this.error}</div>` : ''}
        ${this.successMessage ? html`<div class="success">${this.successMessage}</div>` : ''}

        <div class="form-container">
          <div class="form-field">
            <md-filled-text-field
              label="Email"
              type="email"
              disabled
              .value=${this.currentUser.email}
            ></md-filled-text-field>
          </div>

          <div class="form-field">
            <md-filled-text-field
              label="First Name"
              required
              .value=${this.formData.firstName || ''}
              @input=${(e: any) => this.handleInputChange('firstName', e.target.value)}
            ></md-filled-text-field>
          </div>

          <div class="form-field">
            <md-filled-text-field
              label="Last Name"
              required
              .value=${this.formData.lastName || ''}
              @input=${(e: any) => this.handleInputChange('lastName', e.target.value)}
            ></md-filled-text-field>
          </div>

          <div class="form-field">
            <label>Roles</label>
            <div class="role-chips">
              ${this.roles.map(role => html`
                <md-filter-chip
                  label="${role.name}"
                  ?selected=${(this.formData.roleIds || []).includes(role.id)}
                  @click=${() => this.toggleRole(role.id)}
                ></md-filter-chip>
              `)}
            </div>
          </div>

          <div class="checkbox-field">
            <md-checkbox
              ?checked=${this.formData.isActive !== false}
              @change=${(e: any) => this.handleInputChange('isActive', e.target.checked)}
            ></md-checkbox>
            <label>Active</label>
          </div>

          <div class="form-actions">
            <md-text-button @click=${() => this.handleDeleteUser(this.currentItemId!)}>
              <md-icon slot="icon">delete</md-icon>
              Delete
            </md-text-button>
            <div style="flex: 1"></div>
            <md-outlined-button @click=${() => this.navigateTo('/users')}>
              Cancel
            </md-outlined-button>
            <md-filled-button @click=${this.handleUpdateUser} ?disabled=${this.loading}>
              <md-icon slot="icon">save</md-icon>
              Save
            </md-filled-button>
          </div>
        </div>
      </div>
    `;
  }

  private renderRoleListView() {
    return html`
      <div class="container">
        <div class="header">
          <div></div>
          <md-filled-button @click=${() => this.navigateTo('/users/roles/create')}>
            <md-icon slot="icon">add</md-icon>
            Add Role
          </md-filled-button>
        </div>

        ${this.error ? html`<div class="error"><strong>Error:</strong> ${this.error}</div>` : ''}

        ${this.loading ? html`
          <div class="loading">
            <md-circular-progress indeterminate></md-circular-progress>
            <p>Loading...</p>
          </div>
        ` : this.roles.length === 0 ? html`
          <div class="role-table">
            <div style="text-align: center; padding: 48px;">
              <p>No roles found</p>
            </div>
          </div>
        ` : html`
          <div class="role-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${this.roles.map(role => html`
                  <tr @click=${() => this.navigateTo(`/users/roles/${role.id}`)}>
                    <td>${role.name}</td>
                    <td>${role.description || '-'}</td>
                    <td>${role.createdAt ? new Date(role.createdAt).toLocaleDateString() : '-'}</td>
                    <td @click=${(e: Event) => e.stopPropagation()}>
                      <md-text-button @click=${() => this.handleDeleteRole(role.id)}>
                        <md-icon slot="icon">delete</md-icon>
                        Delete
                      </md-text-button>
                    </td>
                  </tr>
                `)}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }

  private renderRoleCreateView() {
    return html`
      <div class="container">
        ${this.error ? html`<div class="error"><strong>Error:</strong> ${this.error}</div>` : ''}

        <div class="form-container">
          <div class="form-field">
            <md-filled-text-field
              label="Name"
              required
              .value=${this.formData.name || ''}
              @input=${(e: any) => this.handleInputChange('name', e.target.value)}
            ></md-filled-text-field>
          </div>

          <div class="form-field">
            <md-filled-text-field
              label="Description"
              type="textarea"
              rows="3"
              .value=${this.formData.description || ''}
              @input=${(e: any) => this.handleInputChange('description', e.target.value)}
            ></md-filled-text-field>
          </div>

          <div class="form-actions">
            <md-outlined-button @click=${() => this.navigateTo('/users/roles')}>
              Cancel
            </md-outlined-button>
            <md-filled-button @click=${this.handleCreateRole} ?disabled=${this.loading}>
              <md-icon slot="icon">save</md-icon>
              Create
            </md-filled-button>
          </div>
        </div>
      </div>
    `;
  }

  private renderRoleDetailView() {
    if (this.loading) {
      return html`
        <div class="container">
          <div class="loading">
            <md-circular-progress indeterminate></md-circular-progress>
            <p>Loading...</p>
          </div>
        </div>
      `;
    }

    if (!this.currentRole) {
      return html`<div class="container"><div class="error">Role not found</div></div>`;
    }

    return html`
      <div class="container">
        ${this.error ? html`<div class="error"><strong>Error:</strong> ${this.error}</div>` : ''}
        ${this.successMessage ? html`<div class="success">${this.successMessage}</div>` : ''}

        <div class="form-container">
          <div class="form-field">
            <md-filled-text-field
              label="Name"
              required
              .value=${this.formData.name || ''}
              @input=${(e: any) => this.handleInputChange('name', e.target.value)}
            ></md-filled-text-field>
          </div>

          <div class="form-field">
            <md-filled-text-field
              label="Description"
              type="textarea"
              rows="3"
              .value=${this.formData.description || ''}
              @input=${(e: any) => this.handleInputChange('description', e.target.value)}
            ></md-filled-text-field>
          </div>

          <div class="form-actions">
            <md-text-button @click=${() => this.handleDeleteRole(this.currentItemId!)}>
              <md-icon slot="icon">delete</md-icon>
              Delete
            </md-text-button>
            <div style="flex: 1"></div>
            <md-outlined-button @click=${() => this.navigateTo('/users/roles')}>
              Cancel
            </md-outlined-button>
            <md-filled-button @click=${this.handleUpdateRole} ?disabled=${this.loading}>
              <md-icon slot="icon">save</md-icon>
              Save
            </md-filled-button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'user-management-app': UserManagementApp;
  }
}
