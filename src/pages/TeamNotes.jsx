import { useState, useRef, useEffect } from 'react';
import {
  UserPlus, MoreVertical, FileText, Activity, Plus, X,
  Copy, Check, PenTool, Users, ArrowLeft, ChevronRight, Trash2
} from 'lucide-react';
import './TeamNotes.css';

/* ── helpers ── */
const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const generateLink = (teamId) =>
  `${window.location.origin}/invite/${teamId}-${Date.now().toString(36)}`;

/* ── Delete Confirm ── */
const DeleteConfirm = ({ note, onConfirm, onCancel }) => (
  <div className="delete-overlay" onClick={onCancel}>
    <div className="delete-dialog" onClick={e => e.stopPropagation()}>
      <div className="delete-dialog-icon"><Trash2 size={22} /></div>
      <h3 className="delete-dialog-title">Move to Archive?</h3>
      <p className="delete-dialog-sub">
        <strong>"{note.title}"</strong> will move to your Archive and be permanently deleted after 30 days.
      </p>
      <div className="delete-dialog-actions">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn team-delete-confirm-btn" onClick={onConfirm}>
          <Trash2 size={14} /> Move to Archive
        </button>
      </div>
    </div>
  </div>
);

/* ── Note Card (team) ── */
const TeamNoteCard = ({ note, onOpen, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    setConfirmDelete(true);
  };

  const handleConfirm = () => {
    setDeleting(true);
    setTimeout(() => onDelete(note.id), 280);
  };

  return (
    <>
      {confirmDelete && (
        <DeleteConfirm note={note} onConfirm={handleConfirm} onCancel={() => setConfirmDelete(false)} />
      )}
      <div
        className={`team-note-card ${deleting ? 'card-deleting' : 'card-enter'}`}
        onClick={() => onOpen(note)}
      >
        <div className="tnc-top">
          <div className="tnc-icon">
            {note.type === 'text' ? <FileText size={16} /> : <PenTool size={16} />}
          </div>
          <button className="tnc-delete-btn" onClick={handleDelete} title="Delete">
            <Trash2 size={13} />
          </button>
        </div>

        <h3 className="tnc-title">{note.title}</h3>

        {note.type === 'text' && note.content && (
          <p className="tnc-desc">{note.content}</p>
        )}

        {note.type === 'drawing' && (
          <div className="tnc-drawing-preview">
            {note.dataURL
              ? <img src={note.dataURL} alt="Preview" />
              : <PenTool size={18} style={{ opacity: 0.2 }} />
            }
          </div>
        )}

        <div className="tnc-footer">
          <img src="https://i.pravatar.cc/150?u=user" className="tnc-avatar" alt="" />
          <span className="tnc-time">{timeAgo(note.timestamp)}</span>
        </div>
      </div>
    </>
  );
};

/* ── Create Team Modal ── */
const CreateTeamModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim(), subject: subject.trim().toUpperCase() || 'GENERAL' });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create a New Team</h2>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <p className="modal-sub">Start a shared workspace for your study group or class.</p>
        <form onSubmit={submit} className="modal-form">
          <label className="modal-label">Team Name *</label>
          <input
            className="modal-input"
            placeholder="e.g. Anatomy Study Group"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            required
          />
          <label className="modal-label" style={{ marginTop: 14 }}>Subject / Topic</label>
          <input
            className="modal-input"
            placeholder="e.g. Medical Science"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
          <button type="submit" className="btn btn-primary modal-submit">
            <Plus size={16} /> Create Team
          </button>
        </form>
      </div>
    </div>
  );
};

