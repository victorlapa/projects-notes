import { useState } from 'react';
import './NotesView.css';
import Note from '../Note/Note';
import DragDropBoard from '../DragDropBoard/DragDropBoard';
import { NoteStatus } from '../../types';
import type { Project, ProjectNote, User } from '../../types';

interface NotesViewProps {
  selectedProject: Project | undefined;
  selectedProjectNotes: ProjectNote[];
  users: User[];
  deletingNoteId: string | null;
  isNoteLoading: boolean;
  onEditNote: (noteId: string, newContent: string) => void;
  onDeleteNote: (noteId: string) => void;
  onUpdateNoteStatus: (noteId: string, newStatus: NoteStatus) => void;
  onAddNote: (content: string, color: 'yellow' | 'pink' | 'blue' | 'green', userId?: string) => void;
  onAddNoteToBoard: (content: string, color: 'yellow' | 'pink' | 'blue' | 'green', status: NoteStatus, userId?: string) => void;
}

function NotesView({
  selectedProject,
  selectedProjectNotes,
  users,
  deletingNoteId,
  isNoteLoading,
  onEditNote,
  onDeleteNote,
  onUpdateNoteStatus,
  onAddNote,
  onAddNoteToBoard
}: NotesViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteColor, setNewNoteColor] = useState<'yellow' | 'pink' | 'blue' | 'green'>('yellow');
  const [newNoteUserId, setNewNoteUserId] = useState('');

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    await onAddNote(newNoteContent.trim(), newNoteColor, newNoteUserId || undefined);
    setNewNoteContent('');
    setNewNoteColor('yellow');
    setNewNoteUserId('');
    setIsAddingNote(false);
  };

  const handleAddNoteKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddNote();
    } else if (e.key === 'Escape') {
      setIsAddingNote(false);
      setNewNoteContent('');
      setNewNoteColor('yellow');
      setNewNoteUserId('');
    }
  };

  const handleCancelAddNote = () => {
    setIsAddingNote(false);
    setNewNoteContent('');
    setNewNoteColor('yellow');
    setNewNoteUserId('');
  };

  return (
    <div className="notes-section">
      <div className="notes-header">
        <div className="notes-header-left">
          <h2 className="primary-text">Notes</h2>
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              List
            </button>
            <button
              className={`view-btn ${viewMode === 'board' ? 'active' : ''}`}
              onClick={() => setViewMode('board')}
              aria-label="Board view"
            >
              Board
            </button>
          </div>
        </div>
        {selectedProject && viewMode === 'list' && (
          <button
            className="add-note-btn"
            onClick={() => setIsAddingNote(true)}
            aria-label="Add new note"
          >
            +
          </button>
        )}
      </div>
      {viewMode === 'board' && selectedProject ? (
        <DragDropBoard
          notes={selectedProjectNotes}
          onEdit={onEditNote}
          onDelete={onDeleteNote}
          onStatusChange={onUpdateNoteStatus}
          onAddNote={onAddNoteToBoard}
          deletingNoteId={deletingNoteId}
          users={users}
        />
      ) : (
        <div className="notes-container flex">
          {selectedProjectNotes.map((note) => (
            <Note
              key={note.id}
              id={note.id}
              content={note.content}
              color={note.color}
              status={note.status}
              onEdit={(newContent) => onEditNote(note.id, newContent)}
              onDelete={() => onDeleteNote(note.id)}
              onStatusChange={(newStatus) =>
                onUpdateNoteStatus(note.id, newStatus)
              }
              isDeleting={deletingNoteId === note.id}
            />
          ))}
          {isAddingNote && (
            <div className={`note note--${newNoteColor} note--adding`}>
              <div className="add-note-form">
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  onKeyDown={handleAddNoteKeyPress}
                  className="add-note-input"
                  placeholder="Enter note content..."
                  autoFocus
                  rows={4}
                />
                <div className="add-note-controls">
                  <div className="note-options">
                    <div className="color-picker">
                      <label className="option-label">Color:</label>
                      {(['yellow', 'pink', 'blue', 'green'] as const).map(
                        (color) => (
                          <button
                            key={color}
                            className={`color-option color-option--${color} ${
                              newNoteColor === color ? 'active' : ''
                            }`}
                            onClick={() => setNewNoteColor(color)}
                            aria-label={`Select ${color} color`}
                            type="button"
                          />
                        )
                      )}
                    </div>
                    <div className="user-picker">
                      <label className="option-label">Assign to:</label>
                      <select
                        value={newNoteUserId}
                        onChange={(e) => setNewNoteUserId(e.target.value)}
                        className="user-select"
                      >
                        <option value="">Unassigned</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button
                      onClick={handleAddNote}
                      className="save-note-btn"
                      disabled={!newNoteContent.trim() || isNoteLoading}
                      type="button"
                    >
                      {isNoteLoading ? '...' : '✓'}
                    </button>
                    <button
                      onClick={handleCancelAddNote}
                      className="cancel-note-btn"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!selectedProjectNotes.length && !isAddingNote && selectedProject && (
            <div className="empty-state">
              <p>No notes in this project yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotesView;