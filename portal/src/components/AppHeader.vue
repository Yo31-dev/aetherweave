<template>
  <header class="app-header">
    <div class="header-wrapper">
      <div class="header-content">
        <!-- Logo -->
        <div class="logo-section">
          <router-link to="/" class="logo-link">
            <v-icon icon="mdi-square-rounded" color="primary" size="32"></v-icon>
            <span class="logo-text">AetherWeave</span>
          </router-link>
        </div>

      <!-- Navigation horizontale -->
      <nav class="horizontal-nav">
        <router-link to="/" class="nav-item" exact>
          {{ $t('nav.home', 'HOME') }}
        </router-link>

        <!-- Services dropdown -->
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <a v-bind="props" class="nav-item dropdown">
              {{ $t('nav.services', 'SERVICES') }}
              <v-icon size="small">mdi-chevron-down</v-icon>
            </a>
          </template>
          <v-list>
            <v-list-item
              v-for="service in navServices"
              :key="service.id"
              :to="service.path"
            >
              <template v-slot:prepend>
                <v-icon :icon="service.icon"></v-icon>
              </template>
              <v-list-item-title>{{ $t(`nav.${service.id}`, service.title) }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <router-link to="/catalog" class="nav-item">
          {{ $t('nav.catalog', 'CATALOG') }}
        </router-link>

        <!-- Admin dropdown -->
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <a v-bind="props" class="nav-item dropdown">
              {{ $t('nav.admin', 'ADMIN') }}
              <v-icon size="small">mdi-chevron-down</v-icon>
            </a>
          </template>
          <v-list>
            <v-list-item to="/admin/settings">
              <template v-slot:prepend>
                <v-icon icon="mdi-cog"></v-icon>
              </template>
              <v-list-item-title>{{ $t('nav.settings', 'Settings') }}</v-list-item-title>
            </v-list-item>
            <v-list-item to="/admin/logs">
              <template v-slot:prepend>
                <v-icon icon="mdi-console-line"></v-icon>
              </template>
              <v-list-item-title>{{ $t('nav.logs', 'Logs') }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </nav>

      <!-- Actions (theme toggle, user menu) -->
      <div class="header-actions">
        <v-btn icon variant="text" @click="toggleTheme" size="small">
          <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </v-btn>

        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" variant="text" class="user-menu-btn">
              <v-icon start>mdi-account-circle</v-icon>
              <span class="user-name">{{ authStore.profile?.name || 'User' }}</span>
              <v-icon end size="small">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item v-if="!authStore.isAuthenticated" @click="authStore.login()">
              <template v-slot:prepend>
                <v-icon icon="mdi-login"></v-icon>
              </template>
              <v-list-item-title>{{ $t('common.login', 'Login') }}</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="authStore.isAuthenticated" @click="authStore.logout()">
              <template v-slot:prepend>
                <v-icon icon="mdi-logout"></v-icon>
              </template>
              <v-list-item-title>{{ $t('common.logout', 'Logout') }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useTheme } from '@/composables/useTheme';
import { getVisibleMicroServices } from '@/config/microservices.config';

const authStore = useAuthStore();
const { isDark, toggleTheme } = useTheme();

// Get services for dropdown
const navServices = computed(() => getVisibleMicroServices(authStore.isAuthenticated, true, false));
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
  gap: 8px;
}

.user-menu-btn {
  text-transform: none;
  font-weight: 500;
}

.user-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
