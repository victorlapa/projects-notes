/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Note from "../src/components/Note/Note";
import { NoteStatus } from "../src/types";

describe("Note Component", () => {
  const defaultProps = {
    content: "Test note content",
    color: "yellow" as const,
    status: NoteStatus.BACKLOG,
    id: "test-note-1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders note with default props", () => {
      render(<Note {...defaultProps} />);

      expect(screen.getByText("Test note content")).toBeInTheDocument();
      expect(screen.getByText("Backlog")).toBeInTheDocument();
    });

    it("renders note with different colors", () => {
      const colors = ["yellow", "pink", "blue", "green"] as const;

      colors.forEach((color) => {
        const { container } = render(<Note {...defaultProps} color={color} />);
        expect(container.querySelector(`.note--${color}`)).toBeInTheDocument();
      });
    });

    it("renders note with different statuses", () => {
      const statuses = [
        { status: NoteStatus.BACKLOG, display: "Backlog" },
        { status: NoteStatus.DOING, display: "Doing" },
        { status: NoteStatus.DONE, display: "Done" },
      ];

      statuses.forEach(({ status, display }) => {
        render(<Note {...defaultProps} status={status} />);
        expect(screen.getByText(display)).toBeInTheDocument();
      });
    });

    it("renders with custom className", () => {
      const { container } = render(
        <Note {...defaultProps} className="custom-class" />
      );
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });

    it("renders as draggable by default", () => {
      const { container } = render(<Note {...defaultProps} />);
      const noteElement = container.querySelector(".note");
      expect(noteElement).toHaveAttribute("draggable", "true");
    });

    it("renders with isDragging class when dragging", () => {
      const { container } = render(<Note {...defaultProps} isDragging />);
      expect(container.querySelector(".note--dragging")).toBeInTheDocument();
    });

    it("renders with isDeleting class and disabled state when deleting", () => {
      const { container } = render(<Note {...defaultProps} isDeleting />);
      expect(container.querySelector(".note--deleting")).toBeInTheDocument();
    });
  });

  describe("Status Display", () => {
    it("displays status as text when onStatusChange is not provided", () => {
      render(<Note {...defaultProps} status={NoteStatus.DOING} />);
      expect(screen.getByText("Doing")).toBeInTheDocument();
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });

    it("displays status as select when onStatusChange is provided", () => {
      const onStatusChange = vi.fn();
      render(<Note {...defaultProps} onStatusChange={onStatusChange} />);

      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toHaveValue("BACKLOG");
    });

    it("calls onStatusChange when status is changed", async () => {
      const onStatusChange = vi.fn();
      const user = userEvent.setup();

      render(<Note {...defaultProps} onStatusChange={onStatusChange} />);

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, NoteStatus.DOING);

      expect(onStatusChange).toHaveBeenCalledWith(NoteStatus.DOING);
    });
  });

  describe("Action Buttons", () => {
    it("renders edit and delete buttons when not editing", () => {
      const onDelete = vi.fn();
      render(<Note {...defaultProps} onDelete={onDelete} />);

      expect(screen.getByLabelText("Edit note")).toBeInTheDocument();
      expect(screen.getByLabelText("Delete note")).toBeInTheDocument();
    });

    it("does not render delete button when onDelete is not provided", () => {
      render(<Note {...defaultProps} />);

      expect(screen.getByLabelText("Edit note")).toBeInTheDocument();
      expect(screen.queryByLabelText("Delete note")).not.toBeInTheDocument();
    });

    it("calls onDelete when delete button is clicked", async () => {
      const onDelete = vi.fn();
      const user = userEvent.setup();

      render(<Note {...defaultProps} onDelete={onDelete} />);

      await user.click(screen.getByLabelText("Delete note"));
      expect(onDelete).toHaveBeenCalled();
    });

    it("disables delete button when deleting", () => {
      const onDelete = vi.fn();
      render(<Note {...defaultProps} onDelete={onDelete} isDeleting />);

      const deleteButton = screen.getByLabelText("Delete note");
      expect(deleteButton).toBeDisabled();
      expect(deleteButton).toHaveTextContent("...");
    });

    it("enters edit mode when edit button is clicked", async () => {
      const user = userEvent.setup();
      render(<Note {...defaultProps} />);

      await user.click(screen.getByLabelText("Edit note"));

      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test note content")).toBeInTheDocument();
    });
  });

  describe("Edit Mode", () => {
    it("enters edit mode when double-clicking content", async () => {
      const user = userEvent.setup();
      render(<Note {...defaultProps} />);

      await user.dblClick(screen.getByText("Test note content"));

      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test note content")).toBeInTheDocument();
    });

    it("renders textarea with current content in edit mode", async () => {
      const user = userEvent.setup();
      render(<Note {...defaultProps} />);

      await user.click(screen.getByLabelText("Edit note"));

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("Test note content");
      expect(textarea).toHaveFocus();
    });

    it("renders save and cancel buttons in edit mode", async () => {
      const user = userEvent.setup();
      render(<Note {...defaultProps} />);

      await user.click(screen.getByLabelText("Edit note"));

      expect(screen.getByRole("button", { name: /✓/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /✕/ })).toBeInTheDocument();
    });

    it("disables save button when content is empty", async () => {
      const user = userEvent.setup();
      render(<Note {...defaultProps} />);

      await user.click(screen.getByLabelText("Edit note"));

      const textarea = screen.getByRole("textbox");
      await user.clear(textarea);

      const saveButton = screen.getByRole("button", { name: /✓/ });
      expect(saveButton).toBeDisabled();
    });

    it("is not draggable in edit mode", async () => {
      const user = userEvent.setup();
      const { container } = render(<Note {...defaultProps} />);

      await user.click(screen.getByLabelText("Edit note"));

      const noteElement = container.querySelector(".note");
      expect(noteElement).toHaveAttribute("draggable", "false");
    });

    it("hides action buttons in edit mode", async () => {
      const user = userEvent.setup();
      render(<Note {...defaultProps} onDelete={vi.fn()} />);

      await user.click(screen.getByLabelText("Edit note"));

      expect(screen.queryByLabelText("Edit note")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Delete note")).not.toBeInTheDocument();
    });
  });

  describe("Edit Actions", () => {
    it("calls onEdit with trimmed content when save button is clicked", async () => {
      const onEdit = vi.fn();
      const user = userEvent.setup();

      render(<Note {...defaultProps} onEdit={onEdit} />);

      await user.click(screen.getByLabelText("Edit note"));

      const textarea = screen.getByRole("textbox");
      await user.clear(textarea);
      await user.type(textarea, "  Updated content  ");

      await user.click(screen.getByRole("button", { name: /✓/ }));

      expect(onEdit).toHaveBeenCalledWith("Updated content");
    });

    it("does not call onEdit when content is unchanged", async () => {
      const onEdit = vi.fn();
      const user = userEvent.setup();

      render(<Note {...defaultProps} onEdit={onEdit} />);

      await user.click(screen.getByLabelText("Edit note"));
      await user.click(screen.getByRole("button", { name: /✓/ }));

      expect(onEdit).not.toHaveBeenCalled();
    });

    it("exits edit mode after saving", async () => {
      const onEdit = vi.fn();
      const user = userEvent.setup();

      render(<Note {...defaultProps} onEdit={onEdit} />);

      await user.click(screen.getByLabelText("Edit note"));

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, " updated");

      await user.click(screen.getByRole("button", { name: /✓/ }));

      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      expect(screen.getByText("Test note content")).toBeInTheDocument();
    });

    it("cancels edit and restores original content", async () => {
      const user = userEvent.setup();

      render(<Note {...defaultProps} />);

      await user.click(screen.getByLabelText("Edit note"));

      const textarea = screen.getByRole("textbox");
      await user.clear(textarea);
      await user.type(textarea, "Changed content");

      await user.click(screen.getByRole("button", { name: /✕/ }));

      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      expect(screen.getByText("Test note content")).toBeInTheDocument();
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("saves on Enter key (without Shift)", async () => {
      const onEdit = vi.fn();
      const user = userEvent.setup();

      render(<Note {...defaultProps} onEdit={onEdit} />);

      await user.click(screen.getByLabelText("Edit note"));

      const textarea = screen.getByRole("textbox");
      await user.clear(textarea);
      await user.type(textarea, "Updated content");

      await user.type(textarea, "{Enter}");

      expect(onEdit).toHaveBeenCalledWith("Updated content");
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("does not save on Shift+Enter (allows newline)", async () => {
      const onEdit = vi.fn();
      const user = userEvent.setup();

      render(<Note {...defaultProps} onEdit={onEdit} />);

      await user.click(screen.getByLabelText("Edit note"));

      const textarea = screen.getByRole("textbox");
      await user.clear(textarea);
      await user.type(textarea, "Line 1{Shift>}{Enter}{/Shift}Line 2");

      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(textarea).toHaveValue("Line 1\nLine 2");
    });

    it("cancels on Escape key", async () => {
      const user = userEvent.setup();

      render(<Note {...defaultProps} />);

      await user.click(screen.getByLabelText("Edit note"));

      const textarea = screen.getByRole("textbox");
      await user.clear(textarea);
      await user.type(textarea, "Changed content");

      await user.type(textarea, "{Escape}");

      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      expect(screen.getByText("Test note content")).toBeInTheDocument();
    });
  });

  describe("Drag and Drop", () => {
    it("sets drag data when drag starts", () => {
      const { container } = render(<Note {...defaultProps} />);
      const noteElement = container.querySelector(".note")!;

      const mockSetData = vi.fn();
      const mockEvent = {
        dataTransfer: {
          setData: mockSetData,
          effectAllowed: "",
        },
      } as unknown as React.DragEvent;

      fireEvent.dragStart(noteElement, mockEvent);

      expect(mockSetData).toHaveBeenCalledWith("text/plain", "test-note-1");
      expect(mockEvent.dataTransfer.effectAllowed).toBe("move");
    });

    it("does not set drag data when id is not provided", () => {
      const { container } = render(<Note {...defaultProps} id={undefined} />);
      const noteElement = container.querySelector(".note")!;

      const mockSetData = vi.fn();
      const mockEvent = {
        dataTransfer: {
          setData: mockSetData,
          effectAllowed: "",
        },
      } as unknown as React.DragEvent;

      fireEvent.dragStart(noteElement, mockEvent);

      expect(mockSetData).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for buttons", () => {
      render(<Note {...defaultProps} onDelete={vi.fn()} />);

      expect(screen.getByLabelText("Edit note")).toBeInTheDocument();
      expect(screen.getByLabelText("Delete note")).toBeInTheDocument();
    });

    it("has proper button types to prevent form submission", async () => {
      const user = userEvent.setup();
      render(<Note {...defaultProps} onDelete={vi.fn()} />);

      const editButton = screen.getByLabelText("Edit note");
      const deleteButton = screen.getByLabelText("Delete note");

      expect(editButton).toHaveAttribute("type", "button");
      expect(deleteButton).toHaveAttribute("type", "button");

      await user.click(editButton);

      const saveButton = screen.getByRole("button", { name: /✓/ });
      const cancelButton = screen.getByRole("button", { name: /✕/ });

      expect(saveButton).toHaveAttribute("type", "button");
      expect(cancelButton).toHaveAttribute("type", "button");
    });

    it("focuses textarea when entering edit mode", async () => {
      const user = userEvent.setup();
      render(<Note {...defaultProps} />);

      await user.click(screen.getByLabelText("Edit note"));

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveFocus();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty content", () => {
      render(<Note {...defaultProps} content="" />);

      const noteContent = document.querySelector(".note__content");
      expect(noteContent).toHaveTextContent("");
    });

    it("handles undefined content", () => {
      render(<Note {...defaultProps} content={undefined} />);

      const noteContent = document.querySelector(".note__content");
      expect(noteContent).toHaveTextContent("");
    });

    it("does not save when trimmed content is empty", async () => {
      const onEdit = vi.fn();
      const user = userEvent.setup();

      render(<Note {...defaultProps} onEdit={onEdit} />);

      await user.click(screen.getByLabelText("Edit note"));

      const textarea = screen.getByRole("textbox");
      await user.clear(textarea);
      await user.type(textarea, "   "); // Only whitespace

      const saveButton = screen.getByRole("button", { name: /✓/ });
      expect(saveButton).toBeDisabled();

      expect(onEdit).not.toHaveBeenCalled();

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });
});
