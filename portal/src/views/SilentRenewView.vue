<template>
  <div>Processing silent token renewal...</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { authService } from '@/services/auth.service';

onMounted(async () => {
  try {
    await authService.handleSilentCallback();
  } catch (error) {
    console.error('Silent renew callback failed:', error);
  }
});
</script>
