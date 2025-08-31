import { apiClient } from './api';
import type { PaginationResult } from './api';

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  notes?: ProjectNote[];
}

export interface ProjectNote {
  id: string;
  content: string;
  color: 'yellow' | 'pink' | 'blue' | 'green';
  status: 'BACKLOG' | 'DOING' | 'DONE';
  createdAt: string;
  updatedAt: string;
  projectId: string;
  userId?: string;
}

export interface CreateProjectData {
  name: string;
}

export interface UpdateProjectData {
  name?: string;
}

export interface ProjectQueryParams {
  search?: string;
  limit?: string;
  cursor?: string;
}

export class ProjectsService {
  static async getProjects(params?: ProjectQueryParams): Promise<PaginationResult<Project>> {
    return apiClient.get<PaginationResult<Project>>('/projects', params as Record<string, string | undefined>);
  }

  static async getProject(id: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${id}`);
  }

  static async createProject(data: CreateProjectData): Promise<Project> {
    return apiClient.post<Project>('/projects', data, { etag: '*' });
  }

  static async updateProject(id: string, data: UpdateProjectData): Promise<Project> {
    return apiClient.patch<Project>(`/projects/${id}`, data);
  }

  static async deleteProject(id: string): Promise<void> {
    return apiClient.delete(`/projects/${id}`);
  }
}

export default ProjectsService;