export const NoteStatus = {
  BACKLOG: "BACKLOG",
  DOING: "DOING",
  DONE: "DONE",
} as const;

export type NoteStatus = typeof NoteStatus[keyof typeof NoteStatus];

export const NoteColor = {
  YELLOW: "YELLOW",
  PINK: "PINK",
  BLUE: "BLUE",
  GREEN: "GREEN",
} as const;

export type NoteColor = typeof NoteColor[keyof typeof NoteColor];

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
  color: "yellow" | "pink" | "blue" | "green";
  status: NoteStatus;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  userId?: string;
}

export interface User {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  notes?: ProjectNote[];
}