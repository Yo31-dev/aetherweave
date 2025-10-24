<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail && !mobile"
    :temporary="mobile"
    :permanent="!mobile"
    color="surface"
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
</style>
