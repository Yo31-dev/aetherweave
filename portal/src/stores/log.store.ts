import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { logService, type LogEntry, type LogLevel } from '@/services/log.service';

export const useLogStore = defineStore('log', () => {
  // ============================================================================
  // STATE
  // ============================================================================

  const drawerOpen = ref(false);
  const logs = ref<LogEntry[]>([]);
  const loading = ref(false);

  // Filters
  const levelFilters = ref<Set<LogLevel>>(new Set(['error', 'debug', 'info']));
  const sourceFilters = ref<Set<string>>(new Set());
  const availableSources = ref<string[]>([]);

  // Storage warning
  const storageWarningVisible = ref(false);
  const storageSize = ref(0);

  // ============================================================================
  // GETTERS
  // ============================================================================

  const filteredLogs = computed(() => {
    return logs.value.filter((log) => {
      // Filter by level
      if (!levelFilters.value.has(log.level)) {
        return false;
      }

      // Filter by source (if any sources selected)
      if (sourceFilters.value.size > 0 && !sourceFilters.value.has(log.source)) {
        return false;
      }

      return true;
    });
  });

  const logCount = computed(() => filteredLogs.value.length);

  const levelCounts = computed(() => {
    const counts = {
      error: 0,
      debug: 0,
      info: 0,
    };

    filteredLogs.value.forEach((log) => {
      counts[log.level]++;
    });

    return counts;
  });

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Load logs from IndexedDB
   */
  async function loadLogs() {
    try {
      loading.value = true;
      logs.value = await logService.getLogs();
      await loadSources();
    } catch (error) {
      console.error('[LogStore] Failed to load logs:', error);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Load available sources
   */
  async function loadSources() {
    availableSources.value = await logService.getSources();
  }

  /**
   * Toggle drawer visibility
   */
  function toggleDrawer() {
    drawerOpen.value = !drawerOpen.value;

    if (drawerOpen.value) {
      loadLogs();
    }
  }

  /**
   * Open drawer
   */
  function openDrawer() {
    drawerOpen.value = true;
    loadLogs();
  }

  /**
   * Close drawer
   */
  function closeDrawer() {
    drawerOpen.value = false;
  }

  /**
   * Toggle level filter
   */
  function toggleLevelFilter(level: LogLevel) {
    if (levelFilters.value.has(level)) {
      levelFilters.value.delete(level);
    } else {
      levelFilters.value.add(level);
    }

    // Trigger reactivity
    levelFilters.value = new Set(levelFilters.value);
  }

  /**
   * Toggle source filter
   */
  function toggleSourceFilter(source: string) {
    if (sourceFilters.value.has(source)) {
      sourceFilters.value.delete(source);
    } else {
      sourceFilters.value.add(source);
    }

    // Trigger reactivity
    sourceFilters.value = new Set(sourceFilters.value);
  }

  /**
   * Clear source filters
   */
  function clearSourceFilters() {
    sourceFilters.value.clear();
    sourceFilters.value = new Set();
  }

  /**
   * Reset all filters
   */
  function resetFilters() {
    levelFilters.value = new Set(['error', 'debug', 'info']);
    clearSourceFilters();
  }

  /**
   * Clear all logs
   */
  async function clearLogs() {
    try {
      await logService.clearLogs();
      logs.value = [];
      storageWarningVisible.value = false;
      logService.resetStorageWarning();
    } catch (error) {
      console.error('[LogStore] Failed to clear logs:', error);
    }
  }

  /**
   * Export logs as JSON
   */
  async function exportJSON() {
    try {
      await logService.exportJSON({
        levels: Array.from(levelFilters.value),
        sources: sourceFilters.value.size > 0 ? Array.from(sourceFilters.value) : undefined,
      });
    } catch (error) {
      console.error('[LogStore] Failed to export JSON:', error);
    }
  }

  /**
   * Export logs as TXT
   */
  async function exportTXT() {
    try {
      await logService.exportTXT({
        levels: Array.from(levelFilters.value),
        sources: sourceFilters.value.size > 0 ? Array.from(sourceFilters.value) : undefined,
      });
    } catch (error) {
      console.error('[LogStore] Failed to export TXT:', error);
    }
  }

  /**
   * Show storage warning
   */
  function showStorageWarning(size: number) {
    storageSize.value = size;
    storageWarningVisible.value = true;
  }

  /**
   * Dismiss storage warning
   */
  function dismissStorageWarning() {
    storageWarningVisible.value = false;
  }

  /**
   * Initialize log listeners
   */
  function initializeListeners() {
    // Listen for new logs
    logService.onLogAdded((log) => {
      logs.value.unshift(log); // Add to beginning (newest first)

      // Update sources if new source
      if (!availableSources.value.includes(log.source)) {
        availableSources.value.push(log.source);
        availableSources.value.sort();
      }
    });

    // Listen for logs cleared
    logService.onLogsCleared(() => {
      logs.value = [];
      availableSources.value = [];
    });

    // Listen for storage warning
    logService.onStorageWarning((size) => {
      showStorageWarning(size);
    });
  }

  return {
    // State
    drawerOpen,
    logs,
    loading,
    levelFilters,
    sourceFilters,
    availableSources,
    storageWarningVisible,
    storageSize,

    // Getters
    filteredLogs,
    logCount,
    levelCounts,

    // Actions
    loadLogs,
    loadSources,
    toggleDrawer,
    openDrawer,
    closeDrawer,
    toggleLevelFilter,
    toggleSourceFilter,
    clearSourceFilters,
    resetFilters,
    clearLogs,
    exportJSON,
    exportTXT,
    showStorageWarning,
    dismissStorageWarning,
    initializeListeners,
  };
});
