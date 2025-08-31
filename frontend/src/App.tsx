import { useState } from "react";
import "./App.css";
import Note from "./components/Note/Note";
import DragDropBoard from "./components/DragDropBoard/DragDropBoard";
import { NoteStatus } from "./types";

interface ProjectNote {
  id: string;
  content: string;
  color: "yellow" | "pink" | "blue" | "green";
  status: NoteStatus;
}

interface Project {
  id: string;
  name: string;
  notes: ProjectNote[];
}

function App() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Projeto 1",
      notes: [
        {
          id: "1",
          content: "Research competitor analysis",
          color: "yellow",
          status: NoteStatus.BACKLOG,
        },
        {
          id: "2",
          content: "Meeting with client at 2pm",
          color: "pink",
          status: NoteStatus.DONE,
        },
        {
          id: "3",
          content: "Review design mockups",
          color: "blue",
          status: NoteStatus.DOING,
        },
      ],
    },
    {
      id: "2",
      name: "Projeto 2",
      notes: [
        {
          id: "4",
          content: "Fix authentication bug",
          color: "pink",
          status: NoteStatus.DOING,
        },
        {
          id: "5",
          content: "Deploy to staging",
          color: "green",
          status: NoteStatus.DONE,
        },
      ],
    },
    {
      id: "3",
      name: "Projeto 3",
      notes: [
        {
          id: "6",
          content: "Update documentation",
          color: "blue",
          status: NoteStatus.BACKLOG,
        },
        {
          id: "7",
          content: "Code review session",
          color: "yellow",
          status: NoteStatus.BACKLOG,
        },
        {
          id: "8",
          content: "Performance optimization",
          color: "green",
          status: NoteStatus.DONE,
        },
        {
          id: "9",
          content: "Test new features",
          color: "pink",
          status: NoteStatus.DOING,
        },
      ],
    },
    {
      id: "4",
      name: "Projeto 4",
      notes: [
        {
          id: "10",
          content: "Plan sprint goals",
          color: "yellow",
          status: NoteStatus.BACKLOG,
        },
      ],
    },
  ]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("1");
  const [newProjectName, setNewProjectName] = useState<string>("");
  const [isAddingProject, setIsAddingProject] = useState<boolean>(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [newNoteContent, setNewNoteContent] = useState<string>("");
  const [newNoteColor, setNewNoteColor] = useState<
    "yellow" | "pink" | "blue" | "green"
  >("yellow");
  const [newNoteStatus, setNewNoteStatus] = useState<NoteStatus>(
    NoteStatus.BACKLOG
  );
  const [viewMode, setViewMode] = useState<"list" | "board">("board");

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const addProject = () => {
    if (newProjectName.trim()) {
      const newProject: Project = {
        id: Date.now().toString(),
        name: newProjectName.trim(),
        notes: [],
      };
      setProjects((prevProjects) => [...prevProjects, newProject]);
      setSelectedProjectId(newProject.id);
      setNewProjectName("");
      setIsAddingProject(false);
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

  const removeProject = (projectId: string) => {
    setProjects((prevProjects) => {
      const updatedProjects = prevProjects.filter((p) => p.id !== projectId);

      if (selectedProjectId === projectId) {
        setSelectedProjectId(
          updatedProjects.length > 0 ? updatedProjects[0].id : ""
        );
      }

      return updatedProjects;
    });
  };

  const editNote = (noteId: string, newContent: string) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) => ({
        ...project,
        notes: project.notes.map((note) =>
          note.id === noteId ? { ...note, content: newContent } : note
        ),
      }))
    );
  };

  const updateNoteStatus = (noteId: string, newStatus: NoteStatus) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) => ({
        ...project,
        notes: project.notes.map((note) =>
          note.id === noteId ? { ...note, status: newStatus } : note
        ),
      }))
    );
  };

  const deleteNote = async (noteId: string) => {
    if (deletingNoteId === noteId) return;

    setDeletingNoteId(noteId);

    const originalProjects = projects;
    setProjects((prevProjects) =>
      prevProjects.map((project) => ({
        ...project,
        notes: project.notes.filter((note) => note.id !== noteId),
      }))
    );

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) {
            resolve(undefined);
          } else {
            reject(new Error("Failed to delete note"));
          }
        }, 500);
      });

      setDeletingNoteId(null);
    } catch (error) {
      setProjects(originalProjects);
      setDeletingNoteId(null);
      console.error("Failed to delete note:", error);
      alert("Failed to delete note. Please try again.");
    }
  };

  const addNote = () => {
    if (!newNoteContent.trim() || !selectedProjectId) return;

    const newNote: ProjectNote = {
      id: Date.now().toString(),
      content: newNoteContent.trim(),
      color: newNoteColor,
      status: newNoteStatus,
    };

    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === selectedProjectId
          ? { ...project, notes: [...project.notes, newNote] }
          : project
      )
    );

    setNewNoteContent("");
    setNewNoteColor("yellow");
    setNewNoteStatus(NoteStatus.BACKLOG);
    setIsAddingNote(false);
  };

  const handleAddNoteKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addNote();
    } else if (e.key === "Escape") {
      setIsAddingNote(false);
      setNewNoteContent("");
      setNewNoteColor("yellow");
      setNewNoteStatus(NoteStatus.BACKLOG);
    }
  };

  return (
    <div className="background">
      <div className="page-container">
        <h1 className="primary">Projects & Notes</h1>
        <div style={{ height: "16px" }} />
        <main className="flex">
          <div className="projects-sidebar">
            <div className="projects-header">
              <h2 className="primary-text">Projects</h2>
              <button
                className="add-project-btn"
                onClick={() => setIsAddingProject(true)}
                aria-label="Add new project"
              >
                +
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
                      ({project.notes.length})
                    </span>
                  </button>
                  <button
                    className="delete-project-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProject(project.id);
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
              {selectedProject && (
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
                notes={selectedProject.notes}
                onEdit={editNote}
                onDelete={deleteNote}
                onStatusChange={updateNoteStatus}
                deletingNoteId={deletingNoteId}
              />
            ) : (
              <div className="notes-container flex">
                {selectedProject?.notes.map((note) => (
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
                          <div className="status-picker">
                            <label className="option-label">Status:</label>
                            <select
                              value={newNoteStatus}
                              onChange={(e) =>
                                setNewNoteStatus(e.target.value as NoteStatus)
                              }
                              className="status-select"
                            >
                              <option value={NoteStatus.BACKLOG}>
                                Backlog
                              </option>
                              <option value={NoteStatus.DOING}>Doing</option>
                              <option value={NoteStatus.DONE}>Done</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-actions">
                          <button
                            onClick={addNote}
                            className="save-note-btn"
                            disabled={!newNoteContent.trim()}
                            type="button"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingNote(false);
                              setNewNoteContent("");
                              setNewNoteColor("yellow");
                              setNewNoteStatus(NoteStatus.BACKLOG);
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
                {!selectedProject?.notes.length && !isAddingNote && (
                  <div className="empty-state">
                    <p>No notes in this project yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
