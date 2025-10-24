<template>
  <div class="micro-frontend-loader fill-height">
    <!-- Loading state -->
    <v-container v-if="state.loading" class="fill-height">
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
import type { MicroService } from '@/config/microservices.config';
import { useMicroFrontend } from '@/composables/useMicroFrontend';
import { useAuthStore } from '@/stores/auth.store';
import { logService } from '@/services/log.service';

interface Props {
  microservice: MicroService;
}

const props = defineProps<Props>();
const authStore = useAuthStore();

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
    logService.debug(
      'Updated Web Component auth properties',
      'MicroFrontendLoader',
      { hasToken: !!token, componentTag: props.microservice.componentTag }
    );
  }
}, { immediate: true });

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

      // Set initial auth properties
      (element as any).token = authStore.accessToken || '';
      (element as any).user = authStore.profile || null;

      containerRef.value.appendChild(element);
      webComponentInstance.value = element;
      logService.info(
        `Mounted Web Component: ${props.microservice.componentTag}`,
        'MicroFrontendLoader',
        { hasToken: !!authStore.accessToken }
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
  await loadAndMount();
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
