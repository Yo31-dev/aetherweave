<template>
  <div class="page-title-bar">
    <div class="title-wrapper">
      <div class="title-content">
        <h1 class="page-title">{{ title }}</h1>
        <div class="title-actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

interface Props {
  title?: string;
}

const props = defineProps<Props>();
const route = useRoute();

// Get title from props or route meta
const title = computed(() => {
  return props.title || (route.meta.title as string) || 'AetherWeave';
});
</script>

<style scoped>
.page-title-bar {
  width: 100%;
  background: #2C3E50;
  height: 60px;
  position: fixed;
  top: 70px;
  left: 0;
  z-index: 1050;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title-wrapper {
  height: 100%;
  margin-left: var(--sidebar-width);
  transition: margin-left 0.3s ease;
}

.title-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0;
}

.title-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Dark theme */
.v-theme--dark .page-title-bar {
  background: #1A1A1A;
}

/* Responsive */
@media (max-width: 1024px) {
  .title-content {
    padding: 0 16px;
  }
}
</style>
