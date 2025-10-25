<template>
  <header class="app-header">
    <div class="header-wrapper">
      <div class="header-content">
        <!-- Burger menu (mobile only) -->
        <v-btn
          v-if="mobile"
          icon="mdi-menu"
          variant="text"
          @click="toggleDrawer"
          class="burger-btn"
        ></v-btn>

        <!-- Logo -->
        <div class="logo-section">
          <router-link to="/" class="logo-link">
            <img src="/favicon.svg" alt="AetherWeave Logo" class="logo-icon" />
            <span class="logo-text">AetherWeave</span>
          </router-link>
        </div>

      <!-- Navigation horizontale (static) -->
      <nav class="horizontal-nav">
        <!-- HOME -->
        <router-link to="/" class="nav-item" :active-class="''" :exact-active-class="'router-link-active'">
          {{ $t('nav.home', 'HOME') }}
        </router-link>

        <!-- UTILISATEURS -->
        <router-link to="/users" class="nav-item">
          {{ $t('nav.users', 'UTILISATEURS') }}
        </router-link>

        <!-- DÉVELOPPEMENT dropdown -->
        <v-menu offset-y>
          <template v-slot:activator="{ props: menuProps }">
            <a v-bind="menuProps" class="nav-item dropdown">
              {{ $t('nav.development', 'DÉVELOPPEMENT') }}
              <v-icon size="small">mdi-chevron-down</v-icon>
            </a>
          </template>
          <v-list>
            <v-list-item to="/test/stateful-eventbus">
              <v-list-item-title>{{ $t('nav.eventBusTest', 'EventBus Test') }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- ADMIN dropdown -->
        <v-menu offset-y>
          <template v-slot:activator="{ props: menuProps }">
            <a v-bind="menuProps" class="nav-item dropdown">
              {{ $t('nav.admin', 'ADMIN') }}
              <v-icon size="small">mdi-chevron-down</v-icon>
            </a>
          </template>
          <v-list>
            <v-list-item to="/admin/settings">
              <v-list-item-title>{{ $t('nav.settings', 'Settings') }}</v-list-item-title>
            </v-list-item>
            <v-list-item to="/admin/logs">
              <v-list-item-title>{{ $t('nav.logs', 'Logs') }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </nav>

      <!-- Actions (user menu) -->
      <div class="header-actions">
        <!-- User menu (authenticated) -->
        <template v-if="authStore.isAuthenticated">
          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <a v-bind="props" class="nav-item dropdown user-dropdown">
                <v-icon size="small">mdi-account-circle</v-icon>
                {{ authStore.username }}
                <v-icon size="small">mdi-chevron-down</v-icon>
              </a>
            </template>

            <v-card min-width="300">
              <v-list>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-avatar color="primary">
                      <v-icon icon="mdi-account"></v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-bold">
                    {{ authStore.profile?.name || authStore.username }}
                  </v-list-item-title>
                  <v-list-item-subtitle v-if="authStore.profile?.email">
                    {{ authStore.profile.email }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>

              <v-divider></v-divider>

              <v-list density="compact">
                <v-list-item @click="handleAccountSettings">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-account-cog"></v-icon>
                  </template>
                  <v-list-item-title>{{ $t('userMenu.accountSettings', 'Account Settings') }}</v-list-item-title>
                </v-list-item>

                <v-list-item @click="handleChangePassword">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-lock-reset"></v-icon>
                  </template>
                  <v-list-item-title>{{ $t('userMenu.changePassword', 'Change Password') }}</v-list-item-title>
                </v-list-item>
              </v-list>

              <v-divider></v-divider>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="error"
                  variant="text"
                  @click="handleLogout"
                  :loading="authStore.isLoading"
                >
                  <v-icon start icon="mdi-logout"></v-icon>
                  {{ $t('common.logout', 'Logout') }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </template>

        <!-- Login button (not authenticated) -->
        <template v-else>
          <v-btn
            @click="handleLogin"
            variant="outlined"
            color="primary"
            :loading="authStore.isLoading"
          >
            <v-icon start icon="mdi-login"></v-icon>
            {{ $t('common.login', 'Login') }}
          </v-btn>
        </template>
      </div>
    </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { logService } from '@/services/log.service';

// Props
interface Props {
  modelValue?: boolean; // drawer state
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const authStore = useAuthStore();
const { mobile } = useDisplay();

// Drawer toggle
function toggleDrawer() {
  emit('update:modelValue', !props.modelValue);
}

// User menu handlers
function handleLogin() {
  authStore.login();
}

function handleLogout() {
  authStore.logout();
}

function handleAccountSettings() {
  authService.redirectToAccountManagement();
  logService.info('Redirecting to identity provider account management', 'AppHeader');
}

function handleChangePassword() {
  authService.redirectToPasswordChange();
  logService.info('Redirecting to identity provider password change', 'AppHeader');
}
</script>

<style scoped>
.app-header {
  width: 100%;
  background: #FFFFFF;
  height: 70px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid #E0E0E0;
}

.header-wrapper {
  height: 100%;
  margin-left: var(--sidebar-width);
  transition: margin-left 0.3s ease;
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
}

/* Logo section */
.logo-section {
  display: flex;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s;
}

.logo-link:hover {
  opacity: 0.8;
}

.logo-icon {
  width: 32px;
  height: 32px;
  display: block;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #212121;
}

/* Horizontal navigation */
.horizontal-nav {
  display: flex;
  align-items: center;
  gap: 32px;
  flex: 1;
  margin-left: 48px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #616161;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.2s;
  cursor: pointer;
}

.nav-item:hover {
  color: #FF6B35;
  background-color: rgba(255, 107, 53, 0.08);
}

.nav-item.router-link-active {
  color: #FF6B35;
  font-weight: 600;
}

.nav-item.dropdown {
  user-select: none;
}

/* Header actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* User dropdown styling - same as nav items */
.user-dropdown {
  font-weight: 500 !important;
}

/* Dark theme */
.v-theme--dark .app-header {
  background: #1E1E1E;
  border-bottom-color: #2A2A2A;
}

.v-theme--dark .logo-text {
  color: #FFFFFF;
}

.v-theme--dark .nav-item {
  color: #B0B0B0;
}

.v-theme--dark .nav-item:hover {
  color: #FF6B35;
  background-color: rgba(255, 107, 53, 0.12);
}

.v-theme--dark .nav-item.router-link-active {
  color: #FF6B35;
}

/* Responsive */
@media (max-width: 1024px) {
  .horizontal-nav {
    display: none;
  }

  .header-content {
    padding: 0 16px;
  }
}
</style>
