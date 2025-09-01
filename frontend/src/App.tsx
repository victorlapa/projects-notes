import { useState, useEffect } from "react";
import "./App.css";
import ConfirmationModal from "./components/ConfirmationModal/ConfirmationModal";
import Error from "./components/Error/Error";
import ProjectsView from "./components/ProjectsView/ProjectsView";
import NotesView from "./components/NotesView/NotesView";
import { NoteStatus } from "./types";
import type { Project, ProjectNote } from "./types";
import { ProjectsService, NotesService, UsersService, ApiError } from "./services";
import type { User } from "./services";

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectNotes, setProjectNotes] = useState<Record<string, ProjectNote[]>>({});
  const [users, setUsers] = useState<User[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

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

  const addProject = async (name: string) => {
    try {
      setIsProjectLoading(true);
      setError(null);
      

      const tempProject: Project = {
        id: `temp-${Date.now()}`,
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: [],
      };
      setProjects(prev => [...prev, tempProject]);
      setSelectedProjectId(tempProject.id);

      const newProject = await ProjectsService.createProject({ name });


      setProjects(prev => prev.map(p => 
        p.id === tempProject.id ? newProject : p
      ));
      setSelectedProjectId(newProject.id);
    } catch (err) {

      setProjects(prev => prev.filter(p => !p.id.startsWith('temp-')));
      console.error('Failed to create project:', err);
      setError(err instanceof ApiError ? err.message : 'Failed to create project');
    } finally {
      setIsProjectLoading(false);
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

  const addNote = async (content: string, color: 'yellow' | 'pink' | 'blue' | 'green', userId?: string) => {
    if (!selectedProjectId) return;

    try {
      setIsNoteLoading(true);
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
    } finally {
      setIsNoteLoading(false);
    }
  };

  const addNoteToBoard = async (content: string, color: "yellow" | "pink" | "blue" | "green", _status: NoteStatus, userId?: string) => {
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
        <Error 
          message={error} 
          onDismiss={() => setError(null)} 
          autoClose={true}
          autoCloseDelay={7000}
        />
        <main className="flex">
          <ProjectsView
            projects={projects}
            projectNotes={projectNotes}
            selectedProjectId={selectedProjectId}
            isProjectLoading={isProjectLoading}
            onSelectProject={setSelectedProjectId}
            onAddProject={addProject}
            onDeleteProject={confirmDeleteProject}
          />
          <NotesView
            selectedProject={selectedProject}
            selectedProjectNotes={selectedProjectNotes}
            users={users}
            deletingNoteId={deletingNoteId}
            isNoteLoading={isNoteLoading}
            onEditNote={editNote}
            onDeleteNote={deleteNote}
            onUpdateNoteStatus={updateNoteStatus}
            onAddNote={addNote}
            onAddNoteToBoard={addNoteToBoard}
          />
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
