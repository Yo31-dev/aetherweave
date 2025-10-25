<template>
  <v-app :style="{ '--sidebar-width': sidebarWidth + 'px' }">
    <!-- New: White header with horizontal navigation -->
    <AppHeader :custom-nav-items="customNavItems" />

    <!-- New: Dark title bar (full-width) -->
    <PageTitle :title="currentPageTitle">
      <template v-slot:actions>
        <slot name="title-actions"></slot>
      </template>
    </PageTitle>

    <!-- Sidebar Navigation (fixed left, under title bar) -->
    <AppSidebar v-model="drawer" @rail-changed="handleRailChange" />

    <!-- Main content area -->
    <v-main class="main-content">      
      <div class="content-centered">
        <router-view />      
      </div>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useLogStore } from '@/stores/log.store';
import { eventBus, type NavigationItem } from '@/services/event-bus.service';
import { logService } from '@/services/log.service';
import { useTheme } from '@/composables/useTheme';
import AppHeader from '@/components/AppHeader.vue';
import PageTitle from '@/components/PageTitle.vue';
import AppSidebar from '@/components/AppSidebar.vue';

const { mobile } = useDisplay();
const { locale } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const logStore = useLogStore();
const { getCurrentTheme } = useTheme();

// Drawer state
const drawer = ref(!mobile.value);
const isRailMode = ref(false);

// Calculate sidebar width based on state
const sidebarWidth = computed(() => {
  if (mobile.value) return 0;        // Mobile: no sidebar
  if (isRailMode.value) return 56;   // Rail: 56px
  return 250;                        // Normal: 250px
});

// Page title from route meta or default
const currentPageTitle = computed(() => {
  return (route.meta.title as string) || 'AetherWeave';
});

// Dynamic navigation from Web Components
const customNavItems = ref<NavigationItem[]>([]);

// Event listeners
let unsubscribeNav: (() => void) | null = null;
let unsubscribeNavClear: (() => void) | null = null;
let unsubscribeError: (() => void) | null = null;
let unsubscribeNotification: (() => void) | null = null;
let unsubscribeLog: (() => void) | null = null;

// Emit initial theme to Web Components on mount
onMounted(() => {
  const currentTheme = getCurrentTheme();
  eventBus.emitStateful('theme:changed', { theme: currentTheme, isDark: currentTheme === 'dark' });

  // Listen for navigation registration from WCs
  unsubscribeNav = eventBus.onNavigationRegister((payload) => {
    customNavItems.value = payload.items;
    logService.debug('Navigation registered', 'DefaultLayout', payload);
  });

  // Listen for navigation clear
  unsubscribeNavClear = eventBus.onNavigationClear(() => {
    customNavItems.value = [];
    logService.debug('Navigation cleared', 'DefaultLayout');
  });

  // Emit portal:ready to ask WCs to re-emit their metadata
  // This handles the case where WC loads before Portal starts listening
  eventBus.publishPortalReady();
  logService.debug('Portal ready - requested WC metadata', 'DefaultLayout');
});

// Auto-cleanup navigation when changing base routes
watch(() => route.path, (newPath, oldPath) => {
  const newBase = newPath.split('/')[1];
  const oldBase = oldPath?.split('/')[1];

  // Clear custom nav if changing sections
  if (oldBase && newBase !== oldBase) {
    customNavItems.value = [];
    logService.debug('Navigation auto-cleared due to route change', 'DefaultLayout', { from: oldPath, to: newPath });
  }
});

// Snackbar for notifications
const snackbar = ref({
  show: false,
  message: '',
  color: 'info',
});

// Handle rail state changes from sidebar
function handleRailChange(railState: boolean) {
  isRailMode.value = railState;
}

// Show notification
function showNotification(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') {
  snackbar.value = {
    show: true,
    message,
    color: type,
  };
}

// Initialize existing event listeners in the second onMounted (merge with first one later)
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
  if (unsubscribeNav) unsubscribeNav();
  if (unsubscribeNavClear) unsubscribeNavClear();
  if (unsubscribeError) unsubscribeError();
  if (unsubscribeNotification) unsubscribeNotification();
  if (unsubscribeLog) unsubscribeLog();
});
</script>

<style scoped>
.main-content {
  margin-top: 130px; /* 70px header + 60px title bar */
  background-color: #F8F9FA;
  min-height: calc(100vh - 130px);
}

.content-wrapper {
  margin-left: var(--sidebar-width);
  transition: margin-left 0.3s ease;
}

.content-centered {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* Dark theme */
.v-theme--dark .main-content {
  background-color: #121212;
}

/* Responsive - no sidebar on mobile */
@media (max-width: 1024px) {
  .content-centered {
    padding: 24px 16px;
  }
}
</style>
