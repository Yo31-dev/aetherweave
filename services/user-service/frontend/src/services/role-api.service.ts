/**
 * Role API Service
 *
 * CRUD operations for roles via APISIX Gateway
 * Uses ApiClient from @aetherweave/wc-core
 */

import { ApiClient, EventBusClient } from '@aetherweave/wc-core';

export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleData {
  name: string;
  description?: string;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
}

/**
 * Role API Service
 * Provides CRUD operations for roles
 *
 * Must be initialized with setClient() before use
 */
class RoleApiService {
  private api!: ApiClient;
  private eventBus!: EventBusClient;

  /**
   * Initialize the service with ApiClient and EventBusClient
   * Call this once in the WC's connectedCallback
   */
  setClient(api: ApiClient, eventBus: EventBusClient): void {
    this.api = api;
    this.eventBus = eventBus;
  }

  /**
   * Get all roles
   */
  async getRoles(): Promise<Role[]> {
    try {
      return await this.api.get<Role[]>('/roles');
    } catch (error) {
      this.eventBus.emitLog('Failed to fetch roles', 'error', error);
      throw error;
    }
  }

  /**
   * Get role by ID
   */
  async getRole(id: string): Promise<Role> {
    try {
      return await this.api.get<Role>(`/roles/${id}`);
    } catch (error) {
      this.eventBus.emitLog(`Failed to fetch role ${id}`, 'error', error);
      throw error;
    }
  }

  /**
   * Create new role
   */
  async createRole(data: CreateRoleData): Promise<Role> {
    try {
      return await this.api.post<Role>('/roles', data);
    } catch (error) {
      this.eventBus.emitLog('Failed to create role', 'error', error);
      throw error;
    }
  }

  /**
   * Update role
   */
  async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
    try {
      return await this.api.put<Role>(`/roles/${id}`, data);
    } catch (error) {
      this.eventBus.emitLog(`Failed to update role ${id}`, 'error', error);
      throw error;
    }
  }

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<void> {
    try {
      await this.api.delete(`/roles/${id}`);
    } catch (error) {
      this.eventBus.emitLog(`Failed to delete role ${id}`, 'error', error);
      throw error;
    }
  }
}

// Export singleton instance
export const roleApi = new RoleApiService();
