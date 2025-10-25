<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail && !mobile"
    :temporary="mobile"
    :permanent="!mobile"
    color="surface"
    class="sidebar-light"
    @click="onDrawerClick"
  >
    <v-list density="compact" nav>
      <!-- Toggle rail button (desktop only) -->
      <v-list-item v-if="!mobile" @click="rail = !rail">
        <template v-slot:prepend>
          <v-icon :icon="rail ? 'mdi-menu' : 'mdi-menu-open'"></v-icon>
        </template>
        <v-list-item-title>Menu</v-list-item-title>
      </v-list-item>

      <v-divider class="my-2"></v-divider>

      <!-- Dashboard home -->
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        :title="$t('nav.dashboard')"
        value="dashboard"
        :to="{ path: '/' }"
        exact
      ></v-list-item>

      <v-divider class="my-2"></v-divider>

      <!-- Microservices navigation items -->
      <v-list-item
        v-for="service in navServices"
        :key="service.id"
        :prepend-icon="service.icon"
        :title="$t(`nav.${service.id}`, service.title)"
        :value="service.id"
        :to="{ path: service.path }"
      ></v-list-item>

      <v-divider class="my-2"></v-divider>

      <!-- Development / Testing section (only show in dev mode) -->
      <v-list-group value="dev" v-if="isDev">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-flask"
            :title="$t('nav.dev', 'Development')"
          ></v-list-item>
        </template>

        <v-list-item
          prepend-icon="mdi-bus"
          :title="$t('nav.eventBusTest', 'EventBus Test')"
          value="test-eventbus"
          :to="{ path: '/test/stateful-eventbus' }"
        ></v-list-item>
      </v-list-group>

      <v-divider class="my-2" v-if="isDev"></v-divider>

      <!-- Admin section -->
      <v-list-group value="admin">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-shield-crown"
            :title="$t('nav.admin', 'Administration')"
          ></v-list-item>
        </template>

        <v-list-item
          prepend-icon="mdi-cog"
          :title="$t('nav.settings', 'Settings')"
          value="admin-settings"
          :to="{ path: '/admin/settings' }"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-console-line"
          :title="$t('nav.logs', 'Logs')"
          value="admin-logs"
          :to="{ path: '/admin/logs' }"
        ></v-list-item>
      </v-list-group>
    </v-list>

    <!-- Footer with theme toggle and version info -->
    <template v-slot:append>
      <div class="sidebar-footer">
        <v-divider></v-divider>

        <!-- Theme toggle (always visible) -->
        <div class="theme-toggle-container" @click="toggleTheme">
          <div class="theme-toggle-content">
            <v-icon size="small" :icon="isDark ? 'mdi-weather-night' : 'mdi-weather-sunny'"></v-icon>
            <span v-if="!rail || mobile" class="theme-label">{{ isDark ? 'Dark' : 'Light' }}</span>
          </div>
          <v-switch
            v-if="!rail || mobile"
            v-model="isDark"
            hide-details
            density="compact"
            color="primary"
            :readonly="true"
            class="theme-switch"
          ></v-switch>
        </div>

        <!-- Version info (when not rail mode) -->
        <div v-if="!rail || mobile" class="pa-3 text-center">
          <div class="text-caption text-grey">
            AetherWeave v{{ version }}
          </div>
        </div>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { useAuthStore } from '@/stores/auth.store';
import { useTheme } from '@/composables/useTheme';
import { getVisibleMicroServices } from '@/config/microservices.config';

// Props
interface Props {
  modelValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: true,
});

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'rail-changed', value: boolean): void;
}>();

// Responsive behavior
const { mobile } = useDisplay();

// Auth store
const authStore = useAuthStore();

// Theme management
const { isDark, toggleTheme } = useTheme();

// Drawer state
const drawer = ref(props.modelValue);
const rail = ref(false);

// Version info
const version = ref('1.0.0');

// Check if in development mode
const isDev = import.meta.env.DEV;

// Microservices for navigation - filtered by authentication
const navServices = computed(() => getVisibleMicroServices(authStore.isAuthenticated, true, false));

// Watch drawer state and emit
watch(drawer, (value) => {
  emit('update:modelValue', value);
});

