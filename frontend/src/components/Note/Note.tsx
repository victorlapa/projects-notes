import "./Note.css";

interface NoteProps {
  content?: string;
  color?: "yellow" | "pink" | "blue" | "green";
  className?: string;
  checked?: boolean;
  onToggle?: () => void;
}

export default function Note({
  content = "",
  color = "yellow",
  className = "",
  checked = false,
  onToggle,
}: Readonly<NoteProps>) {
  return (
    <div className={`note note--${color} ${checked ? "note--checked" : ""} ${className}`}>
      <button 
        className="note__checkbox" 
        onClick={onToggle}
        aria-label={checked ? "Mark as incomplete" : "Mark as complete"}
        type="button"
      >
        {checked && <span className="checkmark">✓</span>}
      </button>
      <div className="note__content">{content}</div>
    </div>
  );
}
