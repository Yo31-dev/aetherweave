<template>
  <v-app-bar color="primary" prominent>
    <v-toolbar-title class="text-h5 font-weight-bold">
      AetherWeave Portal
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <div class="d-flex align-center mr-4">
      <template v-if="authStore.isAuthenticated">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-chip
              v-bind="props"
              color="white"
              variant="outlined"
              clickable
            >
              <v-icon start icon="mdi-account-circle"></v-icon>
              {{ authStore.username }}
              <v-icon end icon="mdi-menu-down"></v-icon>
            </v-chip>
          </template>

          <v-card min-width="300">
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-avatar color="primary">
                    <v-icon icon="mdi-account"></v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold">
                  {{ authStore.profile?.name || authStore.username }}
                </v-list-item-title>
                <v-list-item-subtitle v-if="authStore.profile?.email">
                  {{ authStore.profile.email }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>

            <v-divider></v-divider>

            <v-list density="compact">
              <v-list-item v-if="authStore.profile?.preferred_username">
                <template v-slot:prepend>
                  <v-icon icon="mdi-account-circle"></v-icon>
                </template>
                <v-list-item-title>{{ authStore.profile.preferred_username }}</v-list-item-title>
                <v-list-item-subtitle>Username</v-list-item-subtitle>
              </v-list-item>

              <v-list-item v-if="authStore.profile?.email_verified !== undefined">
                <template v-slot:prepend>
                  <v-icon :icon="authStore.profile.email_verified ? 'mdi-check-circle' : 'mdi-alert-circle'"></v-icon>
                </template>
                <v-list-item-title>
                  {{ authStore.profile.email_verified ? 'Verified' : 'Not verified' }}
                </v-list-item-title>
                <v-list-item-subtitle>Email status</v-list-item-subtitle>
              </v-list-item>
            </v-list>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="error"
                variant="text"
                @click="handleLogout"
                :loading="authStore.isLoading"
              >
                <v-icon start icon="mdi-logout"></v-icon>
                Logout
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
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
    </div>
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
