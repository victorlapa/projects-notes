import { useState } from "react";
import { NoteStatus } from "../../types";
import Note from "../Note/Note";
import "./DragDropBoard.css";

interface ProjectNote {
  id: string;
  content: string;
  color: "yellow" | "pink" | "blue" | "green";
  status: NoteStatus;
}

interface DragDropBoardProps {
  notes: ProjectNote[];
  onEdit: (noteId: string, newContent: string) => void;
  onDelete: (noteId: string) => void;
  onStatusChange: (noteId: string, newStatus: NoteStatus) => void;
  deletingNoteId: string | null;
}

export default function DragDropBoard({
  notes,
  onEdit,
  onDelete,
  onStatusChange,
  deletingNoteId,
}: DragDropBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<NoteStatus | null>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent, status: NoteStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: NoteStatus) => {
    e.preventDefault();
    const noteId = e.dataTransfer.getData("text/plain");
    
    if (noteId && draggingNoteId) {
      onStatusChange(noteId, status);
    }
    
    setDragOverColumn(null);
    setDraggingNoteId(null);
  };

  const handleNoteDragStart = (noteId: string) => {
    setDraggingNoteId(noteId);
  };

  const handleNoteDragEnd = () => {
    setDraggingNoteId(null);
    setDragOverColumn(null);
  };

  const getColumnTitle = (status: NoteStatus) => {
    switch (status) {
      case NoteStatus.BACKLOG:
        return "Backlog";
      case NoteStatus.DOING:
        return "Doing";
      case NoteStatus.DONE:
        return "Done";
      default:
        return "Unknown";
    }
  };

  const getNotesForStatus = (status: NoteStatus) => {
    return notes.filter((note) => note.status === status);
  };

  const columns = [NoteStatus.BACKLOG, NoteStatus.DOING, NoteStatus.DONE];

  return (
    <div className="drag-drop-board">
      {columns.map((status) => (
        <div
          key={status}
          className={`board-column ${
            dragOverColumn === status ? "board-column--drag-over" : ""
          }`}
          onDragOver={(e) => handleDragOver(e, status)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, status)}
        >
          <div className="board-column__header">
            <h3 className={`column-title column-title--${status.toLowerCase()}`}>
              {getColumnTitle(status)}
            </h3>
            <span className="notes-count">
              {getNotesForStatus(status).length}
            </span>
          </div>
          
          <div className="board-column__content">
            {getNotesForStatus(status).map((note) => (
              <div
                key={note.id}
                onDragStart={() => handleNoteDragStart(note.id)}
                onDragEnd={handleNoteDragEnd}
              >
                <Note
                  id={note.id}
                  content={note.content}
                  color={note.color}
                  status={note.status}
                  isDragging={draggingNoteId === note.id}
                  onEdit={(newContent) => onEdit(note.id, newContent)}
                  onDelete={() => onDelete(note.id)}
                  onStatusChange={(newStatus) => onStatusChange(note.id, newStatus)}
                  isDeleting={deletingNoteId === note.id}
                />
              </div>
            ))}
            
            {getNotesForStatus(status).length === 0 && (
              <div className="empty-column">
                <p>Drop notes here</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}