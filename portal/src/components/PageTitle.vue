<template>
  <div class="page-title-bar">
    <div class="title-wrapper">
      <div class="title-content">
        <!-- Title section with optional subtitle -->
        <div class="title-section">
          <h1 class="page-title">{{ displayTitle }}</h1>
          <span v-if="dynamicSubtitle" class="page-subtitle">{{ dynamicSubtitle }}</span>
        </div>

        <div class="title-actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { eventBus } from '@/services/event-bus.service';

interface Props {
  title?: string;
}

const props = defineProps<Props>();
const route = useRoute();

// Dynamic state from EventBus
const dynamicTitle = ref<string | null>(null);
const dynamicSubtitle = ref<string | null>(null);

// Priority: dynamic title from WC > props > route meta
const displayTitle = computed(() => {
  return dynamicTitle.value || props.title || (route.meta.title as string) || 'AetherWeave';
});

// Listen for WC title changes
let unsubscribeTitle: (() => void) | null = null;

onMounted(() => {
  unsubscribeTitle = eventBus.onPageTitleChange((payload) => {
    dynamicTitle.value = payload.title;
    dynamicSubtitle.value = payload.subtitle || null;
  });
});

onUnmounted(() => {
  unsubscribeTitle?.();
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
  gap: 24px;
}

.title-section {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-shrink: 0;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0;
}

.page-subtitle {
  font-size: 0.875rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
}

.title-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
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
