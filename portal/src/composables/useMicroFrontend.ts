/**
 * useMicroFrontend Composable
 *
 * Dynamic loading and lifecycle management for micro-frontend Web Components
 */

import { ref, onUnmounted } from 'vue';
import type { MicroService } from '@/config/microservices.config';

export interface MicroFrontendState {
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

export function useMicroFrontend(microservice: MicroService) {
  const state = ref<MicroFrontendState>({
    loading: false,
    loaded: false,
    error: null,
  });

  const scriptElement = ref<HTMLScriptElement | null>(null);

  /**
   * Load the Web Component script
   */
  async function loadScript(): Promise<void> {
    // Check if already loaded
    if (state.value.loaded) {
      return;
    }

    // Check if script already exists in DOM
    const existingScript = document.querySelector(`script[src="${microservice.scriptUrl}"]`);
    if (existingScript) {
      state.value.loaded = true;
      state.value.loading = false;
      return;
    }

    state.value.loading = true;
    state.value.error = null;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = microservice.scriptUrl;
      script.type = 'module';
      script.async = true;

      script.onload = () => {
        state.value.loading = false;
        state.value.loaded = true;
        scriptElement.value = script;
        console.log(`[MicroFrontend] Loaded: ${microservice.name}`);
        resolve();
      };

      script.onerror = (error) => {
        state.value.loading = false;
        state.value.error = `Failed to load ${microservice.name}`;
        console.error(`[MicroFrontend] Error loading ${microservice.name}:`, error);
        reject(new Error(state.value.error));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Unload the Web Component (cleanup)
   */
  function unloadScript(): void {
    if (scriptElement.value && scriptElement.value.parentNode) {
      scriptElement.value.parentNode.removeChild(scriptElement.value);
      scriptElement.value = null;
      state.value.loaded = false;
      console.log(`[MicroFrontend] Unloaded: ${microservice.name}`);
    }
  }

  /**
   * Check if the custom element is defined
   */
  function isComponentDefined(): boolean {
    return customElements.get(microservice.componentTag) !== undefined;
  }

  /**
   * Wait for the custom element to be defined
   */
  async function waitForComponent(timeout = 5000): Promise<void> {
    if (isComponentDefined()) {
      return;
    }

    await Promise.race([
      customElements.whenDefined(microservice.componentTag),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Component definition timeout')), timeout)
      ),
    ]);
  }

  // Cleanup on unmount (optional, usually keep scripts loaded)
  onUnmounted(() => {
    // Don't automatically unload - scripts can be reused
    // If you want to unload on unmount, uncomment:
    // unloadScript();
  });

  return {
    state,
    loadScript,
    unloadScript,
    isComponentDefined,
    waitForComponent,
  };
}
