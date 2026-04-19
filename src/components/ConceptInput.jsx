/**
 * ConceptInput — styled input for the concept query.
 */
export default function ConceptInput({ value, onChange, onKeyDown, disabled }) {
  return (
    <div className="input-section">
      <label htmlFor="concept-input" className="input-label">
        💡 What do you want explained?
      </label>
      <div className="concept-input-wrapper">
        <input
          id="concept-input"
          className="concept-input"
          type="text"
          placeholder="e.g. How does DNS work?"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          autoComplete="off"
          autoFocus
        />
        <span className="concept-input-icon" aria-hidden="true">
          🔍
        </span>
      </div>
    </div>
  );
}
