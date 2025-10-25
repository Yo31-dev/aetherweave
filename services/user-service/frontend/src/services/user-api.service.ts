/**
 * User API Service
 *
 * CRUD operations for users via APISIX Gateway
 * Uses ApiClient from @aetherweave/wc-core
 */

import { ApiClient, EventBusClient } from '@aetherweave/wc-core';

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  roles?: string[];
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  roles?: string[];
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
      this.eventBus.emitError(error instanceof Error ? error.message : 'Failed to fetch users');
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User> {
    try {
      return await this.api.get<User>(`/users/${id}`);
    } catch (error) {
      this.eventBus.emitLog('Failed to fetch user', 'error', error);
      this.eventBus.emitError(error instanceof Error ? error.message : 'Failed to fetch user');
      throw error;
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      const user = await this.api.post<User>('/users', userData);
      this.eventBus.emitNotification('User created successfully', 'success');
      return user;
    } catch (error) {
      this.eventBus.emitLog('Failed to create user', 'error', error);
      this.eventBus.emitError(error instanceof Error ? error.message : 'Failed to create user');
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(id: number, userData: UpdateUserDto): Promise<User> {
    try {
      const user = await this.api.put<User>(`/users/${id}`, userData);
      this.eventBus.emitNotification('User updated successfully', 'success');
      return user;
    } catch (error) {
      this.eventBus.emitLog('Failed to update user', 'error', error);
      this.eventBus.emitError(error instanceof Error ? error.message : 'Failed to update user');
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<void> {
    try {
      await this.api.delete<void>(`/users/${id}`);
      this.eventBus.emitNotification('User deleted successfully', 'success');
    } catch (error) {
      this.eventBus.emitLog('Failed to delete user', 'error', error);
      this.eventBus.emitError(error instanceof Error ? error.message : 'Failed to delete user');
      throw error;
    }
  }
}

// Export singleton instance
export const userApi = new UserApiService();
