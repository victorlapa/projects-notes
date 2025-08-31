import { useState, useEffect } from "react";
import "./App.css";
import Note from "./components/Note/Note";
import DragDropBoard from "./components/DragDropBoard/DragDropBoard";
import ConfirmationModal from "./components/ConfirmationModal/ConfirmationModal";
import { NoteStatus } from "./types";
import type { Project, ProjectNote } from "./types";
import { ProjectsService, NotesService, UsersService, ApiError } from "./services";
import type { User } from "./services";

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectNotes, setProjectNotes] = useState<Record<string, ProjectNote[]>>({});
  const [users, setUsers] = useState<User[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [newProjectName, setNewProjectName] = useState<string>("");
  const [isAddingProject, setIsAddingProject] = useState<boolean>(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [newNoteContent, setNewNoteContent] = useState<string>("");
  const [newNoteColor, setNewNoteColor] = useState<
    "yellow" | "pink" | "blue" | "green"
  >("yellow");
  const [newNoteUserId, setNewNoteUserId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "board">("board");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(false);
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const selectedProjectNotes = selectedProjectId ? projectNotes[selectedProjectId] || [] : [];

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedProjectId && !selectedProjectId.startsWith('temp-')) {
      fetchProjectNotes(selectedProjectId);
    }
  }, [selectedProjectId]);
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ProjectsService.getProjects();
      setProjects(response.data);
      if (response.data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(response.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjectNotes = async (projectId: string) => {
    try {
      const notes = await NotesService.getNotesByProject(projectId);
      setProjectNotes(prev => ({ ...prev, [projectId]: notes }));
    } catch (err) {
      console.error('Failed to fetch notes for project:', projectId, err);
      setError(err instanceof ApiError ? err.message : 'Failed to load notes');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await UsersService.getUsers();
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to load users');
    }
  };

  const addProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      setIsProjectLoading(true);
      setError(null);
      

      const tempProject: Project = {
        id: `temp-${Date.now()}`,
        name: newProjectName.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: [],
      };
      setProjects(prev => [...prev, tempProject]);
      setSelectedProjectId(tempProject.id);

      const newProject = await ProjectsService.createProject({
        name: newProjectName.trim()
      });


      setProjects(prev => prev.map(p => 
        p.id === tempProject.id ? newProject : p
      ));
      setSelectedProjectId(newProject.id);
      setNewProjectName("");
      setIsAddingProject(false);
    } catch (err) {

      setProjects(prev => prev.filter(p => !p.id.startsWith('temp-')));
      console.error('Failed to create project:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to create project');
    } finally {
      setIsProjectLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addProject();
    } else if (e.key === "Escape") {
      setIsAddingProject(false);
      setNewProjectName("");
    }
  };

  const confirmDeleteProject = (project: Project) => {
    setProjectToDelete(project);
  };

  const removeProject = async (projectId: string) => {
    try {
      setIsProjectLoading(true);
      setError(null);


      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      if (selectedProjectId === projectId) {
        const remainingProjects = projects.filter(p => p.id !== projectId);
        setSelectedProjectId(remainingProjects.length > 0 ? remainingProjects[0].id : "");
      }

      await ProjectsService.deleteProject(projectId);
      

      setProjectNotes(prev => {
        const updated = { ...prev };
        delete updated[projectId];
        return updated;
      });
      
      setProjectToDelete(null);
    } catch (err) {

      fetchProjects();
      console.error('Failed to delete project:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to delete project');
    } finally {
      setIsProjectLoading(false);
    }
  };

  const editNote = async (noteId: string, newContent: string) => {
    if (!selectedProjectId) return;

    try {
      setError(null);
      

      setProjectNotes(prev => ({
        ...prev,
        [selectedProjectId]: prev[selectedProjectId]?.map(note =>
          note.id === noteId ? { ...note, content: newContent } : note
        ) || []
      }));

      await NotesService.updateNote(noteId, { content: newContent });
    } catch (err) {

      fetchProjectNotes(selectedProjectId);
      console.error('Failed to update note:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to update note');
    }
  };

  const updateNoteStatus = async (noteId: string, newStatus: NoteStatus) => {
    if (!selectedProjectId) return;

    try {
      setError(null);
      

      setProjectNotes(prev => ({
        ...prev,
        [selectedProjectId]: prev[selectedProjectId]?.map(note =>
          note.id === noteId ? { ...note, status: newStatus } : note
        ) || []
      }));

      await NotesService.updateNote(noteId, { status: newStatus });
    } catch (err) {

      fetchProjectNotes(selectedProjectId);
      console.error('Failed to update note status:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to update note status');
    }
  };

  const deleteNote = async (noteId: string) => {
    if (deletingNoteId === noteId || !selectedProjectId) return;

    setDeletingNoteId(noteId);
    setError(null);

    try {

      setProjectNotes(prev => ({
        ...prev,
        [selectedProjectId]: prev[selectedProjectId]?.filter(note => note.id !== noteId) || []
      }));

      await NotesService.deleteNote(noteId);
      setDeletingNoteId(null);
    } catch (err) {

      fetchProjectNotes(selectedProjectId);
      setDeletingNoteId(null);
      console.error('Failed to delete note:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to delete note');
    }
  };

  const addNote = async () => {
    if (!newNoteContent.trim() || !selectedProjectId) return;

    try {
      setIsNoteLoading(true);
      setError(null);


      const tempNote: ProjectNote = {
        id: `temp-${Date.now()}`,
        content: newNoteContent.trim(),
        color: newNoteColor,
        status: NoteStatus.BACKLOG,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projectId: selectedProjectId,
      };

      setProjectNotes(prev => ({
        ...prev,
        [selectedProjectId]: [...(prev[selectedProjectId] || []), tempNote]
      }));

      const newNote = await NotesService.createNote({
        content: newNoteContent.trim(),
        color: newNoteColor,
        status: NoteStatus.BACKLOG,
        projectId: selectedProjectId,
        userId: newNoteUserId || undefined,
      });


      setProjectNotes(prev => ({
        ...prev,
        [selectedProjectId]: prev[selectedProjectId]?.map(note =>
          note.id === tempNote.id ? newNote : note
        ) || []
      }));

      setNewNoteContent("");
      setNewNoteColor("yellow");
      setNewNoteUserId("");
      setIsAddingNote(false);
    } catch (err) {

      setProjectNotes(prev => ({
        ...prev,
        [selectedProjectId]: prev[selectedProjectId]?.filter(note => !note.id.startsWith('temp-')) || []
      }));
      console.error('Failed to create note:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to create note');
    } finally {
      setIsNoteLoading(false);
    }
  };

  const addNoteToBoard = async (content: string, color: "yellow" | "pink" | "blue" | "green", status: NoteStatus, userId?: string) => {
    if (!selectedProjectId) return;

    try {
      setError(null);


      const tempNote: ProjectNote = {
        id: `temp-${Date.now()}`,
        content,
        color,
        status: NoteStatus.BACKLOG,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projectId: selectedProjectId,
        userId,
      };

      setProjectNotes(prev => ({
        ...prev,
        [selectedProjectId]: [...(prev[selectedProjectId] || []), tempNote]
      }));

      const newNote = await NotesService.createNote({
        content,
        color,
        status: NoteStatus.BACKLOG,
        projectId: selectedProjectId,
        userId: userId || undefined,
      });


      setProjectNotes(prev => ({
        ...prev,
        [selectedProjectId]: prev[selectedProjectId]?.map(note =>
          note.id === tempNote.id ? newNote : note
        ) || []
      }));
    } catch (err) {

      setProjectNotes(prev => ({
        ...prev,
        [selectedProjectId]: prev[selectedProjectId]?.filter(note => !note.id.startsWith('temp-')) || []
      }));
      console.error('Failed to create note:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to create note');
    }
  };

  const handleAddNoteKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addNote();
    } else if (e.key === "Escape") {
      setIsAddingNote(false);
      setNewNoteContent("");
      setNewNoteColor("yellow");
      setNewNoteUserId("");
    }
  };

  if (isLoading) {
    return (
      <div className="background">
        <div className="page-container">
          <h1 className="primary">Projects & Notes</h1>
          <div style={{ height: "16px" }} />
          <div className="loading-container" style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="background">
      <div className="page-container">
        <h1 className="primary">Projects & Notes</h1>
        <div style={{ height: "16px" }} />
        {error && (
          <div className="error-message" style={{ 
            color: '#ff4444', 
            background: '#ffeeee', 
            padding: '1rem', 
            borderRadius: '4px', 
            marginBottom: '1rem' 
          }}>
            {error}
            <button 
              onClick={() => setError(null)}
              style={{ 
                marginLeft: '1rem', 
                background: 'none', 
                border: 'none', 
                color: '#ff4444', 
                cursor: 'pointer' 
              }}
            >
              ✕
            </button>
          </div>
        )}
        <main className="flex">
          <div className="projects-sidebar">
            <div className="projects-header">
              <h2 className="primary-text">Projects</h2>
              <button
                className="add-project-btn"
                onClick={() => setIsAddingProject(true)}
                aria-label="Add new project"
                disabled={isProjectLoading}
              >
                {isProjectLoading ? "..." : "+"}
              </button>
            </div>
            <ul className="gray-text">
              {projects.map((project) => (
                <li key={project.id} className="project-item-container">
                  <button
                    className={`project-item ${
                      selectedProjectId === project.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedProjectId(project.id)}
                  >
                    {project.name}
                    <span className="notes-count">
                      ({projectNotes[project.id]?.length || 0})
                    </span>
                  </button>
                  <button
                    className="delete-project-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeleteProject(project);
                    }}
                    aria-label={`Delete ${project.name}`}
                    type="button"
                  >
                    ✕
                  </button>
                </li>
              ))}
              {isAddingProject && (
                <li className="new-project-form">
                  <input
                    type="text"
                    placeholder="Project name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="new-project-input"
                    autoFocus
                  />
                  <div className="form-actions flex">
                    <button
                      onClick={addProject}
                      className="save-btn"
                      disabled={!newProjectName.trim()}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingProject(false);
                        setNewProjectName("");
                      }}
                      className="cancel-btn"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              )}
            </ul>
          </div>
          <div className="notes-section">
            <div className="notes-header">
              <div className="notes-header-left">
                <h2 className="primary-text">Notes</h2>
                <div className="view-toggle">
                  <button
                    className={`view-btn ${
                      viewMode === "list" ? "active" : ""
                    }`}
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                  >
                    List
                  </button>
                  <button
                    className={`view-btn ${
                      viewMode === "board" ? "active" : ""
                    }`}
                    onClick={() => setViewMode("board")}
                    aria-label="Board view"
                  >
                    Board
                  </button>
                </div>
              </div>
              {selectedProject && viewMode === "list" && (
                <button
                  className="add-note-btn"
                  onClick={() => setIsAddingNote(true)}
                  aria-label="Add new note"
                >
                  +
                </button>
              )}
            </div>
            {viewMode === "board" && selectedProject ? (
              <DragDropBoard
                notes={selectedProjectNotes}
                onEdit={editNote}
                onDelete={deleteNote}
                onStatusChange={updateNoteStatus}
                onAddNote={addNoteToBoard}
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
                    onEdit={(newContent) => editNote(note.id, newContent)}
                    onDelete={() => deleteNote(note.id)}
                    onStatusChange={(newStatus) =>
                      updateNoteStatus(note.id, newStatus)
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
                            {(["yellow", "pink", "blue", "green"] as const).map(
                              (color) => (
                                <button
                                  key={color}
                                  className={`color-option color-option--${color} ${
                                    newNoteColor === color ? "active" : ""
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
                            onClick={addNote}
                            className="save-note-btn"
                            disabled={!newNoteContent.trim() || isNoteLoading}
                            type="button"
                          >
                            {isNoteLoading ? "..." : "✓"}
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingNote(false);
                              setNewNoteContent("");
                              setNewNoteColor("yellow");
                              setNewNoteUserId("");
                            }}
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
        </main>
        
        <ConfirmationModal
          isOpen={projectToDelete !== null}
          title="Delete Project"
          message={`Are you sure you want to delete "${projectToDelete?.name}"? This action cannot be undone and will delete all notes in this project.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={() => projectToDelete && removeProject(projectToDelete.id)}
          onCancel={() => setProjectToDelete(null)}
          isLoading={isProjectLoading}
        />
      </div>
    </div>
  );
}

export default App;
