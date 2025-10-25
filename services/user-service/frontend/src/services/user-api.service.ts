/**
 * User API Service
 *
 * CRUD operations for users via APISIX Gateway
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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: Role[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  roleIds?: string[];
  isActive?: boolean;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  roleIds?: string[];
  isActive?: boolean;
}

/**
 * User API Service
 * Provides CRUD operations for users
 *
 * Must be initialized with setClient() before use
 */
class UserApiService {
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
   * Get all users
   */
  async getUsers(): Promise<User[]> {
    try {
      return await this.api.get<User[]>('/users');
    } catch (error) {
      this.eventBus.emitLog('Failed to fetch users', 'error', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUser(id: string): Promise<User> {
    try {
      return await this.api.get<User>(`/users/${id}`);
    } catch (error) {
      this.eventBus.emitLog(`Failed to fetch user ${id}`, 'error', error);
      throw error;
    }
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserData): Promise<User> {
    try {
      return await this.api.post<User>('/users', data);
    } catch (error) {
      this.eventBus.emitLog('Failed to create user', 'error', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    try {
      return await this.api.put<User>(`/users/${id}`, data);
    } catch (error) {
      this.eventBus.emitLog(`Failed to update user ${id}`, 'error', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await this.api.delete(`/users/${id}`);
    } catch (error) {
      this.eventBus.emitLog(`Failed to delete user ${id}`, 'error', error);
      throw error;
    }
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
}

// Export singleton instance
export const userApi = new UserApiService();
