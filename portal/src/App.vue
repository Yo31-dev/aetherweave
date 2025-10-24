<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();

onMounted(async () => {
  // Load user on app startup
  await authStore.loadUser();
});
</script>

<template>
  <router-view />
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

/* Global theme support for Web Components that don't implement it yet */
/* This provides a basic dark background when theme is dark */
.v-theme--dark user-management-app,
.v-theme--dark [class*="-app"],
.v-theme--dark [class*="-wc"] {
  background-color: #1E1E1E;
  color: #FFFFFF;
}

/* Ensure WC containers take theme colors */
.v-theme--dark .micro-frontend-container {
  background-color: #1E1E1E;
}

.v-theme--light .micro-frontend-container {
  background-color: #FAFAFA;
}
</style>
