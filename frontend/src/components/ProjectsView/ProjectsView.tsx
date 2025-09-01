import { useState } from 'react';
import './ProjectsView.css';
import type { Project, ProjectNote } from '../../types';

interface ProjectsViewProps {
  projects: Project[];
  projectNotes: Record<string, ProjectNote[]>;
  selectedProjectId: string;
  isProjectLoading: boolean;
  onSelectProject: (projectId: string) => void;
  onAddProject: (name: string) => void;
  onDeleteProject: (project: Project) => void;
}

function ProjectsView({
  projects,
  projectNotes,
  selectedProjectId,
  isProjectLoading,
  onSelectProject,
  onAddProject,
  onDeleteProject
}: ProjectsViewProps) {
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;

    await onAddProject(newProjectName.trim());
    setNewProjectName('');
    setIsAddingProject(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddProject();
    } else if (e.key === 'Escape') {
      setIsAddingProject(false);
      setNewProjectName('');
    }
  };

  const handleCancelAdd = () => {
    setIsAddingProject(false);
    setNewProjectName('');
  };

  return (
    <div className="projects-sidebar">
      <div className="projects-header">
        <h2 className="primary-text">Projects</h2>
        <button
          className="add-project-btn"
          onClick={() => setIsAddingProject(true)}
          aria-label="Add new project"
          disabled={isProjectLoading}
        >
          {isProjectLoading ? '...' : '+'}
        </button>
      </div>
      <ul className="gray-text">
        {projects.map((project) => (
          <li key={project.id} className="project-item-container">
            <button
              className={`project-item ${
                selectedProjectId === project.id ? 'active' : ''
              }`}
              onClick={() => onSelectProject(project.id)}
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
                onDeleteProject(project);
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
                onClick={handleAddProject}
                className="save-btn"
                disabled={!newProjectName.trim()}
              >
                ✓
              </button>
              <button
                onClick={handleCancelAdd}
                className="cancel-btn"
              >
                ✕
              </button>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
}

export default ProjectsView;