<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="text-center pa-6">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
            class="mb-4"
          ></v-progress-circular>
          <h2 class="text-h5 mb-2">Processing Login</h2>
          <p class="text-body-1 text-grey">Please wait...</p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  try {
    await authStore.handleCallback();
    router.push('/');
  } catch (error) {
    console.error('Callback handling failed:', error);
    router.push('/');
  }
});
</script>
