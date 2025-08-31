export const NoteStatus = {
  BACKLOG: "BACKLOG",
  DOING: "DOING",
  DONE: "DONE",
} as const;

export type NoteStatus = typeof NoteStatus[keyof typeof NoteStatus];