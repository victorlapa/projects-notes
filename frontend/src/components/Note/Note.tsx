import "./Note.css";
import { NoteStatus } from "../../types";

interface NoteProps {
  content?: string;
  color?: "yellow" | "pink" | "blue" | "green";
  className?: string;
  onEdit?: (newContent: string) => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  status?: NoteStatus;
  onStatusChange?: (newStatus: NoteStatus) => void;
  id?: string;
  isDragging?: boolean;
}

import { useState } from "react";

export default function Note({
  content = "",
  color = "yellow",
  className = "",
  onEdit,
  onDelete,
  isDeleting = false,
  status = NoteStatus.BACKLOG,
  onStatusChange,
  id,
  isDragging = false,
}: Readonly<NoteProps>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  const handleSave = () => {
    if (onEdit && editContent.trim() !== content) {
      onEdit(editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(content);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const getStatusDisplayName = (status: NoteStatus) => {
    switch (status) {
      case NoteStatus.BACKLOG:
        return "Backlog";
      case NoteStatus.DOING:
        return "Doing";
      case NoteStatus.DONE:
        return "Done";
      default:
        return "Backlog";
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (id) {
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
    }
  };

  return (
    <div 
      className={`note note--${color} ${isEditing ? "note--editing" : ""} ${isDeleting ? "note--deleting" : ""} ${isDragging ? "note--dragging" : ""} note--status-${status.toLowerCase()} ${className}`}
      draggable={!isEditing && !isDeleting}
      onDragStart={handleDragStart}
    >
      <div className="note__status">
        {onStatusChange ? (
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as NoteStatus)}
            className={`status-badge status-badge--${status.toLowerCase()}`}
          >
            <option value={NoteStatus.BACKLOG}>Backlog</option>
            <option value={NoteStatus.DOING}>Doing</option>
            <option value={NoteStatus.DONE}>Done</option>
          </select>
        ) : (
          <span className={`status-badge status-badge--${status.toLowerCase()}`}>
            {getStatusDisplayName(status)}
          </span>
        )}
      </div>
      
      {!isEditing && (
        <div className="note__actions">
          <button
            className="note__edit-btn"
            onClick={() => setIsEditing(true)}
            aria-label="Edit note"
            type="button"
          >
            ✎
          </button>
          {onDelete && (
            <button
              className="note__delete-btn"
              onClick={onDelete}
              aria-label="Delete note"
              type="button"
              disabled={isDeleting}
            >
              {isDeleting ? "..." : "✕"}
            </button>
          )}
        </div>
      )}

      {isEditing ? (
        <div className="note__edit-form">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyPress}
            className="note__edit-input"
            autoFocus
            rows={4}
          />
          <div className="edit-actions">
            <button
              onClick={handleSave}
              className="save-edit-btn"
              disabled={!editContent.trim()}
              type="button"
            >
              ✓
            </button>
            <button
              onClick={handleCancel}
              className="cancel-edit-btn"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div className="note__content" onDoubleClick={() => setIsEditing(true)}>
          {content}
        </div>
      )}
    </div>
  );
}
