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

    <!-- Footer with version info (when not rail mode) -->
    <template v-slot:append v-if="!rail || mobile">
      <div class="pa-4 text-center">
        <v-divider class="mb-2"></v-divider>
        <div class="text-caption text-grey">
          AetherWeave v{{ version }}
        </div>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { useAuthStore } from '@/stores/auth.store';
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
}>();

// Responsive behavior
const { mobile } = useDisplay();

// Auth store
const authStore = useAuthStore();

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

// On mobile, close drawer when clicking an item
function onDrawerClick() {
  if (mobile.value) {
    drawer.value = false;
  }
}
</script>

<style scoped>
.v-navigation-drawer {
  border-right: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.sidebar-light {
  background-color: #FFFFFF !important;
}

/* Active menu item - orange background */
:deep(.v-list-item--active) {
  background-color: rgba(255, 107, 53, 0.12) !important;
  color: #FF6B35 !important;
}

:deep(.v-list-item--active .v-icon) {
  color: #FF6B35 !important;
}

:deep(.v-list-item--active .v-list-item-title) {
  color: #FF6B35 !important;
  font-weight: 600;
}

/* Hover state - light orange */
:deep(.v-list-item:hover) {
  background-color: rgba(255, 107, 53, 0.08) !important;
}

/* Active group title */
:deep(.v-list-group__header.v-list-item--active) {
  background-color: rgba(255, 107, 53, 0.08) !important;
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
</style>
