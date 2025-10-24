<template>
  <v-container fluid class="pa-6">
    <!-- Welcome section -->
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h3 font-weight-bold mb-2">
          {{ $t('dashboard.welcome') }}
        </h1>
        <p class="text-h6 text-grey" v-if="authStore.isAuthenticated">
          {{ $t('dashboard.welcomeUser', { name: authStore.username }) }}
        </p>
        <p class="text-body-1 text-grey" v-else>
          {{ $t('dashboard.pleaseLogin') }}
        </p>
      </v-col>
    </v-row>

    <!-- Microservices cards -->
    <v-row v-if="authStore.isAuthenticated">
      <v-col
        v-for="service in dashboardServices"
        :key="service.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card
          :to="{ path: service.path }"
          hover
          class="fill-height"
        >
          <v-card-text class="text-center pa-6">
            <v-icon
              :icon="service.icon"
              size="64"
              color="primary"
              class="mb-4"
            ></v-icon>
            <h3 class="text-h5 font-weight-bold mb-2">
              {{ $t(`nav.${service.id}`, service.title) }}
            </h3>
            <p class="text-body-2 text-grey">
              {{ $t(`dashboard.${service.id}Description`, service.description || '') }}
            </p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="text"
            >
              {{ $t('dashboard.open') }}
              <v-icon end icon="mdi-arrow-right"></v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Not authenticated message -->
    <v-row v-else>
      <v-col cols="12" class="text-center">
        <v-icon icon="mdi-lock" size="100" color="grey" class="mb-4"></v-icon>
        <h2 class="text-h5 mb-4">{{ $t('dashboard.loginRequired') }}</h2>
        <v-btn
          color="primary"
          size="large"
          @click="handleLogin"
        >
          <v-icon start icon="mdi-login"></v-icon>
          {{ $t('common.login') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { getDashboardMicroServices } from '@/config/microservices.config';

const authStore = useAuthStore();

const dashboardServices = computed(() => getDashboardMicroServices());

async function handleLogin() {
  try {
    await authStore.login();
  } catch (error) {
    console.error('Login failed:', error);
  }
}
</script>
