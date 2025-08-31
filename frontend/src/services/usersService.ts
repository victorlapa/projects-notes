import { apiClient } from './api';
import type { PaginationResult } from './api';
import type { Note } from './notesService';

export interface User {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  notes?: Note[];
}

export interface CreateUserData {
  name: string;
}

export interface UpdateUserData {
  name?: string;
}

export interface UserQueryParams {
  search?: string;
  limit?: string;
  cursor?: string;
}

export class UsersService {
  static async getUsers(params?: UserQueryParams): Promise<PaginationResult<User>> {
    return apiClient.get<PaginationResult<User>>('/users', params as Record<string, string | undefined>);
  }

  static async getUser(id: string): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  }

  static async getUserNotes(id: string): Promise<Note[]> {
    return apiClient.get<Note[]>(`/users/${id}/notes`);
  }

  static async createUser(data: CreateUserData): Promise<User> {
    return apiClient.post<User>('/users', data, { etag: '*' });
  }

  static async updateUser(id: string, data: UpdateUserData): Promise<User> {
    return apiClient.patch<User>(`/users/${id}`, data);
  }

  static async deleteUser(id: string): Promise<void> {
    return apiClient.delete(`/users/${id}`);
  }
}

export default UsersService;