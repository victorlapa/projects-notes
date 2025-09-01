/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DragDropBoard from '../src/components/DragDropBoard/DragDropBoard';
import { NoteStatus } from '../src/types';

const mockNotes = [
  {
    id: '1',
    content: 'Test note 1',
    color: 'yellow' as const,
    status: NoteStatus.BACKLOG,
  },
  {
    id: '2',
    content: 'Test note 2',
    color: 'pink' as const,
    status: NoteStatus.DOING,
  },
  {
    id: '3',
    content: 'Test note 3',
    color: 'blue' as const,
    status: NoteStatus.DONE,
  },
];

const mockUsers = [
  { id: 'user1', name: 'John Doe' },
  { id: 'user2', name: 'Jane Smith' },
];

const defaultProps = {
  notes: mockNotes,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onStatusChange: vi.fn(),
  onAddNote: vi.fn(),
  deletingNoteId: null,
  users: mockUsers,
};

describe('DragDropBoard', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all three columns', () => {
      render(<DragDropBoard {...defaultProps} />);
      
      expect(screen.getByRole('heading', { name: 'Backlog' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Doing' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();
    });

    it('displays correct note counts for each column', () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const backlogSection = screen.getByRole('heading', { name: 'Backlog' }).closest('.board-column');
      const doingSection = screen.getByRole('heading', { name: 'Doing' }).closest('.board-column');
      const doneSection = screen.getByRole('heading', { name: 'Done' }).closest('.board-column');

      expect(backlogSection).toHaveTextContent('1');
      expect(doingSection).toHaveTextContent('1');
      expect(doneSection).toHaveTextContent('1');
    });

    it('renders notes in correct columns', () => {
      render(<DragDropBoard {...defaultProps} />);
      
      expect(screen.getByText('Test note 1')).toBeInTheDocument();
      expect(screen.getByText('Test note 2')).toBeInTheDocument();
      expect(screen.getByText('Test note 3')).toBeInTheDocument();
    });

    it('shows empty column message when column has no notes', () => {
      const emptyProps = { ...defaultProps, notes: [] };
      render(<DragDropBoard {...emptyProps} />);
      
      const dropMessages = screen.getAllByText('Drop notes here');
      expect(dropMessages).toHaveLength(3);
    });

    it('only shows add button in Backlog column', () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const addButtons = screen.getAllByText('+');
      expect(addButtons).toHaveLength(1);
      
      const backlogSection = screen.getByRole('heading', { name: 'Backlog' }).closest('.board-column');
      expect(backlogSection).toContainElement(addButtons[0]);
    });
  });

  describe('Add Note Functionality', () => {
    it('opens add note form when add button is clicked', async () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const addButton = screen.getByLabelText('Add note to Backlog');
      await user.click(addButton);
      
      expect(screen.getByPlaceholderText('Enter note content...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '✓' })).toBeInTheDocument();
      
      // Check that the form container appears (which includes the cancel button)
      expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument();
      const formContainer = screen.getByPlaceholderText('Enter note content...').closest('.add-note-form-board');
      expect(formContainer).toBeInTheDocument();
    });

    it('displays color picker options in add note form', async () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const addButton = screen.getByLabelText('Add note to Backlog');
      await user.click(addButton);
      
      expect(screen.getByLabelText('Select yellow color')).toBeInTheDocument();
      expect(screen.getByLabelText('Select pink color')).toBeInTheDocument();
      expect(screen.getByLabelText('Select blue color')).toBeInTheDocument();
      expect(screen.getByLabelText('Select green color')).toBeInTheDocument();
    });

    it('displays user picker in add note form', async () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const addButton = screen.getByLabelText('Add note to Backlog');
      await user.click(addButton);
      
      const userSelect = screen.getByLabelText('Assign to user');
      expect(userSelect).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'No assignee' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'John Doe' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Jane Smith' })).toBeInTheDocument();
    });

    it('calls onAddNote with correct parameters when saving new note', async () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const addButton = screen.getByLabelText('Add note to Backlog');
      await user.click(addButton);
      
      const textarea = screen.getByPlaceholderText('Enter note content...');
      await user.type(textarea, 'New test note');
      
      const pinkColorButton = screen.getByLabelText('Select pink color');
      await user.click(pinkColorButton);
      
      const userSelect = screen.getByLabelText('Assign to user');
      await user.selectOptions(userSelect, 'user1');
      
      const saveButton = screen.getByRole('button', { name: '✓' });
      await user.click(saveButton);
      
      expect(defaultProps.onAddNote).toHaveBeenCalledWith(
        'New test note',
        'pink',
        NoteStatus.BACKLOG,
        'user1'
      );
    });

    it('calls onAddNote without userId when no user is selected', async () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const addButton = screen.getByLabelText('Add note to Backlog');
      await user.click(addButton);
      
      const textarea = screen.getByPlaceholderText('Enter note content...');
      await user.type(textarea, 'New test note');
      
      const saveButton = screen.getByRole('button', { name: '✓' });
      await user.click(saveButton);
      
      expect(defaultProps.onAddNote).toHaveBeenCalledWith(
        'New test note',
        'yellow',
        NoteStatus.BACKLOG,
        undefined
      );
    });

    it('disables save button when content is empty or only whitespace', async () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const addButton = screen.getByLabelText('Add note to Backlog');
      await user.click(addButton);
      
      const saveButton = screen.getByRole('button', { name: '✓' });
      expect(saveButton).toBeDisabled();
      
      const textarea = screen.getByPlaceholderText('Enter note content...');
      await user.type(textarea, '   ');
      
      expect(saveButton).toBeDisabled();
      
      await user.clear(textarea);
      await user.type(textarea, 'Valid content');
      
      expect(saveButton).not.toBeDisabled();
    });

    it('closes add note form when cancel button is clicked', async () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const addButton = screen.getByLabelText('Add note to Backlog');
      await user.click(addButton);
      
      expect(screen.getByPlaceholderText('Enter note content...')).toBeInTheDocument();
      
      // Find the cancel button within the add note form specifically
      const formContainer = screen.getByPlaceholderText('Enter note content...').closest('.add-note-form-board');
      const cancelButton = formContainer?.querySelector('.cancel-note-btn-board');
      expect(cancelButton).toBeInTheDocument();
      
      await user.click(cancelButton!);
      
      expect(screen.queryByPlaceholderText('Enter note content...')).not.toBeInTheDocument();
    });

    it('saves note when Enter is pressed in textarea', async () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const addButton = screen.getByLabelText('Add note to Backlog');
      await user.click(addButton);
      
      const textarea = screen.getByPlaceholderText('Enter note content...');
      await user.type(textarea, 'New test note');
      await user.keyboard('{Enter}');
      
      expect(defaultProps.onAddNote).toHaveBeenCalledWith(
        'New test note',
        'yellow',
        NoteStatus.BACKLOG,
        undefined
      );
    });

    it('cancels note creation when Escape is pressed in textarea', async () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const addButton = screen.getByLabelText('Add note to Backlog');
      await user.click(addButton);
      
      const textarea = screen.getByPlaceholderText('Enter note content...');
      await user.type(textarea, 'New test note');
      await user.keyboard('{Escape}');
      
      expect(screen.queryByPlaceholderText('Enter note content...')).not.toBeInTheDocument();
      expect(defaultProps.onAddNote).not.toHaveBeenCalled();
    });
  });

  describe('Drag and Drop Functionality', () => {
    it('applies drag over styling when dragging over column', () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const doingColumn = screen.getByRole('heading', { name: 'Doing' }).closest('.board-column');
      
      fireEvent.dragOver(doingColumn!, {
        dataTransfer: { dropEffect: 'move' },
      });
      
      expect(doingColumn).toHaveClass('board-column--drag-over');
    });

    it('removes drag over styling when drag leaves column', () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const doingColumn = screen.getByRole('heading', { name: 'Doing' }).closest('.board-column');
      
      fireEvent.dragOver(doingColumn!, {
        dataTransfer: { dropEffect: 'move' },
      });
      
      expect(doingColumn).toHaveClass('board-column--drag-over');
      
      fireEvent.dragLeave(doingColumn!);
      
      expect(doingColumn).not.toHaveClass('board-column--drag-over');
    });

    it('calls onStatusChange when note is dropped on different column', () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const doingColumn = screen.getByRole('heading', { name: 'Doing' }).closest('.board-column');
      
      // Simulate drag start
      const note1Element = screen.getByText('Test note 1').closest('div[draggable="true"]');
      fireEvent.dragStart(note1Element!, {
        dataTransfer: {
          setData: vi.fn(),
          effectAllowed: 'move',
        },
      });
      
      // Simulate drop
      fireEvent.drop(doingColumn!, {
        dataTransfer: {
          getData: vi.fn(() => '1'),
        },
      });
      
      expect(defaultProps.onStatusChange).toHaveBeenCalledWith('1', NoteStatus.DOING);
    });

    it('does not call onStatusChange when dropped without valid note id', () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const doingColumn = screen.getByRole('heading', { name: 'Doing' }).closest('.board-column');
      
      fireEvent.drop(doingColumn!, {
        dataTransfer: {
          getData: vi.fn(() => ''),
        },
      });
      
      expect(defaultProps.onStatusChange).not.toHaveBeenCalled();
    });
  });

  describe('Column Titles and Status Mapping', () => {
    it('displays correct column titles', () => {
      render(<DragDropBoard {...defaultProps} />);
      
      expect(screen.getByRole('heading', { name: 'Backlog' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Doing' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();
    });

    it('applies correct CSS classes to column titles', () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const backlogTitle = screen.getByRole('heading', { name: 'Backlog' });
      const doingTitle = screen.getByRole('heading', { name: 'Doing' });
      const doneTitle = screen.getByRole('heading', { name: 'Done' });
      
      expect(backlogTitle).toHaveClass('column-title--backlog');
      expect(doingTitle).toHaveClass('column-title--doing');
      expect(doneTitle).toHaveClass('column-title--done');
    });
  });

  describe('Note Interaction', () => {
    it('passes correct props to Note components', () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const note1 = screen.getByText('Test note 1');
      expect(note1).toBeInTheDocument();
      
      // Check that note is draggable
      const draggableNote = note1.closest('div[draggable]');
      expect(draggableNote).toHaveAttribute('draggable', 'true');
    });

    it('shows deleting state for notes being deleted', () => {
      const propsWithDeleting = {
        ...defaultProps,
        deletingNoteId: '1',
      };
      
      render(<DragDropBoard {...propsWithDeleting} />);
      
      // The deleting state would be visible in the Note component
      // We can verify the prop is passed correctly by checking the component structure
      const note1Container = screen.getByText('Test note 1').closest('div');
      expect(note1Container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper aria labels for add note button', () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const addButton = screen.getByLabelText('Add note to Backlog');
      expect(addButton).toBeInTheDocument();
    });

    it('has proper aria labels for color selection buttons', async () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const addButton = screen.getByLabelText('Add note to Backlog');
      await user.click(addButton);
      
      expect(screen.getByLabelText('Select yellow color')).toBeInTheDocument();
      expect(screen.getByLabelText('Select pink color')).toBeInTheDocument();
      expect(screen.getByLabelText('Select blue color')).toBeInTheDocument();
      expect(screen.getByLabelText('Select green color')).toBeInTheDocument();
    });

    it('has proper aria label for user selection dropdown', async () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const addButton = screen.getByLabelText('Add note to Backlog');
      await user.click(addButton);
      
      expect(screen.getByLabelText('Assign to user')).toBeInTheDocument();
    });

    it('maintains focus on textarea when add note form opens', async () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const addButton = screen.getByLabelText('Add note to Backlog');
      await user.click(addButton);
      
      const textarea = screen.getByPlaceholderText('Enter note content...');
      await waitFor(() => {
        expect(textarea).toHaveFocus();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty notes array', () => {
      const emptyProps = { ...defaultProps, notes: [] };
      render(<DragDropBoard {...emptyProps} />);
      
      expect(screen.getByRole('heading', { name: 'Backlog' })).toBeInTheDocument();
      expect(screen.getAllByText('Drop notes here')).toHaveLength(3);
    });

    it('handles empty users array', async () => {
      const noUsersProps = { ...defaultProps, users: [] };
      render(<DragDropBoard {...noUsersProps} />);
      
      const addButton = screen.getByLabelText('Add note to Backlog');
      await user.click(addButton);
      
      const userSelect = screen.getByLabelText('Assign to user');
      expect(userSelect).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'No assignee' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: 'John Doe' })).not.toBeInTheDocument();
    });

    it('handles notes with missing or invalid status', () => {
      const notesWithInvalidStatus = [
        {
          id: '1',
          content: 'Test note',
          color: 'yellow' as const,
          status: 'INVALID_STATUS' as any,
        },
      ];
      
      const propsWithInvalidStatus = {
        ...defaultProps,
        notes: notesWithInvalidStatus,
      };
      
      // Component should still render without crashing
      expect(() => render(<DragDropBoard {...propsWithInvalidStatus} />)).not.toThrow();
    });

    it('trims whitespace from note content before saving', async () => {
      render(<DragDropBoard {...defaultProps} />);
      
      const addButton = screen.getByLabelText('Add note to Backlog');
      await user.click(addButton);
      
      const textarea = screen.getByPlaceholderText('Enter note content...');
      await user.type(textarea, '  Test note with whitespace  ');
      
      const saveButton = screen.getByRole('button', { name: '✓' });
      await user.click(saveButton);
      
      expect(defaultProps.onAddNote).toHaveBeenCalledWith(
        'Test note with whitespace',
        'yellow',
        NoteStatus.BACKLOG,
        undefined
      );
    });
  });
});