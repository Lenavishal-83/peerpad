import { useState } from 'react';
import { Search, FileText, PenTool, Grid, List, Plus, X, Trash2 } from 'lucide-react';
import './Dashboard.css';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// Confirm delete dialog
const DeleteConfirm = ({ note, onConfirm, onCancel }) => (
  <div className="delete-overlay" onClick={onCancel}>
    <div className="delete-dialog" onClick={e => e.stopPropagation()}>
      <div className="delete-dialog-icon"><Trash2 size={22} /></div>
      <h3 className="delete-dialog-title">Move to Archive?</h3>
      <p className="delete-dialog-sub">
        <strong>"{note.title}"</strong> will be moved to your Archive and permanently deleted after 30 days.
      </p>
      <div className="delete-dialog-actions">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn delete-confirm-btn" onClick={onConfirm}>
          <Trash2 size={15} /> Move to Archive
        </button>
      </div>
    </div>
  </div>
);

// Single note card
const NoteCard = ({ note, onOpen, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    setConfirmDelete(true);
  };

  const handleConfirm = () => {
    setDeleting(true);
    setTimeout(() => onDelete(note.id), 300); // wait for fade-out animation
  };

  return (
    <>
      {confirmDelete && (
        <DeleteConfirm
          note={note}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
      <div
        className={`entry-card ${deleting ? 'card-deleting' : 'card-enter'}`}
        onClick={() => onOpen(note)}
      >
        <div className="card-top">
          <div className="card-icon">
            {note.type === 'text'
              ? <FileText size={16} />
              : <PenTool size={16} />
            }
          </div>
          <div className="card-top-right">
            <span className="badge">{note.tag || 'PERSONAL'}</span>
            <button className="card-delete-btn" onClick={handleDelete} title="Delete note">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <h3 className="card-title">{note.title}</h3>

        {note.type === 'text' && note.content && (
          <p className="card-desc">{note.content}</p>
        )}

        {note.type === 'drawing' && (
          <div className="card-drawing-preview">
            {note.dataURL
              ? <img src={note.dataURL} alt="Drawing preview" />
              : <PenTool size={20} style={{ opacity: 0.2 }} />
            }
          </div>
        )}

        <div className="card-footer">
          <img src="https://i.pravatar.cc/150?u=user" className="card-avatar" alt="" />
          <span className="time-ago">{timeAgo(note.timestamp)}</span>
        </div>
      </div>
    </>
  );
};

const Dashboard = ({ notes = [], onOpenNote, onDeleteNote }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [fabOpen, setFabOpen] = useState(false);

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search your sanctuary..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="header-actions">
          <button className="nav-tab active">Notes</button>
          <button className="nav-tab">Collections</button>
          <button className="nav-tab">Shared</button>
          <img src="https://i.pravatar.cc/150?u=user" className="header-avatar" alt="User" />
        </div>
      </header>

      <div className="dashboard-content">
        {/* Hero */}
        <div className="hero-section">
          <h1 className="hero-title">
            All Your Notes.<br />
            <span className="hero-italic">Powered by AI.</span>
          </h1>
          <p className="hero-sub">Your personal academic sanctuary. Capture, organize, and study smarter.</p>
        </div>

        {/* Quick actions — only Text Note + Drawing */}
        <div className="quick-actions">
          <button className="action-pill" onClick={() => onOpenNote({ type: 'text' })}>
            <FileText size={16} />
            <span>Text Note</span>
          </button>
          <button className="action-pill" onClick={() => onOpenNote({ type: 'drawing' })}>
            <PenTool size={16} />
            <span>Drawing</span>
          </button>
        </div>

        {/* Notes section */}
        <div className="entries-section">
          <div className="entries-header">
            <h2 className="entries-label">RECENT ENTRIES</h2>
            <div className="view-toggles">
              <button
                className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={15} />
              </button>
              <button
                className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={15} />
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><FileText size={32} /></div>
              <p className="empty-title">No notes yet</p>
              <p className="empty-sub">Create your first note using the + button below or the quick actions above.</p>
            </div>
          ) : (
            <div className={`entries-grid ${viewMode === 'list' ? 'entries-list' : ''}`}>
              {filtered.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onOpen={onOpenNote}
                  onDelete={onDeleteNote}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Google Keep-style FAB */}
      <div className="fab-container">
        {fabOpen && (
          <div className="fab-menu">
            <button
              className="fab-option"
              onClick={() => { setFabOpen(false); onOpenNote({ type: 'text' }); }}
            >
              <FileText size={18} />
              <span>Text Note</span>
            </button>
            <button
              className="fab-option"
              onClick={() => { setFabOpen(false); onOpenNote({ type: 'drawing' }); }}
            >
              <PenTool size={18} />
              <span>Drawing</span>
            </button>
          </div>
        )}
        <button
          className={`fab-btn ${fabOpen ? 'fab-open' : ''}`}
          onClick={() => setFabOpen(prev => !prev)}
          title="Create note"
        >
          {fabOpen ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;