<template>
  <v-app-bar color="primary" prominent>
    <v-toolbar-title class="text-h5 font-weight-bold">
      AetherWeave Portal
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <template v-if="authStore.isAuthenticated">
      <v-chip class="mr-4" color="white" variant="outlined">
        <v-icon start icon="mdi-account-circle"></v-icon>
        {{ authStore.username }}
      </v-chip>

      <v-btn
        @click="handleLogout"
        variant="outlined"
        color="white"
        :loading="authStore.isLoading"
      >
        <v-icon start icon="mdi-logout"></v-icon>
        Logout
      </v-btn>
    </template>

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
  </v-app-bar>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();

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
</script>
