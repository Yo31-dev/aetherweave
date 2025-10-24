<template>
  <v-app>
    <!-- App Bar (already created, but need to add burger menu button) -->
    <v-app-bar color="primary" prominent>
      <!-- Burger menu button (mobile only) -->
      <v-app-bar-nav-icon
        v-if="mobile"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>

      <v-toolbar-title class="text-h5 font-weight-bold">
        AetherWeave Portal
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <div class="d-flex align-center mr-4">
        <!-- Language Switcher -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              variant="text"
              color="white"
              class="mr-2"
            >
              <v-icon>mdi-translate</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item
              v-for="lang in availableLocales"
              :key="lang.code"
              @click="changeLocale(lang.code)"
              :active="locale === lang.code"
            >
              <v-list-item-title>{{ lang.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- Log Drawer Toggle -->
        <v-btn
          icon
          variant="text"
          color="white"
          class="mr-2"
          @click="logStore.toggleDrawer"
        >
          <v-badge
            v-if="logStore.logCount > 0"
            :content="logStore.logCount"
            color="error"
            overlap
          >
            <v-icon>mdi-console</v-icon>
          </v-badge>
          <v-icon v-else>mdi-console</v-icon>
        </v-btn>

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
                <v-list-item v-if="authStore.profile?.preferred_username">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-account-circle"></v-icon>
                  </template>
                  <v-list-item-title>{{ authStore.profile.preferred_username }}</v-list-item-title>
                  <v-list-item-subtitle>Username</v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="authStore.profile?.email_verified !== undefined">
                  <template v-slot:prepend>
                    <v-icon :icon="authStore.profile.email_verified ? 'mdi-check-circle' : 'mdi-alert-circle'"></v-icon>
                  </template>
                  <v-list-item-title>
                    {{ authStore.profile.email_verified ? 'Verified' : 'Not verified' }}
                  </v-list-item-title>
                  <v-list-item-subtitle>Email status</v-list-item-subtitle>
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
      <!-- Breadcrumbs -->
      <AppBreadcrumbs v-if="showBreadcrumbs" />

      <!-- Router view (Web Components or views) -->
      <v-container fluid class="fill-height pa-0">
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

    <!-- Log Drawer -->
    <LogDrawer />
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useDisplay } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.store';
import { useLogStore } from '@/stores/log.store';
import { eventBus } from '@/services/event-bus.service';
import { logService } from '@/services/log.service';
import AppSidebar from '@/components/AppSidebar.vue';
import AppBreadcrumbs from '@/components/AppBreadcrumbs.vue';
import LogDrawer from '@/components/LogDrawer.vue';

const route = useRoute();
const { mobile } = useDisplay();
const { locale } = useI18n();
const authStore = useAuthStore();
const logStore = useLogStore();

// Drawer state
const drawer = ref(!mobile.value);

// Available locales
const availableLocales = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
];

// Snackbar for notifications
const snackbar = ref({
  show: false,
  message: '',
  color: 'info',
});

// Show breadcrumbs (hide on dashboard)
const showBreadcrumbs = computed(() => route.path !== '/');

// Change locale
function changeLocale(newLocale: string) {
  locale.value = newLocale;
  localStorage.setItem('locale', newLocale);

  // Publish locale change to Web Components
  eventBus.publishLocale({ locale: newLocale });
}

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
  if (savedLocale && availableLocales.some(l => l.code === savedLocale)) {
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
