import { useState, useRef, useEffect } from 'react';
import { useTeam } from '../context/TeamContext';
import {
  UserPlus, MoreVertical, FileText, Activity, Plus, X,
  Copy, Check, PenTool, Send, Users, ArrowLeft, ChevronRight
} from 'lucide-react';
import './TeamNotes.css';

/* ─── helpers ─── */
const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'JUST NOW';
  if (diff < 3600) return `${Math.floor(diff / 60)}M AGO`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}H AGO`;
  return `${Math.floor(diff / 86400)}D AGO`;
};

const generateInviteLink = (teamId) =>
  `${window.location.origin}/invite/${teamId}-${Date.now().toString(36)}`;

/* ─── Create Team Modal ─── */
const CreateTeamModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');

  const handleSubmit = (e) => {
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
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <p className="modal-sub">Start a shared workspace for your study group, project team, or class.</p>
        <form onSubmit={handleSubmit} className="modal-form">
          <label className="modal-label">Team Name</label>
          <input
            className="modal-input"
            placeholder="e.g. Anatomy Study Group"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            required
          />
          <label className="modal-label" style={{ marginTop: 16 }}>Subject / Topic</label>
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

/* ─── Invite Modal ─── */
const InviteModal = ({ team, onClose }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState([]);
  const [copied, setCopied] = useState(false);
  const inviteLink = generateInviteLink(team.id);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink).catch(() => {});
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
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <p className="modal-label" style={{ marginBottom: 8 }}>Share invite link</p>
        <div className="invite-link-row">
          <span className="invite-link-text">{inviteLink}</span>
          <button className="invite-copy-btn" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="invite-divider"><span>or invite by email</span></div>

        <form onSubmit={handleSend} className="modal-form">
          <label className="modal-label">Email address</label>
          <div className="invite-email-row">
            <input
              className="modal-input"
              type="email"
              placeholder="teammate@university.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 999, padding: '10px 20px', whiteSpace: 'nowrap' }}>
              Send Invite
            </button>
          </div>
        </form>

        {sent.length > 0 && (
          <div className="invited-list">
            <p className="modal-label">Pending invites</p>
            {sent.map((e, i) => (
              <div key={i} className="invited-item">
                <div className="invited-dot" />
                {e}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Team List View (no team selected) ─── */
const TeamListView = ({ teams, onSelect, onCreateTeam }) => {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="team-notes-page">
      {showCreate && (
        <CreateTeamModal
          onClose={() => setShowCreate(false)}
          onCreate={onCreateTeam}
        />
      )}

      <div className="page-header" style={{ marginBottom: 40 }}>
        <div className="header-badge">
          <Users size={12} style={{ marginRight: 6 }} /> MY TEAMS
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 }}>
          <h1 className="text-5xl font-bold">Your Workspaces</h1>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={18} /> New Team
          </button>
        </div>
        <p className="text-secondary text-sm" style={{ marginTop: 8 }}>
          Collaborate in real-time with your study groups and class partners.
        </p>
      </div>

      {teams.length === 0 ? (
        <div className="teams-empty">
          <div className="teams-empty-icon"><Users size={40} /></div>
          <h3>No teams yet</h3>
          <p>Create your first team to start collaborating with classmates.</p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowCreate(true)}>
            <Plus size={18} /> Create Your First Team
          </button>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map(team => (
            <div key={team.id} className="team-card" onClick={() => onSelect(team.id)}>
              <div className="team-card-header">
                <span className="header-badge">{team.subject}</span>
                <ChevronRight size={18} className="text-secondary" />
              </div>
              <h3 className="team-card-name">{team.name}</h3>
              <div className="team-card-footer">
                <div className="team-avatars" style={{ marginLeft: 0 }}>
                  {team.members.slice(0, 3).map(m => (
                    <img key={m.id} src={m.avatar} alt={m.name} />
                  ))}
                  {team.members.length > 3 && (
                    <div className="avatar-more">+{team.members.length - 3}</div>
                  )}
                </div>
                <span className="member-count" style={{ marginLeft: 12 }}>
                  {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}

          {/* Create team card */}
          <div className="team-card team-card-create" onClick={() => setShowCreate(true)}>
            <div className="team-create-inner">
              <div className="team-create-icon"><Plus size={24} /></div>
              <span className="team-create-label">New Team</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main Team Workspace View ─── */
const TeamWorkspaceView = ({ team, notes, onOpenNote, onBack, allNotes }) => {
  const [showInvite, setShowInvite] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: team.members[0] || { name: 'Alex', avatar: 'https://i.pravatar.cc/150?u=alex' }, text: 'Has anyone uploaded the photos from today\'s lab yet?', isSelf: false },
    { id: 2, sender: team.members[1] || { name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=sarah' }, text: 'Working on it! Just resizing them so PeerPad doesn\'t crash lol.', isSelf: false },
    { id: 3, sender: { name: 'You', avatar: 'https://i.pravatar.cc/150?u=user' }, text: 'Perfect, I\'ll start linking them to the review sheet once you\'re done.', isSelf: true },
    {
      id: 4,
      sender: { name: 'PeerAI', avatar: null, isAI: true },
      text: 'I\'ve noticed you\'re adding a lot of content on nervous pathways. Want me to generate a summary card?',
      isSelf: false,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: { name: 'You', avatar: 'https://i.pravatar.cc/150?u=user' },
      text: chatInput.trim(),
      isSelf: true,
    }]);
    setChatInput('');
  };

  const handleCreateNote = (type) => {
    onOpenNote({ type, teamId: team.id, tag: team.name.toUpperCase() });
  };

  const filters = ['All', 'Exam Prep', 'Labs', 'Text', 'Drawing'];
  const filteredNotes = notes.filter(n => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Text') return n.type === 'text';
    if (activeFilter === 'Drawing') return n.type === 'drawing';
    return true;
  });

  return (
    <div className="team-notes-page">
      {showInvite && <InviteModal team={team} onClose={() => setShowInvite(false)} />}

      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={18} />
          </button>
          <div className="header-badge">
            <Activity size={12} style={{ marginRight: 6 }} /> {team.subject}
          </div>
        </div>

        <div className="title-row" style={{ marginTop: 8 }}>
          <h1 className="text-5xl font-bold">{team.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="team-avatars">
              {team.members.map(m => (
                <img key={m.id} src={m.avatar} alt={m.name} title={m.name} />
              ))}
              <span className="member-count">{team.members.length} Active Members</span>
            </div>
            <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
              <UserPlus size={18} /> Invite Member
            </button>
            <button className="btn-icon circle" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="content-layout" style={{ marginTop: 32 }}>
        {/* Left: Notebooks */}
        <div className="notebooks-section">
          <div className="section-header flex-between" style={{ marginBottom: 20 }}>
            <h2 className="text-xl font-bold">Team Notebooks</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="filter-pills">
                {filters.map(f => (
                  <button
                    key={f}
                    className={`pill ${activeFilter === f ? 'active' : ''}`}
                    onClick={() => setActiveFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button
                className="btn btn-primary"
                style={{ borderRadius: 999, padding: '8px 16px', fontSize: '13px', gap: 6, display: 'flex', alignItems: 'center' }}
                onClick={() => handleCreateNote('text')}
              >
                <Plus size={14} /> Add Note
              </button>
            </div>
          </div>

          {/* Notes grid — shared notes show here */}
          {filteredNotes.length === 0 ? (
            <div className="team-notes-empty">
              <p>No notes yet. Create the first team note!</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button className="action-pill-team" onClick={() => handleCreateNote('text')}>
                  <FileText size={16} /> Text Note
                </button>
                <button className="action-pill-team" onClick={() => handleCreateNote('drawing')}>
                  <PenTool size={16} /> Drawing
                </button>
              </div>
            </div>
          ) : (
            <div className="notebook-grid">
              {filteredNotes.map(note => (
                <div key={note.id} className="notebook-card p-6" onClick={() => onOpenNote(note)}>
                  <div className="icon-wrapper" style={{ marginBottom: 16 }}>
                    {note.type === 'text' ? <FileText size={22} /> : <PenTool size={22} />}
                  </div>
                  <h3 className="text-2xl font-bold" style={{ marginBottom: 8 }}>{note.title}</h3>
                  {note.type === 'text' && (
                    <p className="text-secondary text-sm" style={{ marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {note.content}
                    </p>
                  )}
                  {note.type === 'drawing' && (
                    <div style={{ height: 80, background: 'var(--bg-color)', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {note.dataURL
                        ? <img src={note.dataURL} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
                        : <PenTool size={20} style={{ opacity: 0.2 }} />
                      }
                    </div>
                  )}
                  <div className="card-footer flex-between" style={{ borderTop: '1px solid var(--divider-color)', paddingTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img src={team.members[0]?.avatar || 'https://i.pravatar.cc/150?u=user'} className="avatar-tiny" alt="" />
                      <span className="text-xs text-secondary">Team note</span>
                    </div>
                    <span className="text-xs font-bold text-secondary uppercase">{timeAgo(note.timestamp)}</span>
                  </div>
                </div>
              ))}

              {/* Quick-add card */}
              <div className="notebook-card notebook-card-add p-6" onClick={() => handleCreateNote('text')}>
                <div className="notebook-add-inner">
                  <div className="icon-wrapper"><Plus size={22} /></div>
                  <span className="text-sm font-bold" style={{ marginTop: 12, color: 'var(--text-secondary)' }}>New Note</span>
                </div>
              </div>
            </div>
          )}

          {/* Highlight / featured card */}
          {filteredNotes.length > 0 && (
            <div
              className="highlight-card"
              style={{ marginTop: 24, cursor: 'pointer' }}
              onClick={() => handleCreateNote('drawing')}
            >
              <div style={{ flex: 1, padding: 32 }}>
                <h3 className="text-2xl font-bold text-white" style={{ marginBottom: 8 }}>
                  Start a Collaborative Drawing
                </h3>
                <p style={{ color: '#9ca3af', fontSize: 14, width: '75%' }}>
                  Open a shared canvas — diagrams, mind maps, or sketches visible to all team members in real time.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="avatars-group" style={{ marginRight: 12 }}>
                    {team.members.slice(0, 2).map(m => (
                      <img key={m.id} src={m.avatar} alt="" />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>Collaborative Canvas</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: 'white', fontWeight: 700, letterSpacing: '0.1em' }}>
                    OPEN NOW →
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Live chat */}
        <div className="chat-section">
          <div className="chat-header flex-between" style={{ marginBottom: 20 }}>
            <h3 className="font-bold" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="dot-green" /> Live Discussion
            </h3>
            <span className="text-xs text-secondary font-bold uppercase">
              {team.members.length + 1} ONLINE
            </span>
          </div>

          <div className="chat-messages">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`message ${msg.isSelf ? 'self' : ''}`}>
                {!msg.isSelf && (
                  <div
                    className="avatar-small"
                    style={{
                      width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                      background: msg.sender.isAI ? '#000' : undefined,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {msg.sender.isAI
                      ? <Activity size={16} style={{ color: 'white' }} />
                      : <img src={msg.sender.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    }
                  </div>
                )}
                <div className="message-content" style={msg.isSelf ? { textAlign: 'right' } : {}}>
                  {!msg.isSelf && (
                    <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: msg.sender.isAI ? '#000' : 'var(--text-secondary)' }}>
                      {msg.sender.name}
                    </div>
                  )}
                  <div className={`message-bubble ${msg.isSelf ? 'bg-black text-white' : 'bg-gray'}`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form className="chat-input-wrapper" style={{ marginTop: 12 }} onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Send a message..."
              className="chat-input"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
            />
            <button type="submit" className="chat-send-btn btn-primary" style={{ background: 'var(--accent-color)', color: 'white', border: 'none', cursor: 'pointer' }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ─── Root export ─── */
const TeamNotes = ({ teams, activeTeamId, onSelectTeam, onCreateTeam, onOpenNote, teamNotes, allNotes }) => {
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
      allNotes={allNotes}
    />
  );
};

export default TeamNotes;