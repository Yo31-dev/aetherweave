/**
 * Log Service
 *
 * Centralized logging service for the portal
 * Logs are persisted in IndexedDB and can be viewed in the log panel
 *
 * Usage:
 *   logService.info('User logged in', 'Auth');
 *   logService.debug('Token refreshed', 'Auth', { tokenExp: 123456 });
 *   logService.error('API call failed', 'UserManagement', { error: err });
 */

import { logStorage, type Log } from './log-storage.service';
import EventEmitter from 'eventemitter3';

export type LogLevel = 'error' | 'debug' | 'info';

export interface LogEntry extends Log {}

export interface LogFilters {
  levels?: LogLevel[];
  sources?: string[];
  startDate?: Date;
  endDate?: Date;
}

interface LogEventMap {
  'log:added': (log: LogEntry) => void;
  'log:cleared': () => void;
  'storage:warning': (size: number) => void;
}

class LogService {
  private emitter: EventEmitter<LogEventMap>;
  private storageWarningShown = false;

  constructor() {
    this.emitter = new EventEmitter<LogEventMap>();
  }

  // ============================================================================
  // LOGGING METHODS
  // ============================================================================

  /**
   * Log an error message
   * Also logs to console.error for debugging
   */
  error(message: string, source: string, meta?: any): void {
    console.error(`[${source}] ${message}`, meta);
    this.log('error', message, source, meta);
  }

  /**
   * Log a debug message (technical)
   */
  debug(message: string, source: string, meta?: any): void {
    this.log('debug', message, source, meta);
  }

  /**
   * Log an info message (functional: user actions, business events)
   */
  info(message: string, source: string, meta?: any): void {
    this.log('info', message, source, meta);
  }

  /**
   * Internal log method
   */
  private async log(level: LogLevel, message: string, source: string, meta?: any): Promise<void> {
    const logEntry: Omit<LogEntry, 'id'> = {
      timestamp: new Date(),
      level,
      message,
      source,
      meta,
    };

    try {
      // Save to IndexedDB
      const id = await logStorage.addLog(logEntry);

      // Emit event for live updates
      this.emitter.emit('log:added', { ...logEntry, id });

      // Check storage size
      await this.checkStorageWarning();
    } catch (error) {
      console.error('[LogService] Failed to save log:', error);
    }
  }

  // ============================================================================
  // QUERY METHODS
  // ============================================================================

  /**
   * Get all logs with optional filters
   */
  async getLogs(filters?: LogFilters): Promise<LogEntry[]> {
    return logStorage.getLogs(filters);
  }

  /**
   * Get logs count
   */
  async getCount(): Promise<number> {
    return logStorage.getCount();
  }

  /**
   * Get storage statistics
   */
  async getStats() {
    return logStorage.getStats();
  }

  /**
   * Get unique sources
   */
  async getSources(): Promise<string[]> {
    return logStorage.getSources();
  }

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Clear all logs
   */
  async clearLogs(): Promise<void> {
    await logStorage.clearLogs();
    this.emitter.emit('log:cleared');
    this.storageWarningShown = false;
    this.info('All logs cleared', 'LogService');
  }

  /**
   * Export logs as JSON
   */
  async exportJSON(filters?: LogFilters): Promise<void> {
    const json = await logStorage.exportAsJSON(filters);
    this.downloadFile(json, 'logs.json', 'application/json');
    this.info('Logs exported as JSON', 'LogService');
  }

  /**
   * Export logs as TXT
   */
  async exportTXT(filters?: LogFilters): Promise<void> {
    const txt = await logStorage.exportAsTXT(filters);
    this.downloadFile(txt, 'logs.txt', 'text/plain');
    this.info('Logs exported as TXT', 'LogService');
  }

  /**
   * Helper: Download file
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // ============================================================================
  // STORAGE MANAGEMENT
  // ============================================================================

  /**
   * Check if storage is near limit and emit warning
   */
  private async checkStorageWarning(): Promise<void> {
    if (this.storageWarningShown) {
      return;
    }

    const isNearLimit = await logStorage.isNearLimit();

    if (isNearLimit) {
      const stats = await logStorage.getStats();
      this.emitter.emit('storage:warning', stats.estimatedSize);
      this.storageWarningShown = true;
    }
  }

  /**
   * Reset storage warning flag (call after clearing logs)
   */
  resetStorageWarning(): void {
    this.storageWarningShown = false;
  }

  // ============================================================================
  // EVENT LISTENERS
  // ============================================================================

  /**
   * Listen for new log entries
   */
  onLogAdded(callback: (log: LogEntry) => void): () => void {
    this.emitter.on('log:added', callback);
    return () => this.emitter.off('log:added', callback);
  }

  /**
   * Listen for logs cleared event
   */
  onLogsCleared(callback: () => void): () => void {
    this.emitter.on('log:cleared', callback);
    return () => this.emitter.off('log:cleared', callback);
  }

  /**
   * Listen for storage warning
   */
  onStorageWarning(callback: (size: number) => void): () => void {
    this.emitter.on('storage:warning', callback);
    return () => this.emitter.off('storage:warning', callback);
  }
}

// Export singleton instance
export const logService = new LogService();
