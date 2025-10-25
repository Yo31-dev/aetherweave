<template>
  <v-container fluid >
    <!-- Header -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-icon size="32" color="primary" class="mr-3">mdi-console</v-icon>
          <h1 class="text-h4">{{ $t('logs.admin.title') }}</h1>
        </div>
      </v-col>
    </v-row>

    <!-- Log Recording Configuration -->
    <v-row>
      <v-col cols="12">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-cog</v-icon>
                <span class="text-h6">{{ $t('logs.admin.recordingConfig', 'Log Recording Configuration') }}</span>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row align="center" class="mt-2">
                <v-col cols="12" md="6">
                  <v-select
                    v-model="enabledLogLevels"
                    :items="levelOptions"
                    :label="$t('logs.admin.enabledLevels', 'Levels to Record')"
                    multiple
                    chips
                    density="comfortable"
                    variant="outlined"
                    :hint="$t('logs.admin.enabledLevelsHint')"
                    persistent-hint
                    @update:model-value="updateEnabledLevels"
                  >
                    <template v-slot:chip="{ item }">
                      <v-chip :color="getLevelColor(item.value as LogLevel)" size="small">
                        {{ item.title }}
                      </v-chip>
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-alert type="info" density="compact" variant="tonal">
                    <strong>{{ $t('logs.admin.recordingNote', 'Note') }}:</strong>
                    {{ $t('logs.admin.recordingDescription', 'Only selected levels will be saved. This helps reduce storage usage.') }}
                  </v-alert>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>

    <!-- Statistics Cards -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey">{{ $t('logs.admin.totalLogs') }}</div>
                <div class="text-h5">{{ stats.totalLogs }}</div>
              </div>
              <v-icon size="40" color="primary">mdi-format-list-numbered</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey">{{ $t('logs.admin.storageSize') }}</div>
                <div class="text-h5">{{ formatBytes(stats.storageSize) }}</div>
              </div>
              <v-icon size="40" color="info">mdi-database</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey">{{ $t('logs.admin.errorCount') }}</div>
                <div class="text-h5 text-error">{{ stats.errorCount }}</div>
              </div>
              <v-icon size="40" color="error">mdi-alert-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey">{{ $t('logs.admin.sources') }}</div>
                <div class="text-h5">{{ stats.uniqueSources }}</div>
              </div>
              <v-icon size="40" color="success">mdi-source-branch</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Level Distribution Chart -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>{{ $t('logs.admin.levelDistribution') }}</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="3" class="text-center">
                <div class="text-h4 text-error">{{ stats.errorCount }}</div>
                <div class="text-caption">ERROR</div>
              </v-col>
              <v-col cols="3" class="text-center">
                <div class="text-h4 text-info">{{ stats.debugCount }}</div>
                <div class="text-caption">DEBUG</div>
              </v-col>
              <v-col cols="3" class="text-center">
                <div class="text-h4 text-success">{{ stats.infoCount }}</div>
                <div class="text-caption">INFO</div>
              </v-col>
              <v-col cols="3" class="text-center">
                <div class="text-h4 text-grey">{{ stats.verboseCount }}</div>
                <div class="text-caption">VERBOSE</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>{{ $t('logs.admin.dateRange') }}</v-card-title>
          <v-card-text>
            <div class="mb-2">
              <span class="text-caption text-grey">{{ $t('logs.admin.oldest') }}:</span>
              <span class="ml-2">{{ formatDate(stats.oldestLog) }}</span>
            </div>
            <div>
              <span class="text-caption text-grey">{{ $t('logs.admin.newest') }}:</span>
              <span class="ml-2">{{ formatDate(stats.newestLog) }}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters and Actions -->
    <v-row>
      <v-col cols="12">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-filter</v-icon>
                <span class="text-h6">{{ $t('logs.filters') }}</span>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row align="center" class="mt-2">
                <!-- Level Filters -->
                <v-col cols="12" sm="6" md="3">
                  <v-select
                    v-model="selectedLevels"
                    :items="levelOptions"
                    :label="$t('logs.levels')"
                    multiple
                    chips
                    density="compact"
                    variant="outlined"
                    hide-details
                  >
                    <template v-slot:chip="{ item }">
                      <v-chip :color="getLevelColor(item.value as LogLevel)" size="small">
                        {{ item.title }}
                      </v-chip>
                    </template>
                  </v-select>
                </v-col>

                <!-- Source Filters -->
                <v-col cols="12" sm="6" md="3">
                  <v-select
                    v-model="selectedSources"
                    :items="sourceOptions"
                    :label="$t('logs.sources')"
                    multiple
                    chips
                    density="compact"
                    variant="outlined"
                    hide-details
                    clearable
                  ></v-select>
                </v-col>

                <!-- Search -->
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="searchQuery"
                    :label="$t('logs.admin.search')"
                    prepend-inner-icon="mdi-magnify"
                    density="compact"
                    variant="outlined"
                    hide-details
                    clearable
                  ></v-text-field>
                </v-col>

                <!-- Actions -->
                <v-col cols="12" sm="6" md="2">
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        color="primary"
                        variant="outlined"
                        block
                        prepend-icon="mdi-download"
                      >
                        {{ $t('logs.export') }}
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="exportJSON">
                        <v-list-item-title>
                          <v-icon start>mdi-code-json</v-icon>
                          Export JSON
                        </v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="exportTXT">
                        <v-list-item-title>
                          <v-icon start>mdi-text</v-icon>
                          Export TXT
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-col>
              </v-row>

              <!-- Reset Filters Button -->
              <v-row class="mt-2">
                <v-col cols="12">
                  <v-btn
                    variant="text"
                    size="small"
                    prepend-icon="mdi-filter-off"
                    @click="resetFilters"
                  >
                    {{ $t('logs.resetFilters') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>

    <!-- Actions Row -->
    <v-row>
      <v-col cols="12">
        <v-btn
          color="error"
          variant="outlined"
          prepend-icon="mdi-delete-forever"
          @click="confirmClearDialog = true"
        >
          {{ $t('logs.deleteAllLogs') }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- Logs Table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <span>{{ $t('logs.admin.logEntries') }}</span>
            <v-spacer></v-spacer>
            <v-chip size="small">{{ filteredLogs.length }} {{ $t('logs.admin.entries') }}</v-chip>
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="filteredLogs"
            :items-per-page="25"
            :items-per-page-options="[10, 25, 50, 100]"
            density="comfortable"
            class="elevation-0"
          >
            <!-- Timestamp Column -->
            <template v-slot:item.timestamp="{ item }">
              <span class="text-caption">{{ formatTimestamp(item.timestamp) }}</span>
            </template>

            <!-- Level Column -->
            <template v-slot:item.level="{ item }">
              <v-chip :color="getLevelColor(item.level)" size="small" variant="flat">
                <v-icon start :icon="getLevelIcon(item.level)" size="16"></v-icon>
                {{ item.level.toUpperCase() }}
              </v-chip>
            </template>

            <!-- Source Column -->
            <template v-slot:item.source="{ item }">
              <v-chip size="small" variant="outlined">{{ item.source }}</v-chip>
            </template>

            <!-- Message Column -->
            <template v-slot:item.message="{ item }">
              <div class="text-truncate" style="max-width: 400px;">{{ item.message }}</div>
            </template>

            <!-- Actions Column -->
            <template v-slot:item.actions="{ item }">
              <v-btn
                v-if="item.meta && Object.keys(item.meta).length > 0"
                icon
                size="small"
                variant="text"
                @click="showLogDetails(item)"
              >
                <v-icon>mdi-eye</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Clear Confirmation Dialog -->
    <v-dialog v-model="confirmClearDialog" max-width="400">
      <v-card>
        <v-card-title>{{ $t('logs.confirmClearTitle') }}</v-card-title>
        <v-card-text>{{ $t('logs.confirmClearMessage') }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="confirmClearDialog = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn color="error" @click="clearAllLogs">{{ $t('common.confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Log Details Dialog -->
    <LogDetailsDialog
      v-model="detailsDialog"
      :log="selectedLog"
    />

    <!-- Storage Warning Snackbar -->
    <v-snackbar
      v-model="storageWarning"
      color="warning"
      timeout="5000"
    >
      {{ $t('logs.storageWarning') }}: {{ formatBytes(stats.storageSize) }}
      <template v-slot:actions>
        <v-btn variant="text" @click="storageWarning = false">
          {{ $t('common.close') }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { logService, type LogEntry, type LogLevel } from '@/services/log.service';
import { logStorage } from '@/services/log-storage.service';
import LogDetailsDialog from '@/components/LogDetailsDialog.vue';

// State
const stats = ref({
  totalLogs: 0,
  storageSize: 0,
  errorCount: 0,
  debugCount: 0,
  infoCount: 0,
  verboseCount: 0,
  uniqueSources: 0,
  oldestLog: null as Date | null,
  newestLog: null as Date | null,
});

const logs = ref<LogEntry[]>([]);
const selectedLevels = ref<LogLevel[]>(['error', 'debug', 'info']); // Display filters
const enabledLogLevels = ref<LogLevel[]>(['error']); // Recording configuration
const selectedSources = ref<string[]>([]);
const searchQuery = ref('');
const confirmClearDialog = ref(false);
const detailsDialog = ref(false);
const selectedLog = ref<LogEntry | null>(null);
const storageWarning = ref(false);

// Table headers
const headers = [
  { title: 'Timestamp', key: 'timestamp', width: '180px' },
  { title: 'Level', key: 'level', width: '120px' },
  { title: 'Source', key: 'source', width: '150px' },
  { title: 'Message', key: 'message' },
  { title: 'Actions', key: 'actions', sortable: false, width: '80px' },
];

// Computed
const sourceOptions = computed(() => {
  const sources = new Set<string>();
  logs.value.forEach((log) => sources.add(log.source));
  return Array.from(sources).sort();
});

const levelOptions = [
  { title: 'ERROR', value: 'error' },
  { title: 'DEBUG', value: 'debug' },
  { title: 'INFO', value: 'info' },
  { title: 'VERBOSE', value: 'verbose' },
];

const filteredLogs = computed(() => {
  return logs.value.filter((log) => {
    // Level filter
    if (!selectedLevels.value.includes(log.level)) return false;

    // Source filter
    if (selectedSources.value.length > 0 && !selectedSources.value.includes(log.source)) {
      return false;
    }

    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      return (
        log.message.toLowerCase().includes(query) ||
        log.source.toLowerCase().includes(query)
      );
    }

    return true;
  });
});

// Methods
async function loadEnabledLevels() {
  await logService.loadEnabledLevels();
  enabledLogLevels.value = logService.getEnabledLevels();
}

async function updateEnabledLevels(levels: LogLevel[]) {
  await logService.setEnabledLevels(levels);
  logService.info('Log recording levels updated', 'LogsAdminView', { levels });
}

async function loadStats() {
  const allLogs = await logStorage.getLogs();
  logs.value = allLogs.sort((a: LogEntry, b: LogEntry) => b.timestamp.getTime() - a.timestamp.getTime());

  const sources = new Set<string>();
  let errorCount = 0;
  let debugCount = 0;
  let infoCount = 0;
  let verboseCount = 0;

  allLogs.forEach((log: LogEntry) => {
    sources.add(log.source);
    if (log.level === 'error') errorCount++;
    else if (log.level === 'debug') debugCount++;
    else if (log.level === 'info') infoCount++;
    else if (log.level === 'verbose') verboseCount++;
  });

  const storageStats = await logStorage.getStats();

  stats.value = {
    totalLogs: allLogs.length,
    storageSize: storageStats.estimatedSize,
    errorCount,
    debugCount,
    infoCount,
    verboseCount,
    uniqueSources: sources.size,
    oldestLog: storageStats.oldestLog || null,
    newestLog: storageStats.newestLog || null,
  };

  // Show warning if storage is getting full
  if (storageStats.estimatedSize > 9 * 1024 * 1024) {
    storageWarning.value = true;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(date: Date | null): string {
  if (!date) return 'N/A';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatTimestamp(timestamp: Date): string {
  const hours = timestamp.getHours().toString().padStart(2, '0');
  const minutes = timestamp.getMinutes().toString().padStart(2, '0');
  const seconds = timestamp.getSeconds().toString().padStart(2, '0');
  const milliseconds = timestamp.getMilliseconds().toString().padStart(3, '0');

  const time = `${hours}:${minutes}:${seconds}.${milliseconds}`;

  const date = timestamp.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
  });
  return `${time} - ${date}`;
}

function getLevelColor(level: LogLevel): string {
  switch (level) {
    case 'error':
      return 'error';
    case 'debug':
      return 'info';
    case 'info':
      return 'success';
    case 'verbose':
      return 'grey';
    default:
      return 'grey';
  }
}

function getLevelIcon(level: LogLevel): string {
  switch (level) {
    case 'error':
      return 'mdi-alert-circle';
    case 'debug':
      return 'mdi-bug';
    case 'info':
      return 'mdi-information';
    case 'verbose':
      return 'mdi-text';
    default:
      return 'mdi-circle';
  }
}

function showLogDetails(log: LogEntry) {
  selectedLog.value = log;
  detailsDialog.value = true;
}

async function exportJSON() {
  await logService.exportJSON({
    levels: selectedLevels.value,
    sources: selectedSources.value.length > 0 ? selectedSources.value : undefined,
  });
}

async function exportTXT() {
  await logService.exportTXT({
    levels: selectedLevels.value,
    sources: selectedSources.value.length > 0 ? selectedSources.value : undefined,
  });
}

async function clearAllLogs() {
  await logService.clearLogs();
  confirmClearDialog.value = false;
  await loadStats();
}

function resetFilters() {
  selectedLevels.value = ['error', 'debug', 'info'];
  selectedSources.value = [];
  searchQuery.value = '';
}

// Lifecycle
onMounted(async () => {
  await loadEnabledLevels();
  await loadStats();

  // Listen for new logs
  logService.onLogAdded(async () => {
    await loadStats();
  });

  // Listen for storage warnings
  logService.onStorageWarning((size) => {
    stats.value.storageSize = size;
    storageWarning.value = true;
  });
});
</script>

<style scoped>
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
