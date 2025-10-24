<template>
  <div class="micro-frontend-loader fill-height">
    <!-- Not authenticated state -->
    <v-container v-if="!authStore.isAuthenticated" class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-alert
            type="warning"
            prominent
            border="start"
            class="mb-4"
          >
            <v-alert-title>{{ $t('loader.notAuthenticated', 'Not Authenticated') }}</v-alert-title>
            <div>{{ $t('loader.pleaseLogin', 'Please login to access this service.') }}</div>
          </v-alert>

          <v-card>
            <v-card-text class="text-center">
              <v-icon icon="mdi-lock" size="64" color="warning" class="mb-4"></v-icon>
              <p class="text-body-1 mb-4">
                {{ $t('loader.authRequired', 'Authentication is required to use this micro-frontend.') }}
              </p>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                @click="authStore.login()"
              >
                <v-icon start icon="mdi-login"></v-icon>
                {{ $t('common.login', 'Login') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Loading state -->
    <v-container v-else-if="state.loading" class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
            class="mb-4"
          ></v-progress-circular>
          <h2 class="text-h5 mb-2">{{ $t('loader.loading') }}</h2>
          <p class="text-body-1 text-grey">
            {{ $t('loader.loadingService', { name: microservice.name }) }}
          </p>
        </v-col>
      </v-row>
    </v-container>

    <!-- Error state -->
    <v-container v-else-if="state.error" class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-alert
            type="error"
            prominent
            border="start"
            class="mb-4"
          >
            <v-alert-title>{{ $t('loader.errorTitle') }}</v-alert-title>
            <div>{{ state.error }}</div>
          </v-alert>

          <v-card>
            <v-card-text>
              <p class="text-body-1 mb-4">
                {{ $t('loader.errorDescription') }}
              </p>
              <ul class="text-body-2">
                <li>{{ $t('loader.errorCheckNetwork') }}</li>
                <li>{{ $t('loader.errorCheckService') }}</li>
                <li>{{ $t('loader.errorCheckConsole') }}</li>
              </ul>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                @click="retry"
              >
                <v-icon start icon="mdi-refresh"></v-icon>
                {{ $t('loader.retry') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Web Component mounted -->
    <div
      v-else-if="state.loaded"
      class="micro-frontend-container"
      ref="containerRef"
    >
      <!-- The Web Component will be dynamically inserted here -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { MicroService } from '@/config/microservices.config';
import { useMicroFrontend } from '@/composables/useMicroFrontend';
import { useAuthStore } from '@/stores/auth.store';
import { logService } from '@/services/log.service';

interface Props {
  microservice: MicroService;
}

const props = defineProps<Props>();
const authStore = useAuthStore();
const { locale } = useI18n();

const containerRef = ref<HTMLDivElement | null>(null);
const webComponentInstance = ref<HTMLElement | null>(null);

// Use composable for script loading
const { state, loadScript, waitForComponent } = useMicroFrontend(props.microservice);

// Update Web Component properties when auth changes
watch(() => [authStore.accessToken, authStore.profile], ([token, profile]) => {
  if (webComponentInstance.value) {
    // Set properties on the Web Component
    (webComponentInstance.value as any).token = token || '';
    (webComponentInstance.value as any).user = profile || null;
    logService.debugVerbose(
      'Updated Web Component auth properties',
      'MicroFrontendLoader',
      { hasToken: !!token, componentTag: props.microservice.componentTag }
    );
  }
}, { immediate: true });

// Update Web Component lang property when portal locale changes
watch(locale, (newLocale) => {
  if (webComponentInstance.value) {
    (webComponentInstance.value as any).lang = newLocale;
    logService.debugVerbose(
      'Updated Web Component lang property',
      'MicroFrontendLoader',
      { locale: newLocale, componentTag: props.microservice.componentTag }
    );
  }
});

// Load and mount Web Component
async function loadAndMount() {
  try {
    // Load the script
    await loadScript();

    // Wait for custom element definition
    await waitForComponent();

    // Mount the Web Component
    if (containerRef.value) {
      const element = document.createElement(props.microservice.componentTag);

      // Set initial properties
      (element as any).token = authStore.accessToken || '';
      (element as any).user = authStore.profile || null;
      (element as any).lang = locale.value;

      containerRef.value.appendChild(element);
      webComponentInstance.value = element;
      logService.info(
        `Mounted Web Component: ${props.microservice.componentTag}`,
        'MicroFrontendLoader',
        { hasToken: !!authStore.accessToken, lang: locale.value }
      );
    }
  } catch (error) {
    console.error('[MicroFrontendLoader] Failed to load micro-frontend:', error);
    logService.error('Failed to load micro-frontend', 'MicroFrontendLoader', error);
    state.value.error = error instanceof Error ? error.message : 'Unknown error';
  }
}

// Retry loading
async function retry() {
  state.value.error = null;
  state.value.loading = false;
  state.value.loaded = false;
  await loadAndMount();
}

// Watch for microservice changes (if route changes)
watch(() => props.microservice, async () => {
  // Unmount previous component
  if (webComponentInstance.value && containerRef.value) {
    containerRef.value.removeChild(webComponentInstance.value);
    webComponentInstance.value = null;
  }

  // Reset state
  state.value.loading = false;
  state.value.loaded = false;
  state.value.error = null;

  // Load new component
  await loadAndMount();
}, { immediate: false });

onMounted(async () => {
  // Only load if authenticated
  if (authStore.isAuthenticated) {
    await loadAndMount();
  } else {
    logService.debugVerbose(
      'Skipping Web Component load - user not authenticated',
      'MicroFrontendLoader',
      { componentTag: props.microservice.componentTag }
    );
  }
});

// Watch for authentication changes - load component when user logs in
watch(() => authStore.isAuthenticated, async (isAuthenticated, wasAuthenticated) => {
  if (isAuthenticated && !wasAuthenticated) {
    // User just logged in, load the component
    logService.info(
      'User authenticated, loading Web Component',
      'MicroFrontendLoader',
      { componentTag: props.microservice.componentTag }
    );
    await loadAndMount();
  } else if (!isAuthenticated && wasAuthenticated) {
    // User just logged out, unmount the component
    logService.info(
      'User logged out, unmounting Web Component',
      'MicroFrontendLoader',
      { componentTag: props.microservice.componentTag }
    );
    if (webComponentInstance.value && containerRef.value) {
      containerRef.value.removeChild(webComponentInstance.value);
      webComponentInstance.value = null;
    }
  }
});

onUnmounted(() => {
  // Clean up Web Component instance
  if (webComponentInstance.value && containerRef.value) {
    containerRef.value.removeChild(webComponentInstance.value);
    webComponentInstance.value = null;
  }
});
</script>

<style scoped>
.micro-frontend-loader {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.micro-frontend-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Ensure Web Component takes full height */
.micro-frontend-container > * {
  flex: 1;
  width: 100%;
}
</style>
