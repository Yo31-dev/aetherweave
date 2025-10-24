/**
 * Data Reset Service
 * Provides functionality to clear all application data
 */

import { logService } from './log.service';

class DataResetService {
  /**
   * Clear all IndexedDB databases
   */
  async clearIndexedDB(): Promise<void> {
    try {
      // Known database names in our application
      const knownDatabases = ['AetherWeaveLogs', 'AetherWeaveSettings'];

      // Try to get all database names (not supported in Safari < 14)
      let databases: IDBDatabaseInfo[] = [];

      if (window.indexedDB.databases) {
        try {
          databases = await window.indexedDB.databases();
        } catch (e) {
          logService.debugVerbose('indexedDB.databases() not supported, using known database names', 'DataResetService');
        }
      }

      // Combine known databases with detected ones
      const dbNames = new Set([
        ...knownDatabases,
        ...databases.map(db => db.name).filter(Boolean) as string[]
      ]);

      // Delete each database
      const deletePromises = Array.from(dbNames).map(dbName => {
        return new Promise<void>((resolve) => {
          const request = window.indexedDB.deleteDatabase(dbName);
          request.onsuccess = () => {
            logService.debugVerbose(`Database ${dbName} deleted`, 'DataResetService');
            resolve();
          };
          request.onerror = () => {
            logService.error(`Failed to delete ${dbName}`, 'DataResetService');
            resolve(); // Don't fail the whole operation
          };
          request.onblocked = () => {
            logService.debugVerbose(`Deletion of ${dbName} is blocked`, 'DataResetService');
            resolve(); // Don't fail the whole operation
          };
        });
      });

      await Promise.all(deletePromises);
      logService.debug('All IndexedDB databases cleared', 'DataResetService');
    } catch (error) {
      logService.error('Failed to clear IndexedDB', 'DataResetService', error);
      throw error;
    }
  }

  /**
   * Clear localStorage
   */
  clearLocalStorage(): void {
    try {
      localStorage.clear();
      logService.debug('localStorage cleared', 'DataResetService');
    } catch (error) {
      logService.error('Failed to clear localStorage', 'DataResetService', error);
      throw error;
    }
  }

  /**
   * Clear sessionStorage
   */
  clearSessionStorage(): void {
    try {
      sessionStorage.clear();
      logService.debug('sessionStorage cleared', 'DataResetService');
    } catch (error) {
      logService.error('Failed to clear sessionStorage', 'DataResetService', error);
      throw error;
    }
  }

  /**
   * Clear all cookies
   */
  clearCookies(): void {
    try {
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0]?.trim();
        if (name) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
      logService.debug('Cookies cleared', 'DataResetService');
    } catch (error) {
      logService.error('Failed to clear cookies', 'DataResetService', error);
      throw error;
    }
  }

  /**
   * Clear all application data
   * Includes: IndexedDB, localStorage, sessionStorage, cookies
   */
  async clearAll(): Promise<void> {
    try {
      // Clear all storage types
      await this.clearIndexedDB();
      this.clearLocalStorage();
      this.clearSessionStorage();
      this.clearCookies();

      logService.info('All application data cleared successfully', 'DataResetService');
    } catch (error) {
      logService.error('Failed to clear all data', 'DataResetService', error);
      throw error;
    }
  }

  /**
   * Get statistics about stored data
   */
  async getStorageStats(): Promise<{
    indexedDB: { databases: string[]; count: number };
    localStorage: { keys: string[]; count: number; sizeBytes: number };
    sessionStorage: { keys: string[]; count: number; sizeBytes: number };
    cookies: { count: number };
  }> {
    try {
      // IndexedDB stats
      const knownDatabases = ['AetherWeaveLogs', 'AetherWeaveSettings'];
      let dbNames = [...knownDatabases];

      // Try to get all database names (fallback to known databases)
      if (window.indexedDB.databases) {
        try {
          const databases = await window.indexedDB.databases();
          dbNames = databases.map(db => db.name || 'unknown');
        } catch (e) {
          logService.debugVerbose('indexedDB.databases() not supported, using known database names', 'DataResetService');
        }
      }

      // localStorage stats
      const localStorageKeys = Object.keys(localStorage);
      const localStorageSize = new Blob(
        localStorageKeys.map(key => localStorage.getItem(key) || '')
      ).size;

      // sessionStorage stats
      const sessionStorageKeys = Object.keys(sessionStorage);
      const sessionStorageSize = new Blob(
        sessionStorageKeys.map(key => sessionStorage.getItem(key) || '')
      ).size;

      // Cookies stats
      const cookiesCount = document.cookie.split(';').filter(c => c.trim()).length;

      return {
        indexedDB: {
          databases: dbNames,
          count: dbNames.length,
        },
        localStorage: {
          keys: localStorageKeys,
          count: localStorageKeys.length,
          sizeBytes: localStorageSize,
        },
        sessionStorage: {
          keys: sessionStorageKeys,
          count: sessionStorageKeys.length,
          sizeBytes: sessionStorageSize,
        },
        cookies: {
          count: cookiesCount,
        },
      };
    } catch (error) {
      logService.error('Failed to get storage stats', 'DataResetService', error);
      return {
        indexedDB: { databases: [], count: 0 },
        localStorage: { keys: [], count: 0, sizeBytes: 0 },
        sessionStorage: { keys: [], count: 0, sizeBytes: 0 },
        cookies: { count: 0 },
      };
    }
  }

  /**
   * Format bytes to human-readable string
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export const dataResetService = new DataResetService();
