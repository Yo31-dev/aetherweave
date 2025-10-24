/**
 * User API Service
 *
 * CRUD operations for users via APISIX Gateway
 * Token is passed as parameter (not stored internally)
 */

import { eventListener } from './event-listener.service';

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

class UserApiService {
  private baseUrl = '/api/v1/users';

  /**
   * Get authorization headers with JWT
   */
  private getHeaders(token: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Handle API errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get all users
   */
  async getUsers(token: string): Promise<User[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: this.getHeaders(token),
      });
      return this.handleResponse<User[]>(response);
    } catch (error) {
      eventListener.emitLog('Failed to fetch users', 'error', error);
      eventListener.emitError(error instanceof Error ? error.message : 'Failed to fetch users');
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number, token: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: this.getHeaders(token),
      });
      return this.handleResponse<User>(response);
    } catch (error) {
      eventListener.emitLog('Failed to fetch user', 'error', error);
      eventListener.emitError(error instanceof Error ? error.message : 'Failed to fetch user');
      throw error;
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: CreateUserDto, token: string): Promise<User> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(userData),
      });
      const user = await this.handleResponse<User>(response);
      eventListener.emitNotification('User created successfully', 'success');
      return user;
    } catch (error) {
      eventListener.emitLog('Failed to create user', 'error', error);
      eventListener.emitError(error instanceof Error ? error.message : 'Failed to create user');
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(id: number, userData: UpdateUserDto, token: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(token),
        body: JSON.stringify(userData),
      });
      const user = await this.handleResponse<User>(response);
      eventListener.emitNotification('User updated successfully', 'success');
      return user;
    } catch (error) {
      eventListener.emitLog('Failed to update user', 'error', error);
      eventListener.emitError(error instanceof Error ? error.message : 'Failed to update user');
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: number, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      eventListener.emitNotification('User deleted successfully', 'success');
    } catch (error) {
      eventListener.emitLog('Failed to delete user', 'error', error);
      eventListener.emitError(error instanceof Error ? error.message : 'Failed to delete user');
      throw error;
    }
  }
}

// Export singleton instance
export const userApi = new UserApiService();