// Watch modelValue prop
watch(() => props.modelValue, (value) => {
  drawer.value = value;
});

// Watch rail state and emit changes
watch(rail, (value) => {
  emit('rail-changed', value);
}, { immediate: true });

// On mobile, close drawer when clicking an item
function onDrawerClick() {
  if (mobile.value) {
    drawer.value = false;
  }
}
</script>

<style scoped>
.v-navigation-drawer {
  position: fixed !important;
  left: 0 !important;
  top: 130px !important; /* 70px header + 60px title bar */
  height: calc(100vh - 130px) !important;
  z-index: 1000 !important;
  border-right: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: #FFFFFF !important;
}

/* Dark theme sidebar */
.v-theme--dark .v-navigation-drawer {
  background: #1E1E1E !important;
}

.sidebar-light {
  /* Background color handled above */
}

/* List item text styling - match header navigation style */
:deep(.v-list-item) {
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  color: #616161 !important;
  letter-spacing: 0.3px !important;
}

:deep(.v-list-item-title) {
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  letter-spacing: 0.3px !important;
}

/* Responsive - mobile sidebar (temporary drawer) */
@media (max-width: 1024px) {
  .v-navigation-drawer {
    top: 70px !important; /* Just below header on mobile */
    height: calc(100vh - 70px) !important;
  }
}

/* Active menu item - no background, only orange text */
:deep(.v-list-item--active) {
  background: transparent !important;
  background-color: transparent !important;
  color: #FF6B35 !important;
}

:deep(.v-list-item--active::before),
:deep(.v-list-item--active::after) {
  opacity: 0 !important;
}

:deep(.v-list-item--active .v-list-item__overlay) {
  opacity: 0 !important;
}

:deep(.v-list-item--active .v-icon) {
  color: #FF6B35 !important;
}

:deep(.v-list-item--active .v-list-item-title) {
  color: #FF6B35 !important;
  font-weight: 600;
}

/* Hover state - light orange */
:deep(.v-list-item:hover:not(.v-list-item--active)) {
  background-color: rgba(255, 107, 53, 0.05) !important;
}

/* Active group title - no background, only orange text */
:deep(.v-list-group__header.v-list-item--active) {
  background: transparent !important;
  background-color: transparent !important;
}

:deep(.v-list-group__header.v-list-item--active::before),
:deep(.v-list-group__header.v-list-item--active::after) {
  opacity: 0 !important;
}

:deep(.v-list-group__header.v-list-item--active .v-list-item__overlay) {
  opacity: 0 !important;
}

:deep(.v-list-group__header.v-list-item--active .v-icon) {
  color: #FF6B35 !important;
}

:deep(.v-list-group__header.v-list-item--active .v-list-item-title) {
  color: #FF6B35 !important;
  font-weight: 600;
}

/* Remove indentation for admin group items */
:deep(.v-list-group__items .v-list-item) {
  padding-inline-start: 16px !important;
}

/* Footer text color */
.text-grey {
  color: #757575 !important;
}

/* Dividers - subtle gray */
:deep(.v-divider) {
  border-color: rgba(0, 0, 0, 0.08) !important;
}

/* Dark theme text colors */
.v-theme--dark :deep(.v-list-item) {
  color: #B0B0B0 !important;
}

.v-theme--dark :deep(.v-list-item-title) {
  color: #B0B0B0 !important;
}

/* Sidebar footer with theme toggle */
.sidebar-footer {
  width: 100%;
}

.theme-toggle-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  user-select: none;
}

.theme-toggle-container:hover {
  background-color: rgba(255, 107, 53, 0.05);
}

.theme-toggle-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #616161;
  letter-spacing: 0.3px;
}

.theme-label {
  transition: color 0.2s;
}

.theme-toggle-container:hover .theme-label {
  color: #FF6B35;
}

.theme-switch {
  pointer-events: none;
}

:deep(.theme-switch .v-selection-control) {
  min-height: auto;
}

/* Dark theme for toggle */
.v-theme--dark .theme-toggle-content {
  color: #B0B0B0;
}

.v-theme--dark .theme-toggle-container:hover .theme-label {
  color: #FF6B35;
}
</style>
