import "./Note.css";

interface NoteProps {
  content?: string;
  color?: "yellow" | "pink" | "blue" | "green";
  className?: string;
  checked?: boolean;
  onToggle?: () => void;
  onEdit?: (newContent: string) => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

import { useState } from "react";

export default function Note({
  content = "",
  color = "yellow",
  className = "",
  checked = false,
  onToggle,
  onEdit,
  onDelete,
  isDeleting = false,
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

  return (
    <div className={`note note--${color} ${checked ? "note--checked" : ""} ${isEditing ? "note--editing" : ""} ${isDeleting ? "note--deleting" : ""} ${className}`}>
      <button 
        className="note__checkbox" 
        onClick={onToggle}
        aria-label={checked ? "Mark as incomplete" : "Mark as complete"}
        type="button"
      >
        {checked && <span className="checkmark">✓</span>}
      </button>
      
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
