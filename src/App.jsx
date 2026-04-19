import { useState, useCallback, useRef } from 'react';
import { streamExplanation } from "./api/aiRouter";
import PersonaGrid from './components/PersonaGrid';
import ConceptInput from './components/ConceptInput';
import ResponseViewer from './components/ResponseViewer';
import ApiKeyModal from './components/ApiKeyModal';
import './App.css';

function App() {
  const [concept, setConcept] = useState('');
  const [persona, setPersona] = useState('react');
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [showApiModal, setShowApiModal] = useState(false);
  const [hasResponse, setHasResponse] = useState(false);
  const abortRef = useRef(null);

  const getApiKey = useCallback(() => {
    return localStorage.getItem('gemini_api_key') || '';
  }, []);

  const handleSubmit = useCallback(async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setShowApiModal(true);
      return;
    }

    if (!concept.trim()) return;

    // Abort any previous stream
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setIsStreaming(true);
    setResponse('');
    setError('');
    setStatusMsg('');
    setHasResponse(true);

    await streamExplanation({
      concept: concept.trim(),
      persona,
      apiKey,
      signal: controller.signal,
      onChunk: (chunk) => {
        setResponse((prev) => prev + chunk);
      },
      onDone: () => {
        setIsStreaming(false);
        setStatusMsg('');
      },
      onError: (err) => {
        setIsStreaming(false);
        setStatusMsg('');
        if (err.message.includes('403') || err.message.includes('not authorized')) {
          setError('Invalid API key. Please check your Gemini API key and try again.');
          setShowApiModal(true);
        } else {
          setError(err.message || 'Something went wrong. Please try again.');
        }
      },
      onStatusUpdate: (msg) => {
        setStatusMsg(msg);
      },
    });
  }, [concept, persona, getApiKey]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleSaveApiKey = useCallback(
    (key) => {
      localStorage.setItem('gemini_api_key', key);
      setShowApiModal(false);
      // Auto-submit if there's already a concept
      if (concept.trim()) {
        setTimeout(() => handleSubmit(), 100);
      }
    },
    [concept, handleSubmit]
  );

  const canSubmit = concept.trim().length > 0 && !isStreaming;

  return (
    <>
      {/* Animated background */}
      <div className="app-bg">
        <div className="app-bg__orb app-bg__orb--1" />
        <div className="app-bg__orb app-bg__orb--2" />
        <div className="app-bg__orb app-bg__orb--3" />
      </div>

      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header__badge">
            <span className="header__badge-dot" />
            Powered by Gemini
          </div>
          <h1 className="header__title">
            Explain Like I'm a{' '}
            <span className="header__title-gradient">Stack</span>
          </h1>
          <p className="header__subtitle">
            Type any concept, pick your persona, and get an explanation that
            speaks your language.
          </p>
        </header>

        {/* Main Card */}
        <main className="main-card" id="main-card">
          {/* Concept Input */}
          <ConceptInput
            value={concept}
            onChange={setConcept}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
          />

          {/* Persona Grid */}
          <PersonaGrid selected={persona} onSelect={setPersona} />

          {/* Submit Button */}
          <button
            id="submit-btn"
            className={`submit-btn ${isStreaming ? 'submit-btn--loading' : ''}`}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isStreaming ? (
              <>
                <span className="submit-btn__spinner" />
                {statusMsg || 'Thinking…'}
              </>
            ) : (
              <>
                <span>✨</span>
                Explain It
              </>
            )}
          </button>
        </main>

        {/* Error Banner */}
        {error && (
          <div className="error-banner" role="alert">
            ⚠️ {error}
          </div>
        )}

        {/* Response Viewer */}
        {hasResponse && (
          <ResponseViewer
            text={response}
            persona={persona}
            isStreaming={isStreaming}
          />
        )}

        {/* Settings gear */}
        <button
          className="settings-btn"
          onClick={() => setShowApiModal(true)}
          title="API Key Settings"
          aria-label="API Key Settings"
        >
          ⚙️
        </button>

        {/* Footer */}
        <footer className="footer">
          Built with{' '}
          <a
            href="https://ai.google.dev/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Gemini API
          </a>{' '}
          · Explain Like I'm a Stack
        </footer>
      </div>

      {/* API Key Modal */}
      {showApiModal && (
        <ApiKeyModal
          currentKey={getApiKey()}
          onSave={handleSaveApiKey}
          onClose={() => setShowApiModal(false)}
        />
      )}
    </>
  );
}

export default App;
