import { useState, useEffect, useRef } from 'react';

const PERSONA_LABELS = {
  react: 'React Dev',
  datascience: 'Data Scientist',
  devops: 'DevOps Engineer',
  designer: 'UI/UX Designer',
};

/**
 * ResponseViewer — displays the streaming response with a copy button.
 */
export default function ResponseViewer({ text, persona, isStreaming }) {
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef(null);

  // Auto-scroll while streaming
  useEffect(() => {
    if (isStreaming && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [text, isStreaming]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /**
   * Simple markdown-lite renderer: handles **bold**, `code`, ```code blocks```,
   * and line breaks. Returns React elements.
   */
  const renderFormattedText = (raw) => {
    if (!raw) return null;

    const parts = [];
    // Split by code blocks first
    const codeBlockRegex = /```[\s\S]*?```/g;
    let lastIndex = 0;
    let match;
    let key = 0;

    const processInline = (str) => {
      // Handle **bold** and `inline code`
      const inlineRegex = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
      const result = [];
      let idx = 0;
      let inlineMatch;

      while ((inlineMatch = inlineRegex.exec(str)) !== null) {
        if (inlineMatch.index > idx) {
          result.push(str.slice(idx, inlineMatch.index));
        }
        if (inlineMatch[2]) {
          result.push(<strong key={`b-${key++}`}>{inlineMatch[2]}</strong>);
        } else if (inlineMatch[3]) {
          result.push(<code key={`c-${key++}`}>{inlineMatch[3]}</code>);
        }
        idx = inlineMatch.index + inlineMatch[0].length;
      }
      if (idx < str.length) {
        result.push(str.slice(idx));
      }
      return result.length > 0 ? result : [str];
    };

    while ((match = codeBlockRegex.exec(raw)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          ...processInline(raw.slice(lastIndex, match.index))
        );
      }
      const codeContent = match[0].replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
      parts.push(
        <pre key={`pre-${key++}`}>
          <code>{codeContent}</code>
        </pre>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < raw.length) {
      parts.push(...processInline(raw.slice(lastIndex)));
    }

    return parts;
  };

  return (
    <section className="response-section" aria-live="polite">
      <div className="response-card">
        <div className="response-header">
          <div className="response-header__left">
            <span className={`response-header__dot response-header__dot--${persona}`} />
            <span className="response-header__label">
              {PERSONA_LABELS[persona] || 'Response'}
            </span>
          </div>
          {text && !isStreaming && (
            <button
              id="copy-response-btn"
              className="response-header__copy-btn"
              onClick={handleCopy}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          )}
        </div>
        <div className="response-body" ref={bodyRef}>
          {text ? (
            <>
              {renderFormattedText(text)}
              {isStreaming && <span className="cursor-blink" />}
            </>
          ) : isStreaming ? (
            <span className="cursor-blink" />
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>
              Your explanation will appear here…
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
