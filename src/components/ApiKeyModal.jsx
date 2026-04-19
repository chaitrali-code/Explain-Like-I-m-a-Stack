import { useState } from 'react';

/**
 * ApiKeyModal — modal for entering/updating the Gemini API key.
 * Stores the key in localStorage so you only enter it once.
 */
export default function ApiKeyModal({ currentKey, onSave, onClose }) {
  const [key, setKey] = useState(currentKey || '');

  const handleSave = () => {
    const trimmed = key.trim();
    if (trimmed) {
      onSave(trimmed);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="api-modal-overlay" onClick={onClose}>
      <div
        className="api-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-modal-title"
      >
        <h2 id="api-modal-title" className="api-modal__title">
          🔑 Gemini API Key
        </h2>
        <p className="api-modal__desc">
          Enter your Google Gemini API key to start generating explanations.
          The free tier gives you <strong>15 requests/minute</strong> and{' '}
          <strong>1 million tokens/day</strong> — more than enough! Your key
          is stored locally in your browser and never sent anywhere except
          Google's API.
        </p>
        <input
          id="api-key-input"
          className="api-modal__input"
          type="password"
          placeholder="AIzaSy..."
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <div className="api-modal__actions">
          <button
            className="api-modal__btn api-modal__btn--secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            id="save-api-key-btn"
            className="api-modal__btn api-modal__btn--primary"
            onClick={handleSave}
            disabled={!key.trim()}
          >
            Save & Continue
          </button>
        </div>
        <p className="api-modal__note">
          Get your free key at{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#6366f1' }}
          >
            aistudio.google.com
          </a>
        </p>
      </div>
    </div>
  );
}
