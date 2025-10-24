<template>
  <v-list-item
    :class="`log-item log-item--${log.level}`"
    @click="showDetails"
  >
    <template v-slot:prepend>
      <v-avatar :color="levelColor" size="32">
        <v-icon :icon="levelIcon" size="18" color="white"></v-icon>
      </v-avatar>
    </template>

    <v-list-item-title class="d-flex align-center">
      <span class="log-message">{{ log.message }}</span>
      <v-chip
        v-if="log.source"
        size="x-small"
        variant="outlined"
        class="ml-2"
      >
        {{ log.source }}
      </v-chip>
    </v-list-item-title>

    <v-list-item-subtitle class="log-timestamp">
      {{ formattedTimestamp }}
    </v-list-item-subtitle>

    <template v-slot:append v-if="log.meta">
      <v-icon icon="mdi-information-outline" size="small"></v-icon>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { LogEntry } from '@/services/log.service';

interface Props {
  log: LogEntry;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  showDetails: [log: LogEntry];
}>();

const levelColor = computed(() => {
  switch (props.log.level) {
    case 'error':
      return 'error';
    case 'debug':
      return 'grey';
    case 'info':
      return 'success';
    default:
      return 'grey';
  }
});

const levelIcon = computed(() => {
  switch (props.log.level) {
    case 'error':
      return 'mdi-alert-circle';
    case 'debug':
      return 'mdi-bug';
    case 'info':
      return 'mdi-information';
    default:
      return 'mdi-circle';
  }
});

const formattedTimestamp = computed(() => {
  const date = new Date(props.log.timestamp);
  const time = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const dateStr = date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  });
  return `${time} - ${dateStr}`;
});

function showDetails() {
  if (props.log.meta) {
    emit('showDetails', props.log);
  }
}
</script>

<style scoped>
.log-item {
  border-left: 4px solid transparent;
  transition: background-color 0.2s;
}

.log-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.log-item--error {
  border-left-color: rgb(var(--v-theme-error));
}

.log-item--debug {
  border-left-color: rgb(var(--v-theme-grey));
}

.log-item--info {
  border-left-color: rgb(var(--v-theme-success));
}

.log-message {
  font-size: 0.875rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-timestamp {
  font-size: 0.75rem;
  opacity: 0.7;
}
</style>
