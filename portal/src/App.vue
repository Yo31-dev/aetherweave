<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import AppHeader from '@/components/AppHeader.vue';

const authStore = useAuthStore();

onMounted(async () => {
  // Load user on app startup
  await authStore.loadUser();
});
</script>

<template>
  <v-app>
    <AppHeader />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>
