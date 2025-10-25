<template>
  <v-navigation-drawer
    v-model="drawer"
    :temporary="mobile"
    :permanent="!mobile"
    color="surface"
    class="sidebar-light"
    @click="onDrawerClick"
  >
    <v-list density="compact" nav>
      <!-- Dynamic navigation from Web Components -->
      <template v-if="props.customNavItems && props.customNavItems.length > 0">
        <v-divider class="my-2"></v-divider>

        <template v-for="item in props.customNavItems" :key="item.label">
          <!-- Group with children (dropdown) -->
          <v-list-group v-if="item.children && item.children.length > 0" :value="item.label">
            <template v-slot:activator="{ props: groupProps }">
              <v-list-item v-bind="groupProps" :title="item.label.toUpperCase()"></v-list-item>
            </template>

            <!-- Sub-items -->
            <v-list-item
              v-for="child in item.children"
              :key="child.path"
              :title="child.label"
              :value="child.path"
              @click="() => navigateToPath(child.path)"
            ></v-list-item>
          </v-list-group>

          <!-- Direct link (no children) -->
          <v-list-item
            v-else
            :title="item.label.toUpperCase()"
            :value="item.path"
            @click="() => navigateToPath(item.path || '/')"
          ></v-list-item>
        </template>
      </template>

      <!-- Empty state message (when no navigation) -->
      <template v-else>
        <v-divider class="my-2"></v-divider>
        <div class="pa-4 text-center text-caption text-grey">
          {{ $t('nav.noContextualNav', 'Aucune navigation contextuelle') }}
        </div>
      </template>
    </v-list>

    <!-- Footer with theme toggle and version info -->
    <template v-slot:append>
      <div class="sidebar-footer">
        <v-divider></v-divider>

        <!-- Theme toggle (always visible) -->
        <div class="theme-toggle-container" @click="toggleTheme">
          <div class="theme-toggle-content">
            <v-icon size="small" :icon="isDark ? 'mdi-weather-night' : 'mdi-weather-sunny'"></v-icon>
            <span class="theme-label">{{ isDark ? 'Dark' : 'Light' }}</span>
          </div>
          <v-switch
            v-model="isDark"
            hide-details
            density="compact"
            color="primary"
            :readonly="true"
            class="theme-switch"
          ></v-switch>
        </div>

        <!-- Version info -->
        <div class="pa-3 text-center">
          <div class="text-caption text-grey">
            AetherWeave v{{ version }}
          </div>
        </div>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { useRouter } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import type { NavigationItem } from '@/services/event-bus.service';

// Props
interface Props {
  modelValue?: boolean;
  customNavItems?: NavigationItem[];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: true,
  customNavItems: undefined,
});

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

// Router
const router = useRouter();

// Responsive behavior
const { mobile } = useDisplay();

// Theme management
const { isDark, toggleTheme } = useTheme();

// Drawer state
const drawer = ref(props.modelValue);

// Version info
const version = ref('1.0.0');

// Watch drawer state and emit
watch(drawer, (value) => {
  emit('update:modelValue', value);
});

// Watch modelValue prop
watch(() => props.modelValue, (value) => {
  drawer.value = value;
});

// Navigate to a path
function navigateToPath(path: string) {
  router.push(path);

  // On mobile, close drawer after navigation
  if (mobile.value) {
    drawer.value = false;
  }
}

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
