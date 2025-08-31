
export { apiClient, ApiError, API_BASE_URL } from './api';
export type { PaginationResult } from './api';


export { ProjectsService } from './projectsService';
export type { 
  Project, 
  ProjectNote, 
  CreateProjectData, 
  UpdateProjectData, 
  ProjectQueryParams 
} from './projectsService';


export { NotesService } from './notesService';
export type {
  Note,
  CreateNoteData,
  UpdateNoteData,
  NoteQueryParams
} from './notesService';


export { UsersService } from './usersService';
export type {
  User,
  CreateUserData,
  UpdateUserData,
  UserQueryParams
} from './usersService';