/* ── Invite Modal ── */
const InviteModal = ({ team, onClose }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState([]);
  const [copied, setCopied] = useState(false);
  const link = generateLink(team.id);

  const handleCopy = () => {
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSent(prev => [...prev, email.trim()]);
    setEmail('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Invite to {team.name}</h2>
          <button className="modal-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <label className="modal-label">Share invite link</label>
        <div className="invite-link-row">
          <span className="invite-link-text">{link}</span>
          <button className="invite-copy-btn" onClick={handleCopy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="invite-divider"><span>or invite by email</span></div>

        <form onSubmit={handleSend}>
          <label className="modal-label">Email address</label>
          <div className="invite-email-row">
            <input
              className="modal-input"
              type="email"
              placeholder="teammate@university.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 999, padding: '10px 18px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Send
            </button>
          </div>
        </form>

        {sent.length > 0 && (
          <div className="invited-list">
            <p className="modal-label">Pending invites</p>
            {sent.map((e, i) => (
              <div key={i} className="invited-item">
                <div className="invited-dot" />{e}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Team List (no team selected) ── */
const TeamListView = ({ teams, onSelect, onCreateTeam }) => {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="team-page">
      {showCreate && (
        <CreateTeamModal onClose={() => setShowCreate(false)} onCreate={onCreateTeam} />
      )}

      <div className="team-page-header">
        <div>
          <div className="header-badge" style={{ marginBottom: 12 }}>
            <Users size={11} style={{ marginRight: 6 }} />MY TEAMS
          </div>
          <h1 className="team-page-title">Your Workspaces</h1>
          <p className="team-page-sub">Collaborate in real-time with your study groups and class partners.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="teams-empty">
          <div className="teams-empty-icon"><Users size={36} /></div>
          <h3 className="teams-empty-title">No teams yet</h3>
          <p className="teams-empty-sub">Create your first team to start collaborating with classmates.</p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create Your First Team
          </button>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map(team => (
            <div key={team.id} className="team-card" onClick={() => onSelect(team.id)}>
              <div className="team-card-top">
                <span className="header-badge">{team.subject}</span>
                <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <h3 className="team-card-name">{team.name}</h3>
              <div className="team-card-footer">
                <div className="team-avatars-row">
                  {team.members.slice(0, 3).map(m => (
                    <img key={m.id} src={m.avatar} alt={m.name} />
                  ))}
                  {team.members.length > 3 && (
                    <div className="avatar-overflow">+{team.members.length - 3}</div>
                  )}
                </div>
                <span className="team-member-count">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          ))}

          <div className="team-card team-card-new" onClick={() => setShowCreate(true)}>
            <div className="team-card-new-inner">
              <div className="team-card-new-icon"><Plus size={22} /></div>
              <span>New Team</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Team Workspace ── */
const TeamWorkspaceView = ({ team, notes, onOpenNote, onBack, onDeleteNote }) => {
  const [showInvite, setShowInvite] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Exam Prep', 'Text', 'Drawing'];

  const filteredNotes = notes.filter(n => {
    if (activeFilter === 'All' || activeFilter === 'Exam Prep') return true;
    if (activeFilter === 'Text') return n.type === 'text';
    if (activeFilter === 'Drawing') return n.type === 'drawing';
    return true;
  });

  const handleCreateNote = (type) => {
    onOpenNote({ type, teamId: team.id, tag: team.name.toUpperCase() });
  };

  return (
    <div className="team-page">
      {showInvite && <InviteModal team={team} onClose={() => setShowInvite(false)} />}

      {/* Header */}
      <div className="team-workspace-header">
        <div className="team-workspace-header-left">
          <button className="back-btn" onClick={onBack}><ArrowLeft size={17} /></button>
          <div>
            <div className="header-badge" style={{ marginBottom: 6 }}>
              <Activity size={11} style={{ marginRight: 6 }} />{team.subject}
            </div>
            <h1 className="team-page-title">{team.name}</h1>
            <div className="team-members-row">
              {team.members.map(m => (
                <img key={m.id} src={m.avatar} alt={m.name} title={m.name} className="team-member-avatar" />
              ))}
              <span className="team-member-count" style={{ marginLeft: 8 }}>
                {team.members.length} active member{team.members.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="team-workspace-header-right">
          <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
            <UserPlus size={16} /> Invite Member
          </button>
          <button className="icon-btn"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Notebooks */}
      <div className="team-notebooks-header">
        <h2 className="team-notebooks-title">Team Notebooks</h2>
        <div className="team-notebooks-controls">
          <div className="filter-pills">
            {filters.map(f => (
              <button
                key={f}
                className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="team-add-btns">
            <button className="btn btn-secondary team-add-btn" onClick={() => handleCreateNote('text')}>
              <FileText size={14} /> Text Note
            </button>
            <button className="btn btn-secondary team-add-btn" onClick={() => handleCreateNote('drawing')}>
              <PenTool size={14} /> Drawing
            </button>
          </div>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="team-notes-empty">
          <div className="teams-empty-icon"><FileText size={30} /></div>
          <p className="teams-empty-title" style={{ fontSize: 16 }}>No notes yet</p>
          <p className="teams-empty-sub">Be the first to add a note to this team workspace.</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => handleCreateNote('text')}>
              <FileText size={15} /> Text Note
            </button>
            <button className="btn btn-secondary" onClick={() => handleCreateNote('drawing')}>
              <PenTool size={15} /> Drawing
            </button>
          </div>
        </div>
      ) : (
        <div className="team-notes-grid">
          {filteredNotes.map(note => (
            <TeamNoteCard
              key={note.id}
              note={note}
              onOpen={onOpenNote}
              onDelete={onDeleteNote}
            />
          ))}
          {/* Quick add tile */}
          <div className="team-add-tile" onClick={() => handleCreateNote('text')}>
            <Plus size={20} />
            <span>Add Note</span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Root ── */
const TeamNotes = ({ teams, activeTeamId, onSelectTeam, onCreateTeam, onOpenNote, onDeleteNote, teamNotes }) => {
  const activeTeam = teams.find(t => t.id === activeTeamId);

  if (!activeTeam) {
    return (
      <TeamListView
        teams={teams}
        onSelect={onSelectTeam}
        onCreateTeam={onCreateTeam}
      />
    );
  }

  return (
    <TeamWorkspaceView
      team={activeTeam}
      notes={teamNotes}
      onOpenNote={onOpenNote}
      onBack={() => onSelectTeam(null)}
      onDeleteNote={onDeleteNote}
    />
  );
};

export default TeamNotes;