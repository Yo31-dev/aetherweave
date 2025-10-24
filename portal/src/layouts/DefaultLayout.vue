<template>
  <v-app>
    <!-- App Bar (already created, but need to add burger menu button) -->
    <v-app-bar color="#1E1E1E" prominent dark>
      <!-- Burger menu button (mobile only) -->
      <v-app-bar-nav-icon
        v-if="mobile"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>

      <div style="display: flex; align-items: center; gap: 10px; margin-left: 16px;">
        <img
          src="@/assets/logo-icon.svg"
          alt="AetherWeave Icon"
          style="height: 32px; width: 32px;"
        />
        <span style="font-size: 20px; font-weight: 500;">AetherWeave</span>
      </div>

      <v-spacer></v-spacer>

      <div class="d-flex align-center mr-4">
        <!-- User menu (authenticated) -->
        <template v-if="authStore.isAuthenticated">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-chip
                v-bind="props"
                color="white"
                variant="outlined"
                clickable
              >
                <v-icon start icon="mdi-account-circle"></v-icon>
                {{ authStore.username }}
                <v-icon end icon="mdi-menu-down"></v-icon>
              </v-chip>
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
                  <v-list-item-title>{{ $t('userMenu.accountSettings') }}</v-list-item-title>
                </v-list-item>

                <v-list-item @click="handleChangePassword">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-lock-reset"></v-icon>
                  </template>
                  <v-list-item-title>{{ $t('userMenu.changePassword') }}</v-list-item-title>
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
                  Logout
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
            color="white"
            :loading="authStore.isLoading"
          >
            <v-icon start icon="mdi-login"></v-icon>
            Login
          </v-btn>
        </template>
      </div>
    </v-app-bar>

    <!-- Sidebar Navigation -->
    <AppSidebar v-model="drawer" />

    <!-- Main content area -->
    <v-main>
      <!-- Router view (Web Components or views) -->
      <v-container fluid class="pa-0">
        <router-view />
      </v-container>
    </v-main>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top right"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useDisplay } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.store';
import { useLogStore } from '@/stores/log.store';
import { eventBus } from '@/services/event-bus.service';
import { logService } from '@/services/log.service';
import { authService } from '@/services/auth.service';
import AppSidebar from '@/components/AppSidebar.vue';

const { mobile } = useDisplay();
const { locale } = useI18n();
const authStore = useAuthStore();
const logStore = useLogStore();

// Drawer state
const drawer = ref(!mobile.value);

// Snackbar for notifications
const snackbar = ref({
  show: false,
  message: '',
  color: 'info',
});

// Auth actions
async function handleLogin() {
  try {
    await authStore.login();
  } catch (error) {
    console.error('Login failed:', error);
  }
}

async function handleLogout() {
  try {
    await authStore.logout();
  } catch (error) {
    console.error('Logout failed:', error);
  }
}

function handleAccountSettings() {
  authService.redirectToAccountManagement();
  logService.info('Redirecting to identity provider account management', 'DefaultLayout');
}

function handleChangePassword() {
  authService.redirectToPasswordChange();
  logService.info('Redirecting to identity provider password change', 'DefaultLayout');
}

// Show notification
function showNotification(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') {
  snackbar.value = {
    show: true,
    message,
    color: type,
  };
}

// Event listeners
let unsubscribeError: (() => void) | null = null;
let unsubscribeNotification: (() => void) | null = null;
let unsubscribeLog: (() => void) | null = null;

onMounted(() => {
  // Initialize log system
  logStore.initializeListeners();
  logService.info('Portal initialized', 'Portal');

  // Listen for errors from Web Components
  unsubscribeError = eventBus.onError((payload) => {
    showNotification(payload.message, 'error');
    logService.error(payload.message, payload.source || 'WebComponent', { code: payload.code });
  });

  // Listen for notifications from Web Components
  unsubscribeNotification = eventBus.onNotification((payload) => {
    showNotification(payload.message, payload.type);
  });

  // Listen for log messages from Web Components
  unsubscribeLog = eventBus.onLog((payload) => {
    // Route WC logs to logService
    switch (payload.level) {
      case 'error':
        logService.error(payload.message, payload.source, payload.meta);
        break;
      case 'debug':
        logService.debug(payload.message, payload.source, payload.meta);
        break;
      case 'info':
        logService.info(payload.message, payload.source, payload.meta);
        break;
    }
  });

  // Restore saved locale
  const savedLocale = localStorage.getItem('locale');
  if (savedLocale) {
    locale.value = savedLocale;
  }
});

onUnmounted(() => {
  // Cleanup event listeners
  if (unsubscribeError) unsubscribeError();
  if (unsubscribeNotification) unsubscribeNotification();
  if (unsubscribeLog) unsubscribeLog();
});
</script>

<style scoped>
.v-main {
  background-color: rgb(var(--v-theme-background));
}
</style>
