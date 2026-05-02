import { useState, useRef, useEffect } from 'react';
import {
  UserPlus, MoreVertical, FileText, Activity, Plus, X,
  Copy, Check, PenTool, Users, ArrowLeft, ChevronRight,
  Trash2, LogOut, Upload, Mic, Sparkles, Send, StopCircle,
  ChevronDown, Tag
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
  <div className="tn-modal-overlay" onClick={onCancel}>
    <div className="tn-modal-box" onClick={e => e.stopPropagation()}>
      <div className="tn-delete-icon"><Trash2 size={22} /></div>
      <h3 className="tn-modal-title">Move to Archive?</h3>
      <p className="tn-modal-sub">
        <strong>"{note.title}"</strong> will be moved to your Archive and permanently deleted after 30 days.
      </p>
      <div className="tn-modal-actions">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn tn-delete-confirm-btn" onClick={onConfirm}>
          <Trash2 size={14} /> Move to Archive
        </button>
      </div>
    </div>
  </div>
);

/* ── Exit Team Confirm ── */
const ExitTeamConfirm = ({ team, onConfirm, onCancel }) => (
  <div className="tn-modal-overlay" onClick={onCancel}>
    <div className="tn-modal-box" onClick={e => e.stopPropagation()}>
      <div className="tn-exit-icon"><LogOut size={22} /></div>
      <h3 className="tn-modal-title">Leave "{team.name}"?</h3>
      <p className="tn-modal-sub">You'll lose access to all shared notes in this workspace. You can rejoin via an invite link.</p>
      <div className="tn-modal-actions">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn tn-exit-confirm-btn" onClick={onConfirm}>
          <LogOut size={14} /> Leave Team
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
            {note.type === 'text' ? <FileText size={16} /> :
             note.type === 'image' ? <span style={{ fontSize: 14 }}>🖼</span> :
             <PenTool size={16} />}
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

        {note.type === 'image' && note.dataURL && (
          <div className="tnc-drawing-preview">
            <img src={note.dataURL} alt="Preview" style={{ objectFit: 'cover' }} />
          </div>
        )}

        {note.subject && (
          <span className="tnc-subject-tag">{note.subject}</span>
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
  const [subjects, setSubjects] = useState(['', '', '']);

  const updateSubject = (i, val) => {
    const next = [...subjects];
    next[i] = val;
    setSubjects(next);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const validSubjects = subjects.map(s => s.trim()).filter(Boolean);
    onCreate({
      name: name.trim(),
      subjects: validSubjects.length > 0 ? validSubjects : ['GENERAL'],
    });
    onClose();
  };

  return (
    <div className="tn-modal-overlay" onClick={onClose}>
      <div className="tn-modal-box" onClick={e => e.stopPropagation()}>
        <div className="tn-modal-header">
          <h2 className="tn-modal-title">Create a New Team</h2>
          <button className="tn-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <p className="tn-modal-sub">Start a shared workspace for your study group or class.</p>
        <form onSubmit={submit} className="tn-modal-form">
          <label className="tn-modal-label">Team Name *</label>
          <input
            className="tn-modal-input"
            placeholder="e.g. Anatomy Study Group"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            required
          />

          <label className="tn-modal-label" style={{ marginTop: 16 }}>
            Subjects / Topics <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11, color: '#9ca3af' }}>(up to 3)</span>
          </label>
          {subjects.map((s, i) => (
            <input
              key={i}
              className="tn-modal-input"
              placeholder={`Subject ${i + 1}${i === 0 ? ' (required)' : ' (optional)'}`}
              value={s}
              onChange={e => updateSubject(i, e.target.value)}
              required={i === 0}
              style={{ marginBottom: i < 2 ? 8 : 0 }}
            />
          ))}

          <button type="submit" className="btn btn-primary tn-modal-submit">
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
    <div className="tn-modal-overlay" onClick={onClose}>
      <div className="tn-modal-box" onClick={e => e.stopPropagation()}>
        <div className="tn-modal-header">
          <h2 className="tn-modal-title">Invite to {team.name}</h2>
          <button className="tn-modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <label className="tn-modal-label">Share invite link</label>
        <div className="tn-invite-link-row">
          <span className="tn-invite-link-text">{link}</span>
          <button className="tn-invite-copy-btn" onClick={handleCopy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="tn-invite-divider"><span>or invite by email</span></div>

        <form onSubmit={handleSend}>
          <label className="tn-modal-label">Email address</label>
          <div className="tn-invite-email-row">
            <input
              className="tn-modal-input"
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
          <div className="tn-invited-list">
            <p className="tn-modal-label">Pending invites</p>
            {sent.map((e, i) => (
              <div key={i} className="tn-invited-item">
                <div className="tn-invited-dot" />{e}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── PDF Summary mini-modal (inside team) ── */
const TeamPDFSummary = ({ team, subjects, onSave, onClose }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [summary, setSummary] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0] || 'GENERAL');
  const fileRef = useRef(null);

  const handleFile = (f) => {
    if (!f || f.type !== 'application/pdf') return;
    setFile(f);
    setStatus('loading');
    setTimeout(() => {
      setSummary(`AI Summary of "${f.name}": This document covers key academic concepts. The main themes include foundational theory, practical applications, and critical analysis frameworks relevant to ${selectedSubject}.`);
      setStatus('done');
    }, 2500);
  };

  const handleSave = () => {
    onSave({
      title: `PDF Summary: ${file?.name || 'Document'}`,
      content: summary,
      type: 'text',
      subject: selectedSubject,
      tag: team.name.toUpperCase(),
      teamId: team.id,
    });
    onClose();
  };

  return (
    <div className="tn-modal-overlay" onClick={onClose}>
      <div className="tn-modal-box" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="tn-modal-header">
          <h2 className="tn-modal-title">PDF Summary</h2>
          <button className="tn-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <p className="tn-modal-sub">Upload a PDF and save the AI summary to your team workspace.</p>

        <label className="tn-modal-label">Subject</label>
        <select className="tn-modal-select" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {status === 'idle' && (
          <>
            <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            <button className="tn-upload-zone" onClick={() => fileRef.current?.click()}>
              <Upload size={24} />
              <span>Click to upload PDF</span>
            </button>
          </>
        )}

        {status === 'loading' && (
          <div className="tn-loading-state">
            <div className="tn-spinner" />
            <p>Analyzing document...</p>
          </div>
        )}

        {status === 'done' && (
          <div className="tn-summary-result">
            <p className="tn-summary-text">{summary}</p>
            <div className="tn-modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={onClose}>Discard</button>
              <button className="btn btn-primary" onClick={handleSave}>
                Save to Team
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Voice Transcribe mini-modal (inside team) ── */
const TeamVoiceTranscribe = ({ team, subjects, onSave, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0] || 'GENERAL');
  const [supported] = useState('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const recognitionRef = useRef(null);

  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SR();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.onresult = (e) => {
      let full = '';
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript;
      setTranscript(full);
    };
    recognitionRef.current.onend = () => setIsRecording(false);
    recognitionRef.current.start();
    setIsRecording(true);
    setTranscript('');
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const handleSave = () => {
    if (!transcript.trim()) return;
    onSave({
      title: `Voice Note — ${new Date().toLocaleDateString()}`,
      content: transcript,
      type: 'text',
      subject: selectedSubject,
      tag: team.name.toUpperCase(),
      teamId: team.id,
    });
    onClose();
  };

  return (
    <div className="tn-modal-overlay" onClick={onClose}>
      <div className="tn-modal-box" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="tn-modal-header">
          <h2 className="tn-modal-title">Voice Transcribe</h2>
          <button className="tn-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <p className="tn-modal-sub">Record and transcribe directly into your team workspace.</p>

        <label className="tn-modal-label">Subject</label>
        <select className="tn-modal-select" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {!supported && (
          <div className="tn-warning-box">Speech recognition requires Chrome or Edge.</div>
        )}

        <div className="tn-voice-wave">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className={`tn-wave-bar ${isRecording ? 'active' : ''}`} style={{ animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>

        <button
          className={`btn ${isRecording ? 'tn-stop-btn' : 'btn-primary'} tn-record-btn`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!supported}
        >
          {isRecording ? <><StopCircle size={16} /> Stop Recording</> : <><Mic size={16} /> Start Recording</>}
        </button>

        {transcript && (
          <div className="tn-transcript-box">
            <div className="tn-modal-label" style={{ marginBottom: 6 }}>Transcript</div>
            <div className="tn-transcript-text">{transcript}</div>
          </div>
        )}

        {transcript && (
          <div className="tn-modal-actions" style={{ marginTop: 12 }}>
            <button className="btn btn-secondary" onClick={onClose}>Discard</button>
            <button className="btn btn-primary" onClick={handleSave}>Save to Team</button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── FAB (same as home) ── */
const TeamFAB = ({ onAction }) => {
  const [open, setOpen] = useState(false);
  const fileRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onAction('image', ev.target.result);
    };
    reader.readAsDataURL(file);
    setOpen(false);
  };

  return (
    <div className="fab-container">
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
      {open && (
        <div className="fab-menu">
          <button className="fab-option" onClick={() => { setOpen(false); onAction('text'); }}>
            <FileText size={18} /><span>Text Note</span>
          </button>
          <button className="fab-option" onClick={() => { setOpen(false); onAction('drawing'); }}>
            <PenTool size={18} /><span>Drawing</span>
          </button>
          <button className="fab-option" onClick={() => fileRef.current?.click()}>
            <Upload size={18} /><span>Upload Image</span>
          </button>
          <button className="fab-option" onClick={() => { setOpen(false); onAction('pdf'); }}>
            <Sparkles size={18} /><span>PDF Summary</span>
          </button>
          <button className="fab-option" onClick={() => { setOpen(false); onAction('voice'); }}>
            <Mic size={18} /><span>Voice Note</span>
          </button>
        </div>
      )}
      <button className={`fab-btn ${open ? 'fab-open' : ''}`} onClick={() => setOpen(p => !p)}>
        {open ? <X size={24} /> : <Plus size={24} />}
      </button>
    </div>
  );
};

/* ── Subject Tabs ── */
const SubjectTabs = ({ subjects, active, onChange }) => (
  <div className="tn-subject-tabs">
    {subjects.map(s => (
      <button
        key={s}
        className={`tn-subject-tab ${active === s ? 'active' : ''}`}
        onClick={() => onChange(s)}
      >
        <Tag size={11} />{s}
      </button>
    ))}
    <button className={`tn-subject-tab ${active === 'all' ? 'active' : ''}`} onClick={() => onChange('all')}>
      All
    </button>
  </div>
);

/* ── Team List ── */
const TeamListView = ({ teams, onSelect, onCreateTeam, onExitTeam }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [exitConfirm, setExitConfirm] = useState(null);
  const [showInviteFor, setShowInviteFor] = useState(null);

  const handleExit = (team) => {
    setExitConfirm(null);
    onExitTeam(team.id);
  };

  return (
    <div className="tn-page">
      {showCreate && (
        <CreateTeamModal onClose={() => setShowCreate(false)} onCreate={onCreateTeam} />
      )}
      {exitConfirm && (
        <ExitTeamConfirm
          team={exitConfirm}
          onConfirm={() => handleExit(exitConfirm)}
          onCancel={() => setExitConfirm(null)}
        />
      )}
      {showInviteFor && (
        <InviteModal team={showInviteFor} onClose={() => setShowInviteFor(null)} />
      )}

      <div className="tn-list-header">
        <div>
          <div className="tn-badge"><Users size={11} style={{ marginRight: 6 }} />MY TEAMS</div>
          <h1 className="tn-list-title">Your Workspaces</h1>
          <p className="tn-list-sub">Collaborate in real-time with your study groups and class partners.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="tn-empty">
          <div className="tn-empty-icon"><Users size={36} /></div>
          <h3 className="tn-empty-title">No teams yet</h3>
          <p className="tn-empty-sub">Create your first team to start collaborating with classmates.</p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create Your First Team
          </button>
        </div>
      ) : (
        <div className="tn-teams-grid">
          {teams.map(team => (
            <div key={team.id} className="tn-team-card">
              {/* Main click area → open workspace */}
              <div className="tn-team-card-body" onClick={() => onSelect(team.id)}>
                <div className="tn-team-card-top">
                  <span className="tn-badge">{(team.subjects || [team.subject])[0]}</span>
                  <ChevronRight size={16} style={{ color: '#9ca3af' }} />
                </div>
                <h3 className="tn-team-card-name">{team.name}</h3>
                {team.subjects && team.subjects.length > 1 && (
                  <div className="tn-team-card-subjects">
                    {team.subjects.slice(1).map(s => (
                      <span key={s} className="tn-subject-mini">{s}</span>
                    ))}
                  </div>
                )}
                <div className="tn-team-card-footer">
                  <div className="tn-avatars-row">
                    {team.members.slice(0, 3).map(m => (
                      <img key={m.id} src={m.avatar} alt={m.name} />
                    ))}
                    {team.members.length > 3 && (
                      <div className="tn-avatar-overflow">+{team.members.length - 3}</div>
                    )}
                  </div>
                  <span className="tn-member-count">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              {/* Card action row */}
              <div className="tn-team-card-actions">
                <button
                  className="tn-card-action-btn"
                  onClick={e => { e.stopPropagation(); setShowInviteFor(team); }}
                  title="Invite member"
                >
                  <UserPlus size={14} />
                </button>
                <button
                  className="tn-card-action-btn tn-exit-btn"
                  onClick={e => { e.stopPropagation(); setExitConfirm(team); }}
                  title="Leave team"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          ))}

          <div className="tn-team-card-new" onClick={() => setShowCreate(true)}>
            <div className="tn-team-card-new-inner">
              <div className="tn-new-icon"><Plus size={22} /></div>
              <span>New Team</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Team Workspace ── */
const TeamWorkspaceView = ({ team, notes, onOpenNote, onBack, onDeleteNote, onExitTeam, onSaveNote }) => {
  const [showInvite, setShowInvite] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [activeSubject, setActiveSubject] = useState('all');
  const [showPDF, setShowPDF] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreRef = useRef(null);

  const subjects = team.subjects || (team.subject ? [team.subject] : ['GENERAL']);

  // Close more-menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setShowMoreMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredNotes = notes.filter(n =>
    activeSubject === 'all' ? true : n.subject === activeSubject
  );

  const handleCreateNote = (type) => {
    onOpenNote({ type, teamId: team.id, tag: team.name.toUpperCase() });
  };

  const handleFABAction = (type, dataURL) => {
    if (type === 'text') handleCreateNote('text');
    else if (type === 'drawing') handleCreateNote('drawing');
    else if (type === 'image' && dataURL) {
      onSaveNote({
        title: `Image — ${new Date().toLocaleDateString()}`,
        type: 'image',
        dataURL,
        teamId: team.id,
        tag: team.name.toUpperCase(),
      });
    } else if (type === 'pdf') setShowPDF(true);
    else if (type === 'voice') setShowVoice(true);
  };

  const handleExitConfirm = () => {
    setShowExitConfirm(false);
    onExitTeam(team.id);
    onBack();
  };

  return (
    <div className="tn-page">
      {showInvite && <InviteModal team={team} onClose={() => setShowInvite(false)} />}
      {showExitConfirm && (
        <ExitTeamConfirm team={team} onConfirm={handleExitConfirm} onCancel={() => setShowExitConfirm(false)} />
      )}
      {showPDF && (
        <TeamPDFSummary
          team={team}
          subjects={subjects}
          onSave={(noteData) => onSaveNote({ ...noteData, timestamp: new Date() })}
          onClose={() => setShowPDF(false)}
        />
      )}
      {showVoice && (
        <TeamVoiceTranscribe
          team={team}
          subjects={subjects}
          onSave={(noteData) => onSaveNote({ ...noteData, timestamp: new Date() })}
          onClose={() => setShowVoice(false)}
        />
      )}

      {/* Header */}
      <div className="tn-workspace-header">
        <div className="tn-workspace-header-left">
          <button className="tn-back-btn" onClick={onBack}><ArrowLeft size={17} /></button>
          <div>
            <div className="tn-badge" style={{ marginBottom: 8 }}>
              <Activity size={11} style={{ marginRight: 6 }} />
              {subjects[0]}
            </div>
            <h1 className="tn-workspace-title">{team.name}</h1>
            <div className="tn-members-row">
              {team.members.map(m => (
                <img key={m.id} src={m.avatar} alt={m.name} title={m.name} className="tn-member-avatar" />
              ))}
              <span className="tn-member-count" style={{ marginLeft: 10 }}>
                {team.members.length} member{team.members.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="tn-workspace-header-right">
          <button className="btn tn-pdf-btn" onClick={() => setShowPDF(true)}>
            <Sparkles size={15} /> AI Tools
          </button>
          <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
            <UserPlus size={16} /> Invite
          </button>
          {/* More menu */}
          <div className="tn-more-wrapper" ref={moreRef}>
            <button className="tn-icon-btn" onClick={() => setShowMoreMenu(p => !p)}>
              <MoreVertical size={18} />
            </button>
            {showMoreMenu && (
              <div className="tn-more-menu">
                <button className="tn-more-item tn-more-exit" onClick={() => { setShowMoreMenu(false); setShowExitConfirm(true); }}>
                  <LogOut size={15} /> Leave Team
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subject filter + notebooks header */}
      <div className="tn-notebooks-header">
        <div className="tn-notebooks-title-row">
          <h2 className="tn-notebooks-title">Team Notebooks</h2>
          <div className="tn-notebooks-btns">
            <button className="btn btn-secondary tn-add-btn" onClick={() => handleCreateNote('text')}>
              <FileText size={14} /> Text Note
            </button>
            <button className="btn btn-secondary tn-add-btn" onClick={() => handleCreateNote('drawing')}>
              <PenTool size={14} /> Drawing
            </button>
          </div>
        </div>
        <SubjectTabs subjects={subjects} active={activeSubject} onChange={setActiveSubject} />
      </div>

      {/* Notes grid */}
      {filteredNotes.length === 0 ? (
        <div className="tn-notes-empty">
          <div className="tn-empty-icon" style={{ margin: '0 auto 14px' }}><FileText size={28} /></div>
          <p className="tn-empty-title" style={{ fontSize: 16, marginBottom: 6 }}>No notes yet</p>
          <p className="tn-empty-sub">Be the first to add a note to this workspace.</p>
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
        <div className="tn-notes-grid">
          {filteredNotes.map(note => (
            <TeamNoteCard
              key={note.id}
              note={note}
              onOpen={onOpenNote}
              onDelete={onDeleteNote}
            />
          ))}
          <div className="tn-add-tile" onClick={() => handleCreateNote('text')}>
            <Plus size={20} />
            <span>Add Note</span>
          </div>
        </div>
      )}

      {/* FAB */}
      <TeamFAB onAction={handleFABAction} />
    </div>
  );
};

/* ── Root ── */
const TeamNotes = ({ teams, activeTeamId, onSelectTeam, onCreateTeam, onOpenNote, onDeleteNote, teamNotes, onExitTeam, onSaveNote }) => {
  const activeTeam = teams.find(t => t.id === activeTeamId);

  if (!activeTeam) {
    return (
      <TeamListView
        teams={teams}
        onSelect={onSelectTeam}
        onCreateTeam={onCreateTeam}
        onExitTeam={onExitTeam}
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
      onExitTeam={onExitTeam}
      onSaveNote={onSaveNote}
    />
  );
};

export default TeamNotes;