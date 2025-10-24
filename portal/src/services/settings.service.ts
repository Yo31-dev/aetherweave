import Dexie, { type Table } from 'dexie';

/**
 * Settings stored in IndexedDB
 */
export interface AppSettings {
  id?: number;
  key: string;
  value: any;
  updatedAt: Date;
}

/**
 * Database for application settings
 */
class SettingsDatabase extends Dexie {
  settings!: Table<AppSettings, number>;

  constructor() {
    super('AetherWeaveSettings');

    this.version(1).stores({
      settings: '++id, key, updatedAt',
    });
  }
}

const db = new SettingsDatabase();

/**
 * Settings Service
 * Manages application settings with IndexedDB storage
 */
class SettingsService {
  /**
   * Get a setting value by key
   */
  async get<T = any>(key: string, defaultValue?: T): Promise<T | undefined> {
    try {
      const setting = await db.settings.where('key').equals(key).first();
      return setting ? setting.value : defaultValue;
    } catch (error) {
      console.error(`Failed to get setting ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Set a setting value
   */
  async set(key: string, value: any): Promise<void> {
    try {
      const existing = await db.settings.where('key').equals(key).first();

      if (existing) {
        await db.settings.update(existing.id!, {
          value,
          updatedAt: new Date(),
        });
      } else {
        await db.settings.add({
          key,
          value,
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error(`Failed to set setting ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a specific setting
   */
  async delete(key: string): Promise<void> {
    try {
      const setting = await db.settings.where('key').equals(key).first();
      if (setting?.id) {
        await db.settings.delete(setting.id);
      }
    } catch (error) {
      console.error(`Failed to delete setting ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get all settings
   */
  async getAll(): Promise<AppSettings[]> {
    try {
      return await db.settings.toArray();
    } catch (error) {
      console.error('Failed to get all settings:', error);
      return [];
    }
  }

  /**
   * Clear all settings from IndexedDB
   */
  async clearAll(): Promise<void> {
    try {
      await db.settings.clear();
    } catch (error) {
      console.error('Failed to clear settings:', error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{ count: number; keys: string[] }> {
    try {
      const settings = await db.settings.toArray();
      return {
        count: settings.length,
        keys: settings.map(s => s.key),
      };
    } catch (error) {
      console.error('Failed to get settings stats:', error);
      return { count: 0, keys: [] };
    }
  }

  /**
   * Export all settings as JSON
   */
  async export(): Promise<Record<string, any>> {
    try {
      const settings = await db.settings.toArray();
      const exported: Record<string, any> = {};
      settings.forEach(setting => {
        exported[setting.key] = setting.value;
      });
      return exported;
    } catch (error) {
      console.error('Failed to export settings:', error);
      return {};
    }
  }

  /**
   * Import settings from JSON
   */
  async import(data: Record<string, any>): Promise<void> {
    try {
      const promises = Object.entries(data).map(([key, value]) =>
        this.set(key, value)
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw error;
    }
  }
}

export const settingsService = new SettingsService();

/**
 * Common setting keys
 */
export const SettingKeys = {
  LOCALE: 'locale',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  NOTIFICATIONS_ENABLED: 'notificationsEnabled',
} as const;
