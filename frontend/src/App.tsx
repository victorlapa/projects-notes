import { useState } from "react";
import "./App.css";
import Note from "./components/Note/Note";

interface ProjectNote {
  id: string;
  content: string;
  color: "yellow" | "pink" | "blue" | "green";
  checked: boolean;
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
          checked: false,
        },
        {
          id: "2",
          content: "Meeting with client at 2pm",
          color: "pink",
          checked: true,
        },
        {
          id: "3",
          content: "Review design mockups",
          color: "blue",
          checked: false,
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
          checked: false,
        },
        {
          id: "5",
          content: "Deploy to staging",
          color: "green",
          checked: true,
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
          checked: false,
        },
        {
          id: "7",
          content: "Code review session",
          color: "yellow",
          checked: false,
        },
        {
          id: "8",
          content: "Performance optimization",
          color: "green",
          checked: true,
        },
        {
          id: "9",
          content: "Test new features",
          color: "pink",
          checked: false,
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
          checked: false,
        },
      ],
    },
  ]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("1");

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const toggleNoteChecked = (noteId: string) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) => ({
        ...project,
        notes: project.notes.map((note) =>
          note.id === noteId ? { ...note, checked: !note.checked } : note
        ),
      }))
    );
  };

  return (
    <div className="background">
      <div className="page-container">
        <h1 className="primary">Projects & Notes</h1>
        <main className="flex">
          <div className="projects-sidebar">
            <h2 className="primary-text">Projects</h2>
            <ul className="gray-text">
              {projects.map((project) => (
                <button
                  key={project.id}
                  className={`project-item ${
                    selectedProjectId === project.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  {project.name}
                  <span className="notes-count">({project.notes.length})</span>
                </button>
              ))}
            </ul>
          </div>
          <div className="notes-container flex">
            {selectedProject?.notes.map((note) => (
              <Note
                key={note.id}
                content={note.content}
                color={note.color}
                checked={note.checked}
                onToggle={() => toggleNoteChecked(note.id)}
              />
            ))}
            {!selectedProject?.notes.length && (
              <div className="empty-state">
                <p>No notes in this project yet.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
