<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="pa-8 text-center">
          <v-icon size="80" color="primary" class="mb-4">mdi-web</v-icon>
          <h1 class="text-h3 font-weight-bold mb-4">AetherWeave Portal</h1>
          <p class="text-h6 text-grey mb-6">
            Micro-frontend orchestration platform
          </p>

          <v-divider class="my-6"></v-divider>

          <template v-if="authStore.isAuthenticated">
            <v-alert type="success" variant="tonal" class="mb-4">
              <v-icon start icon="mdi-check-circle"></v-icon>
              Successfully authenticated as <strong>{{ authStore.username }}</strong>
            </v-alert>

            <v-card variant="outlined" class="pa-4 text-left">
              <h3 class="text-h6 mb-3">User Information</h3>
              <v-list density="compact">
                <v-list-item v-if="authStore.profile?.name">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-account"></v-icon>
                  </template>
                  <v-list-item-title>{{ authStore.profile.name }}</v-list-item-title>
                  <v-list-item-subtitle>Name</v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="authStore.profile?.email">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-email"></v-icon>
                  </template>
                  <v-list-item-title>{{ authStore.profile.email }}</v-list-item-title>
                  <v-list-item-subtitle>Email</v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="authStore.profile?.preferred_username">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-account-circle"></v-icon>
                  </template>
                  <v-list-item-title>{{ authStore.profile.preferred_username }}</v-list-item-title>
                  <v-list-item-subtitle>Username</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </template>

          <template v-else>
            <v-alert type="info" variant="tonal" class="mb-4">
              <v-icon start icon="mdi-information"></v-icon>
              Please login to access the portal features
            </v-alert>
            <p class="text-body-1 text-grey">
              Click the "Login" button in the header to authenticate via OAuth2/OIDC
            </p>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
</script>
