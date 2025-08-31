import { apiClient } from './api';
import type { PaginationResult } from './api';

export interface Note {
  id: string;
  content: string;
  color: 'yellow' | 'pink' | 'blue' | 'green';
  status: 'BACKLOG' | 'DOING' | 'DONE';
  createdAt: string;
  updatedAt: string;
  projectId: string;
  userId?: string;
  project?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
  };
}

export interface CreateNoteData {
  content: string;
  color: 'yellow' | 'pink' | 'blue' | 'green';
  status: 'BACKLOG' | 'DOING' | 'DONE';
  projectId: string;
  userId?: string;
}

export interface UpdateNoteData {
  content?: string;
  color?: 'yellow' | 'pink' | 'blue' | 'green';
  status?: 'BACKLOG' | 'DOING' | 'DONE';
  projectId?: string;
  userId?: string;
}

export interface NoteQueryParams {
  search?: string;
  limit?: string;
  cursor?: string;
  projectId?: string;
  status?: 'BACKLOG' | 'DOING' | 'DONE';
  color?: 'yellow' | 'pink' | 'blue' | 'green';
}


const apiColorToColor = (color: string): 'yellow' | 'pink' | 'blue' | 'green' => {
  return color.toLowerCase() as 'yellow' | 'pink' | 'blue' | 'green';
};


const transformNote = (note: any): Note => ({
  ...note,
  color: apiColorToColor(note.color)
});

export class NotesService {
  static async getNotes(params?: NoteQueryParams): Promise<PaginationResult<Note>> {
    const result = await apiClient.get<PaginationResult<any>>('/notes', params as Record<string, string | undefined>);
    return {
      ...result,
      data: result.data.map(transformNote)
    };
  }

  static async getNote(id: string): Promise<Note> {
    const note = await apiClient.get<any>(`/notes/${id}`);
    return transformNote(note);
  }

  static async getNotesByProject(projectId: string): Promise<Note[]> {
    const notes = await apiClient.get<any[]>(`/notes/project/${projectId}`);
    return notes.map(transformNote);
  }

  static async createNote(data: CreateNoteData): Promise<Note> {
    const apiData = {
      ...data,
      color: data.color.toUpperCase()
    };
    const note = await apiClient.post<any>('/notes', apiData, { etag: '*' });
    return transformNote(note);
  }

  static async updateNote(id: string, data: UpdateNoteData): Promise<Note> {
    const apiData = data.color ? {
      ...data,
      color: data.color.toUpperCase()
    } : data;
    const note = await apiClient.patch<any>(`/notes/${id}`, apiData);
    return transformNote(note);
  }

  static async deleteNote(id: string): Promise<void> {
    return apiClient.delete(`/notes/${id}`);
  }
}

export default NotesService;