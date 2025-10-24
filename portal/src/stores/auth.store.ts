import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { User } from 'oidc-client-ts';
import { authService } from '@/services/auth.service';
import { eventBus } from '@/services/event-bus.service';
import { logService } from '@/services/log.service';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!user.value && !user.value.expired);
  const accessToken = computed(() => user.value?.access_token);
  const profile = computed(() => user.value?.profile);
  const username = computed(() => {
    if (!profile.value) return null;
    return profile.value.preferred_username || profile.value.name || profile.value.email;
  });

  // Setup token refresh listener
  authService.onTokenRefresh((renewedUser: User) => {
    logService.info('Token silently renewed, updating store', 'AuthStore', {
      expiresAt: new Date(renewedUser.expires_at * 1000).toISOString()
    });

    // Update store with renewed user
    user.value = renewedUser;

    // Publish to EventBus for Web Components
    if (renewedUser.access_token && renewedUser.profile) {
      eventBus.publishTokenRefresh({
        token: renewedUser.access_token,
        user: renewedUser.profile
      });
    }
  });

  // Actions
  async function login() {
    try {
      isLoading.value = true;
      error.value = null;
      await authService.login();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed';
      logService.error('Login failed', 'AuthStore', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function handleCallback() {
    try {
      isLoading.value = true;
      error.value = null;
      const authenticatedUser = await authService.handleCallback();
      user.value = authenticatedUser;
      logService.info('User authenticated', 'AuthStore', { profile: authenticatedUser.profile });
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Callback handling failed';
      logService.error('Callback handling failed', 'AuthStore', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    try {
      isLoading.value = true;
      error.value = null;
      await authService.logout();
      user.value = null;

      // Publish logout to Web Components
      eventBus.publishLogout();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Logout failed';
      logService.error('Logout failed', 'AuthStore', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function loadUser() {
    try {
      isLoading.value = true;
      error.value = null;
      const currentUser = await authService.getUser();
      user.value = currentUser;

      if (currentUser && currentUser.access_token) {
        logService.debug('User loaded', 'AuthStore', { profile: currentUser.profile });
      } else {
        logService.debug('No authenticated user', 'AuthStore');
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load user';
      logService.error('Failed to load user', 'AuthStore', err);
      user.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  async function renewToken() {
    try {
      const renewedUser = await authService.renewToken();
      user.value = renewedUser;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Token renewal failed';
      logService.error('Token renewal failed', 'AuthStore', err);
      throw err;
    }
  }

  return {
    // State
    user,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    accessToken,
    profile,
    username,
    // Actions
    login,
    handleCallback,
    logout,
    loadUser,
    renewToken,
  };
});
