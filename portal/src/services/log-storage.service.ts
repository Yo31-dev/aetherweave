/**
 * Log Storage Service
 *
 * IndexedDB wrapper using Dexie for persisting logs
 * Handles storage limits and auto-pruning
 */

import Dexie, { type Table } from 'dexie';

export interface Log {
  id?: string;
  timestamp: Date;
  level: 'error' | 'debug' | 'info';
  message: string;
  source: string;
  meta?: any;
}

export interface StorageStats {
  totalLogs: number;
  estimatedSize: number;
  oldestLog?: Date;
  newestLog?: Date;
  levelCounts: Record<string, number>;
  sourceCounts: Record<string, number>;
}

class LogDatabase extends Dexie {
  logs!: Table<Log, string>;

  constructor() {
    super('aetherweave-logs');

    this.version(1).stores({
      logs: 'id, timestamp, level, source',
    });
  }
}

class LogStorageService {
  private db: LogDatabase;
  private readonly MAX_SIZE_BYTES = 9 * 1024 * 1024; // 9MB
  private readonly MAX_LOGS = 5000; // Max logs to keep

  constructor() {
    this.db = new LogDatabase();
  }

  /**
   * Add a log entry to IndexedDB
   */
  async addLog(log: Omit<Log, 'id'>): Promise<string> {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const logWithId: Log = { ...log, id };

    await this.db.logs.add(logWithId);

    // Check storage size and prune if needed
    await this.checkAndPrune();

    return id;
  }

  /**
   * Get all logs with optional filters
   */
  async getLogs(filters?: {
    levels?: Array<'error' | 'debug' | 'info'>;
    sources?: string[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<Log[]> {
    let collection = this.db.logs.orderBy('timestamp').reverse();

    if (filters) {
      if (filters.levels && filters.levels.length > 0) {
        collection = collection.filter((log) => filters.levels!.includes(log.level));
      }

      if (filters.sources && filters.sources.length > 0) {
        collection = collection.filter((log) => filters.sources!.includes(log.source));
      }

      if (filters.startDate) {
        collection = collection.filter((log) => log.timestamp >= filters.startDate!);
      }

      if (filters.endDate) {
        collection = collection.filter((log) => log.timestamp <= filters.endDate!);
      }
    }

    return collection.toArray();
  }

  /**
   * Get logs count
   */
  async getCount(): Promise<number> {
    return this.db.logs.count();
  }

  /**
   * Clear all logs
   */
  async clearLogs(): Promise<void> {
    await this.db.logs.clear();
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<StorageStats> {
    const logs = await this.db.logs.toArray();

    const levelCounts: Record<string, number> = {
      error: 0,
      debug: 0,
      info: 0,
    };

    const sourceCounts: Record<string, number> = {};

    let oldestLog: Date | undefined;
    let newestLog: Date | undefined;

    logs.forEach((log) => {
      levelCounts[log.level] = (levelCounts[log.level] || 0) + 1;
      sourceCounts[log.source] = (sourceCounts[log.source] || 0) + 1;

      if (!oldestLog || log.timestamp < oldestLog) {
        oldestLog = log.timestamp;
      }

      if (!newestLog || log.timestamp > newestLog) {
        newestLog = log.timestamp;
      }
    });

    const estimatedSize = await this.estimateStorageSize();

    return {
      totalLogs: logs.length,
      estimatedSize,
      oldestLog,
      newestLog,
      levelCounts,
      sourceCounts,
    };
  }

  /**
   * Estimate storage size in bytes
   */
  private async estimateStorageSize(): Promise<number> {
    const logs = await this.db.logs.toArray();
    const jsonString = JSON.stringify(logs);
    return new Blob([jsonString]).size;
  }

  /**
   * Check storage size and prune old logs if needed
   */
  private async checkAndPrune(): Promise<{ pruned: boolean; reason?: string }> {
    const count = await this.db.logs.count();
    const size = await this.estimateStorageSize();

    // Prune if exceeds size limit
    if (size > this.MAX_SIZE_BYTES) {
      await this.pruneOldLogs();
      return { pruned: true, reason: 'size_exceeded' };
    }

    // Prune if exceeds count limit
    if (count > this.MAX_LOGS) {
      await this.pruneOldLogs();
      return { pruned: true, reason: 'count_exceeded' };
    }

    return { pruned: false };
  }

  /**
   * Remove oldest logs to stay within limits
   */
  private async pruneOldLogs(): Promise<number> {
    const count = await this.db.logs.count();
    const logsToRemove = Math.max(0, count - this.MAX_LOGS + 500); // Keep some buffer

    if (logsToRemove <= 0) {
      return 0;
    }

    // Get oldest logs
    const oldestLogs = await this.db.logs
      .orderBy('timestamp')
      .limit(logsToRemove)
      .toArray();

    // Delete them
    const idsToDelete = oldestLogs.map((log) => log.id!);
    await this.db.logs.bulkDelete(idsToDelete);

    console.log(`[LogStorage] Pruned ${logsToRemove} old logs`);
    return logsToRemove;
  }

  /**
   * Check if storage is near limit (for warnings)
   */
  async isNearLimit(): Promise<boolean> {
    const size = await this.estimateStorageSize();
    return size > this.MAX_SIZE_BYTES * 0.9; // 90% of max
  }

  /**
   * Get unique sources
   */
  async getSources(): Promise<string[]> {
    const logs = await this.db.logs.toArray();
    const sources = new Set(logs.map((log) => log.source));
    return Array.from(sources).sort();
  }

  /**
   * Export logs as JSON
   */
  async exportAsJSON(filters?: Parameters<typeof this.getLogs>[0]): Promise<string> {
    const logs = await this.getLogs(filters);
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Export logs as TXT
   */
  async exportAsTXT(filters?: Parameters<typeof this.getLogs>[0]): Promise<string> {
    const logs = await this.getLogs(filters);

    return logs
      .map((log) => {
        const time = log.timestamp.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        const date = log.timestamp.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
        });
        const level = log.level.toUpperCase().padEnd(5);
        const source = log.source.padEnd(20);
        const meta = log.meta ? ` | ${JSON.stringify(log.meta)}` : '';

        return `[${time} - ${date}] [${level}] [${source}] ${log.message}${meta}`;
      })
      .join('\n');
  }
}

// Export singleton instance
export const logStorage = new LogStorageService();
