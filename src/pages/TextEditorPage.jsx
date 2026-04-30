import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Share2, MoreVertical, Bold, Italic,
  List, Link2, BookOpen, HelpCircle, PlayCircle,
  AlignLeft, AlignCenter, Underline
} from 'lucide-react';
import { useSync } from '../context/SyncContext';
import './TextEditorPage.css';

const TextEditorPage = ({ note, onBack }) => {
  const { dispatchEvent } = useSync();
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [lastSaved, setLastSaved] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const saveTimer = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  }, [content]);

  // Count words
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [content]);

  // Debounced auto-save indicator
  const handleContentChange = (e) => {
    const val = e.target.value;
    setContent(val);
    setLastSaved(null);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setLastSaved(new Date());
      dispatchEvent({ type: 'NOTE_EDIT', payload: { content: val } });
    }, 800);
  };

  const handleBack = () => {
    onBack({
      id: note?.id,
      title: title.trim() || 'Untitled Note',
      content,
      type: 'text',
      teamId: note?.teamId || null,
      tag: note?.tag || 'PERSONAL',
    });
  };

  const savedLabel = lastSaved
    ? `Saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : content !== (note?.content || '') ? 'Saving…' : 'Cloud Saved';

  return (
    <div className="editor-page">
      {/* Top bar */}
      <header className="editor-topbar">
        <div className="editor-topbar-left">
          <button className="editor-back-btn" onClick={handleBack}>
            <ArrowLeft size={18} />
          </button>
          <div className="editor-brand">
            <span className="editor-brand-name">PeerPad</span>
            <span className="editor-brand-sub">ACADEMIC SANCTUARY</span>
          </div>
        </div>
        <div className="editor-topbar-right">
          <div className="editor-save-status">
            <span className="editor-save-dot" />
            {savedLabel}
          </div>
          <button className="editor-share-btn">
            <Share2 size={15} /> Share
          </button>
          <button className="editor-more-btn">
            <MoreVertical size={18} />
          </button>
        </div>
      </header>

      <div className="editor-body">
        {/* Main writing area */}
        <div className="editor-main">
          <div className="editor-scroll-area">
            {/* Tag + meta */}
            <div className="editor-meta">
              <span className="editor-tag">{note?.tag || 'PERSONAL'}</span>
              <span className="editor-meta-sep">·</span>
              <span className="editor-meta-text">{wordCount} words</span>
            </div>

            {/* Title */}
            <input
              className="editor-title-input"
              placeholder="Note title…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={120}
            />

            {/* Divider */}
            <div className="editor-divider" />

            {/* Content */}
            <textarea
              ref={textareaRef}
              className="editor-textarea"
              placeholder="Start writing your note here…"
              value={content}
              onChange={handleContentChange}
            />
          </div>

          {/* Formatting toolbar — floating at bottom of writing area */}
          <div className="editor-toolbar">
            <button className="toolbar-btn" title="Bold"><Bold size={16} /></button>
            <button className="toolbar-btn" title="Italic"><Italic size={16} /></button>
            <button className="toolbar-btn" title="Underline"><Underline size={16} /></button>
            <div className="toolbar-sep" />
            <button className="toolbar-btn" title="Bullet list"><List size={16} /></button>
            <button className="toolbar-btn" title="Align left"><AlignLeft size={16} /></button>
            <button className="toolbar-btn" title="Align center"><AlignCenter size={16} /></button>
            <div className="toolbar-sep" />
            <button className="toolbar-btn" title="Insert link"><Link2 size={16} /></button>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="editor-sidebar">
          {/* Collaborators */}
          <div className="sidebar-block">
            <div className="sidebar-block-header">
              <span className="sidebar-block-title">COLLABORATORS</span>
              <span className="sidebar-block-badge">1 ACTIVE</span>
            </div>
            <div className="sidebar-avatars">
              <img src="https://i.pravatar.cc/150?u=user" alt="You" title="You" />
            </div>
          </div>

          {/* Study AI */}
          <div className="sidebar-block">
            <div className="sidebar-ai-header">
              <div className="sidebar-ai-icon"><BookOpen size={16} /></div>
              <div>
                <div className="sidebar-ai-name">Study AI</div>
                <div className="sidebar-ai-sub">YOUR ACADEMIC PARTNER</div>
              </div>
            </div>
            <div className="sidebar-ai-actions">
              <button className="sidebar-ai-btn">
                <PlayCircle size={15} />
                <span>Summarize Note</span>
                <ArrowLeft size={13} className="sidebar-ai-chevron" />
              </button>
              <button className="sidebar-ai-btn">
                <BookOpen size={15} />
                <span>Explain Concept</span>
                <ArrowLeft size={13} className="sidebar-ai-chevron" />
              </button>
              <button className="sidebar-ai-btn">
                <HelpCircle size={15} />
                <span>Generate Quiz</span>
                <ArrowLeft size={13} className="sidebar-ai-chevron" />
              </button>
            </div>
          </div>

          {/* Readability */}
          <div className="sidebar-block">
            <div className="sidebar-block-header">
              <span className="sidebar-block-title">READABILITY</span>
              <span className="sidebar-block-title">{Math.min(100, Math.max(0, Math.round(wordCount * 1.2)))}/100</span>
            </div>
            <div className="sidebar-progress-track">
              <div
                className="sidebar-progress-fill"
                style={{ width: `${Math.min(100, Math.round(wordCount * 1.2))}%` }}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TextEditorPage;