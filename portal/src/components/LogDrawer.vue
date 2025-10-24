<template>
  <v-navigation-drawer
    v-model="logStore.drawerOpen"
    location="right"
    :width="isMobile ? '100%' : 400"
    temporary
  >
    <!-- Header -->
    <v-toolbar color="primary" dark>
      <v-toolbar-title class="d-flex align-center">
        <v-icon start>mdi-console</v-icon>
        {{ $t('logs.title', 'Logs') }}
        <v-chip
          v-if="logStore.logCount > 0"
          size="small"
          class="ml-2"
          color="white"
          variant="outlined"
        >
          {{ logStore.logCount }}
        </v-chip>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon @click="logStore.closeDrawer">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>

    <!-- Filters and Actions -->
    <v-card flat>
      <v-card-text class="pa-2">
        <v-row dense>
          <!-- Level Filters -->
          <v-col cols="12">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  variant="outlined"
                  size="small"
                  block
                  prepend-icon="mdi-filter"
                >
                  {{ $t('logs.filters', 'Filters') }}
                  <v-chip
                    v-if="activeFiltersCount > 0"
                    size="x-small"
                    class="ml-2"
                    color="primary"
                  >
                    {{ activeFiltersCount }}
                  </v-chip>
                </v-btn>
              </template>

              <v-card min-width="250">
                <v-card-text>
                  <div class="text-subtitle-2 mb-2">{{ $t('logs.levels', 'Levels') }}</div>
                  <v-checkbox
                    v-for="level in (['error', 'debug', 'info'] as const)"
                    :key="level"
                    :label="level.toUpperCase()"
                    :model-value="logStore.levelFilters.has(level)"
                    @update:model-value="logStore.toggleLevelFilter(level)"
                    density="compact"
                    hide-details
                    :color="getLevelColor(level)"
                  ></v-checkbox>

                  <v-divider class="my-3"></v-divider>

                  <div class="text-subtitle-2 mb-2">
                    {{ $t('logs.sources', 'Sources') }}
                    <v-btn
                      v-if="logStore.sourceFilters.size > 0"
                      size="x-small"
                      variant="text"
                      @click="logStore.clearSourceFilters"
                    >
                      {{ $t('logs.clearSources', 'Clear') }}
                    </v-btn>
                  </div>

                  <v-checkbox
                    v-for="source in logStore.availableSources"
                    :key="source"
                    :label="source"
                    :model-value="logStore.sourceFilters.has(source)"
                    @update:model-value="logStore.toggleSourceFilter(source)"
                    density="compact"
                    hide-details
                  ></v-checkbox>

                  <v-divider class="my-3"></v-divider>

                  <v-btn
                    block
                    variant="outlined"
                    size="small"
                    @click="logStore.resetFilters"
                  >
                    {{ $t('logs.resetFilters', 'Reset All Filters') }}
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-menu>
          </v-col>

          <!-- Actions -->
          <v-col cols="6">
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  variant="outlined"
                  size="small"
                  block
                  prepend-icon="mdi-export"
                >
                  {{ $t('logs.export', 'Export') }}
                </v-btn>
              </template>

              <v-list density="compact">
                <v-list-item @click="logStore.exportJSON">
                  <template v-slot:prepend>
                    <v-icon>mdi-code-json</v-icon>
                  </template>
                  <v-list-item-title>Export as JSON</v-list-item-title>
                </v-list-item>

                <v-list-item @click="logStore.exportTXT">
                  <template v-slot:prepend>
                    <v-icon>mdi-text-box</v-icon>
                  </template>
                  <v-list-item-title>Export as TXT</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>

          <v-col cols="6">
            <v-btn
              variant="outlined"
              size="small"
              block
              prepend-icon="mdi-delete"
              @click="confirmClear = true"
            >
              {{ $t('logs.clear', 'Clear') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-divider></v-divider>

    <!-- Logs List -->
    <v-list class="log-list pa-0" v-if="logStore.filteredLogs.length > 0">
      <LogItem
        v-for="log in logStore.filteredLogs"
        :key="log.id"
        :log="log"
        @show-details="showLogDetails"
      />
    </v-list>

    <!-- Empty State -->
    <div v-else class="empty-state pa-6 text-center">
      <v-icon size="64" color="grey-lighten-1">mdi-console-line</v-icon>
      <p class="text-h6 mt-4 text-grey">
        {{ logStore.logs.length === 0
          ? $t('logs.noLogs', 'No logs yet')
          : $t('logs.noMatchingLogs', 'No matching logs')
        }}
      </p>
    </div>

    <!-- Log Details Dialog -->
    <LogDetailsDialog
      v-model="detailsDialogOpen"
      :log="selectedLog"
    />

    <!-- Clear Confirmation Dialog -->
    <v-dialog v-model="confirmClear" max-width="400">
      <v-card>
        <v-card-title>{{ $t('logs.confirmClearTitle', 'Clear All Logs?') }}</v-card-title>
        <v-card-text>
          {{ $t('logs.confirmClearMessage', 'This will permanently delete all logs from storage.') }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="confirmClear = false">
            {{ $t('common.cancel', 'Cancel') }}
          </v-btn>
          <v-btn color="error" variant="text" @click="handleClear">
            {{ $t('logs.clear', 'Clear') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Storage Warning Snackbar -->
    <v-snackbar
      v-model="logStore.storageWarningVisible"
      color="warning"
      :timeout="-1"
    >
      <v-icon start>mdi-alert</v-icon>
      {{ $t('logs.storageWarning', 'Log storage is nearly full') }}
      ({{ formatSize(logStore.storageSize) }})

      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="handleClearFromWarning"
        >
          {{ $t('logs.clear', 'Clear') }}
        </v-btn>
        <v-btn
          icon
          @click="logStore.dismissStorageWarning"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDisplay } from 'vuetify';
import { useLogStore } from '@/stores/log.store';
import LogItem from './LogItem.vue';
import LogDetailsDialog from './LogDetailsDialog.vue';
import type { LogEntry, LogLevel } from '@/services/log.service';

const { mobile } = useDisplay();
const logStore = useLogStore();

const confirmClear = ref(false);
const detailsDialogOpen = ref(false);
const selectedLog = ref<LogEntry | null>(null);

const isMobile = computed(() => mobile.value);

const activeFiltersCount = computed(() => {
  let count = 0;

  // Count disabled levels
  if (!logStore.levelFilters.has('error')) count++;
  if (!logStore.levelFilters.has('debug')) count++;
  if (!logStore.levelFilters.has('info')) count++;

  // Count active sources
  count += logStore.sourceFilters.size;

  return count;
});

function getLevelColor(level: LogLevel): string {
  switch (level) {
    case 'error':
      return 'error';
    case 'debug':
      return 'grey';
    case 'info':
      return 'success';
    default:
      return 'grey';
  }
}

function showLogDetails(log: LogEntry) {
  selectedLog.value = log;
  detailsDialogOpen.value = true;
}

async function handleClear() {
  await logStore.clearLogs();
  confirmClear.value = false;
}

async function handleClearFromWarning() {
  await logStore.clearLogs();
  logStore.dismissStorageWarning();
}

function formatSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}
</script>

<style scoped>
.log-list {
  height: calc(100vh - 180px);
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
}
</style>
