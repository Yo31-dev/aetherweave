<template>
  <v-dialog v-model="isOpen" max-width="600">
    <v-card v-if="log">
      <v-card-title class="d-flex align-center">
        <v-avatar :color="levelColor" size="32" class="mr-3">
          <v-icon :icon="levelIcon" size="18" color="white"></v-icon>
        </v-avatar>
        <span>Log Details</span>
        <v-spacer></v-spacer>
        <v-btn icon variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-4">
        <v-list density="compact">
          <v-list-item>
            <v-list-item-title class="text-caption text-grey">Timestamp</v-list-item-title>
            <v-list-item-subtitle class="text-body-2">
              {{ formattedTimestamp }}
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <v-list-item-title class="text-caption text-grey">Level</v-list-item-title>
            <v-list-item-subtitle>
              <v-chip
                :color="levelColor"
                size="small"
                class="text-uppercase"
              >
                {{ log.level }}
              </v-chip>
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <v-list-item-title class="text-caption text-grey">Source</v-list-item-title>
            <v-list-item-subtitle class="text-body-2">
              {{ log.source }}
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <v-list-item-title class="text-caption text-grey">Message</v-list-item-title>
            <v-list-item-subtitle class="text-body-2">
              {{ log.message }}
            </v-list-item-subtitle>
          </v-list-item>

          <v-list-item v-if="log.meta">
            <v-list-item-title class="text-caption text-grey">Metadata</v-list-item-title>
            <v-list-item-subtitle>
              <pre class="meta-content">{{ formattedMeta }}</pre>
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="text"
          @click="copyToClipboard"
        >
          <v-icon start>mdi-content-copy</v-icon>
          Copy
        </v-btn>
        <v-btn
          variant="text"
          @click="close"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { LogEntry } from '@/services/log.service';

interface Props {
  modelValue: boolean;
  log: LogEntry | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const isOpen = ref(props.modelValue);

watch(() => props.modelValue, (value) => {
  isOpen.value = value;
});

watch(isOpen, (value) => {
  emit('update:modelValue', value);
});

const levelColor = computed(() => {
  if (!props.log) return 'grey';
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
  if (!props.log) return 'mdi-circle';
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
  if (!props.log) return '';
  const date = new Date(props.log.timestamp);
  return date.toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  });
});

const formattedMeta = computed(() => {
  if (!props.log?.meta) return '';
  return JSON.stringify(props.log.meta, null, 2);
});

function close() {
  isOpen.value = false;
}

async function copyToClipboard() {
  if (!props.log) return;

  const text = `[${formattedTimestamp.value}] [${props.log.level.toUpperCase()}] [${props.log.source}]
${props.log.message}
${props.log.meta ? '\nMetadata:\n' + formattedMeta.value : ''}`;

  try {
    await navigator.clipboard.writeText(text);
    // Could emit a success notification here
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
}
</script>

<style scoped>
.meta-content {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 12px;
  border-radius: 4px;
  font-size: 0.75rem;
  overflow-x: auto;
  max-height: 200px;
}
</style>
