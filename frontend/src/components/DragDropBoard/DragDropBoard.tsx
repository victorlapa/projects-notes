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
  onAddNote: (content: string, color: "yellow" | "pink" | "blue" | "green", status: NoteStatus) => void;
  deletingNoteId: string | null;
}

export default function DragDropBoard({
  notes,
  onEdit,
  onDelete,
  onStatusChange,
  onAddNote,
  deletingNoteId,
}: DragDropBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<NoteStatus | null>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const [addingToColumn, setAddingToColumn] = useState<NoteStatus | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteColor, setNewNoteColor] = useState<"yellow" | "pink" | "blue" | "green">("yellow");

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

  const handleStartAddNote = (status: NoteStatus) => {
    setAddingToColumn(status);
    setNewNoteContent("");
    setNewNoteColor("yellow");
  };

  const handleSaveNewNote = () => {
    if (newNoteContent.trim() && addingToColumn) {
      onAddNote(newNoteContent.trim(), newNoteColor, addingToColumn);
      setAddingToColumn(null);
      setNewNoteContent("");
      setNewNoteColor("yellow");
    }
  };

  const handleCancelAddNote = () => {
    setAddingToColumn(null);
    setNewNoteContent("");
    setNewNoteColor("yellow");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveNewNote();
    } else if (e.key === "Escape") {
      handleCancelAddNote();
    }
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
            <div className="column-header-left">
              <h3 className={`column-title column-title--${status.toLowerCase()}`}>
                {getColumnTitle(status)}
              </h3>
              <span className="notes-count">
                {getNotesForStatus(status).length}
              </span>
            </div>
            {status === NoteStatus.BACKLOG && (
              <button
                className="add-note-btn-column"
                onClick={() => handleStartAddNote(status)}
                aria-label={`Add note to ${getColumnTitle(status)}`}
                type="button"
              >
                +
              </button>
            )}
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
            
            {addingToColumn === status && (
              <div className={`note note--${newNoteColor} note--adding-board`}>
                <div className="add-note-form-board">
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="add-note-input-board"
                    placeholder="Enter note content..."
                    autoFocus
                    rows={3}
                  />
                  <div className="add-note-controls-board">
                    <div className="color-picker-board">
                      {(["yellow", "pink", "blue", "green"] as const).map(
                        (color) => (
                          <button
                            key={color}
                            className={`color-option-board color-option-board--${color} ${
                              newNoteColor === color ? "active" : ""
                            }`}
                            onClick={() => setNewNoteColor(color)}
                            aria-label={`Select ${color} color`}
                            type="button"
                          />
                        )
                      )}
                    </div>
                    <div className="form-actions-board">
                      <button
                        onClick={handleSaveNewNote}
                        className="save-note-btn-board"
                        disabled={!newNoteContent.trim()}
                        type="button"
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleCancelAddNote}
                        className="cancel-note-btn-board"
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {getNotesForStatus(status).length === 0 && addingToColumn !== status && (
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