import { useState, useRef, useCallback, useEffect } from 'react';
import {
  UserPlus, MoreVertical, FileText, Activity, Plus, X,
  Copy, Check, PenTool, Users, ArrowLeft, ChevronRight, Trash2,
  LogOut, BookOpen, Mic, Upload, StopCircle, Mail, Image,
  CheckCircle, AlertCircle, Loader, Download
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

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

/* ── AI suggestion ── */
async function fetchAISuggestion(text, subject) {
  try {
    if (text.trim().length < 20) return '';
    const sentences = text.trim().split(/[.!?]+/).filter(s => s.trim().length > 3);
    const lastSentence = sentences[sentences.length - 1]?.trim();
    if (!lastSentence) return '';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 40,
        messages: [{
          role: 'user',
          content: `You are an academic note-taking autocomplete for a ${subject || 'general'} class. Continue this partial sentence naturally with 5-12 words. Return ONLY the continuation, no quotes, no explanation.\n\nPartial text: "${lastSentence}"`
        }]
      })
    });
    if (!response.ok) return '';
    const data = await response.json();
    return data.content?.[0]?.text?.trim().replace(/^["']|["']$/g, '') || '';
  } catch { return ''; }
}

/* ── Mock PDF summarizer ── */
const mockSummarize = (fileName) =>
  new Promise(resolve => setTimeout(() => resolve({
    title: fileName.replace(/\.pdf$/i, ''),
    keyPoints: [
      'Key concept identified from the document structure and content overview.',
      'Secondary concept with supporting evidence and examples for academic context.',
      'Third insight connecting the material to broader subject themes and applications.',
    ],
    wordCount: Math.floor(Math.random() * 6000) + 1000,
    confidence: Math.floor(Math.random() * 10) + 88,
  }), 2500));

/* ── Delete Confirm ── */
const DeleteConfirm = ({ note, onConfirm, onCancel }) => (
  <div className="tn-delete-overlay" onClick={onCancel}>
    <div className="tn-delete-dialog" onClick={e => e.stopPropagation()}>
      <div className="tn-delete-icon"><Trash2 size={22} /></div>
      <h3>Move to Archive?</h3>
      <p><strong>"{note.title}"</strong> will move to Archive and be permanently deleted after 30 days.</p>
      <div className="tn-delete-actions">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn tn-delete-confirm-btn" onClick={onConfirm}>
          <Trash2 size={14} /> Move to Archive
        </button>
      </div>
    </div>
  </div>
);

/* ── Note card per-note collab modal ── */
const NoteCollabModal = ({ note, onClose }) => {
  const [email, setEmail] = useState('');
  const [invited, setInvited] = useState([]);
  const [sending, setSending] = useState(false);

  const handleInvite = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setTimeout(() => {
      setInvited(prev => [...prev, email.trim()]);
      setEmail('');
      setSending(false);
    }, 600);
  };

  return (
    <div className="tn-modal-overlay" onClick={onClose}>
      <div className="tn-modal-box" onClick={e => e.stopPropagation()}>
        <div className="tn-modal-header">
          <div>
            <h2 className="tn-modal-title">Collaborate on Note</h2>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>"{note?.title}"</p>
          </div>
          <button className="tn-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
          Invite collaborators to this specific note. Independent of team membership.
        </p>
        <form onSubmit={handleInvite}>
          <label className="tn-modal-label">Email address</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="collaborator@university.edu"
              className="tn-modal-input"
              autoFocus
            />
            <button
              type="submit"
              disabled={sending}
              className="btn btn-primary"
              style={{ borderRadius: 999, padding: '10px 18px', whiteSpace: 'nowrap', flexShrink: 0, opacity: sending ? 0.6 : 1 }}
            >
              {sending ? '…' : 'Invite'}
            </button>
          </div>
        </form>
        {invited.length > 0 && (
          <div style={{ marginTop: 16, borderTop: '1px solid var(--divider-color)', paddingTop: 12 }}>
            <p className="tn-modal-label">Pending invites</p>
            {invited.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34C759' }} />
                <span>{e}</span>
                <Check size={13} color="#34C759" style={{ marginLeft: 'auto' }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Team Note Card ── */
const TeamNoteCard = ({ note, onOpen, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showCollab, setShowCollab] = useState(false);

  const handleDelete = (e) => { e.stopPropagation(); setConfirmDelete(true); };
  const handleCollab = (e) => { e.stopPropagation(); setShowCollab(true); };
  const handleConfirm = () => { setDeleting(true); setTimeout(() => onDelete(note.id), 280); };

  return (
    <>
      {confirmDelete && <DeleteConfirm note={note} onConfirm={handleConfirm} onCancel={() => setConfirmDelete(false)} />}
      {showCollab && <NoteCollabModal note={note} onClose={() => setShowCollab(false)} />}
      <div className={`tnc ${deleting ? 'tnc-deleting' : 'tnc-enter'}`} onClick={() => onOpen(note)}>
        <div className="tnc-top">
          <div className="tnc-icon">
            {note.type === 'text' ? <FileText size={16} /> : <PenTool size={16} />}
          </div>
          <div className="tnc-actions">
            <button className="tnc-action-btn" onClick={handleCollab} title="Collaborate">
              <Mail size={12} />
            </button>
            <button className="tnc-action-btn tnc-delete" onClick={handleDelete} title="Delete">
              <Trash2 size={12} />
            </button>
          </div>
        </div>
        <h3 className="tnc-title">{note.title}</h3>
        {note.type === 'text' && note.content && <p className="tnc-desc">{note.content}</p>}
        {note.type === 'drawing' && (
          <div className="tnc-drawing-preview">
            {note.dataURL ? <img src={note.dataURL} alt="Preview" /> : <PenTool size={18} style={{ opacity: 0.2 }} />}
          </div>
        )}
        {note.images?.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
            {note.images.slice(0, 3).map(img => (
              <img key={img.id} src={img.url} alt="" style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--divider-color)' }} />
            ))}
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
  const [subjects, setSubjects] = useState(['', '', '']);

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const validSubjects = subjects.filter(s => s.trim()).map(s => s.trim().toUpperCase());
    onCreate({ name: name.trim(), subjects: validSubjects.length > 0 ? validSubjects : ['GENERAL'] });
    onClose();
  };

  return (
    <div className="tn-modal-overlay" onClick={onClose}>
      <div className="tn-modal-box" onClick={e => e.stopPropagation()}>
        <div className="tn-modal-header">
          <h2 className="tn-modal-title">Create a New Team</h2>
          <button className="tn-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
          Start a shared workspace. Add up to 3 subjects for your team.
        </p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <label className="tn-modal-label">Team Name *</label>
          <input className="tn-modal-input" style={{ marginTop: 6, marginBottom: 16 }} placeholder="e.g. Anatomy Study Group" value={name} onChange={e => setName(e.target.value)} autoFocus required />
          
          <label className="tn-modal-label">Subjects (up to 3)</label>
          {subjects.map((s, i) => (
            <input
              key={i}
              className="tn-modal-input"
              style={{ marginTop: 8 }}
              placeholder={`Subject ${i + 1}${i === 0 ? ' *' : ' (optional)'}`}
              value={s}
              onChange={e => { const n = [...subjects]; n[i] = e.target.value; setSubjects(n); }}
              required={i === 0}
            />
          ))}
          <button type="submit" className="btn btn-primary" style={{ marginTop: 20, borderRadius: 999, padding: '12px 24px', justifyContent: 'center', fontSize: 15 }}>
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
          <button className="tn-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <label className="tn-modal-label">Share invite link</label>
        <div className="tn-invite-link-row">
          <span className="tn-invite-link-text">{link}</span>
          <button className="tn-invite-copy-btn" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="tn-invite-divider"><span>or invite by email</span></div>

        <form onSubmit={handleSend}>
          <label className="tn-modal-label">Email address</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input className="tn-modal-input" type="email" placeholder="teammate@university.edu" value={email} onChange={e => setEmail(e.target.value)} />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 999, padding: '10px 18px', whiteSpace: 'nowrap', flexShrink: 0 }}>Send</button>
          </div>
        </form>

        {sent.length > 0 && (
          <div style={{ marginTop: 16, borderTop: '1px solid var(--divider-color)', paddingTop: 12 }}>
            <p className="tn-modal-label">Pending invites</p>
            {sent.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                {e}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Exit Team Confirm ── */
const ExitTeamConfirm = ({ team, onConfirm, onCancel }) => (
  <div className="tn-delete-overlay" onClick={onCancel}>
    <div className="tn-delete-dialog" onClick={e => e.stopPropagation()}>
      <div className="tn-delete-icon" style={{ background: '#fef3c7', color: '#d97706' }}><LogOut size={22} /></div>
      <h3>Exit Team?</h3>
      <p>You'll leave <strong>"{team.name}"</strong> and lose access to shared notes. You can rejoin via invite link.</p>
      <div className="tn-delete-actions">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn tn-exit-confirm-btn" onClick={onConfirm}>
          <LogOut size={14} /> Exit Team
        </button>
      </div>
    </div>
  </div>
);

/* ── Team PDF Summarizer (inline in workspace) ── */
const TeamPDFSummarizer = ({ onSave, teamSubject }) => {
  const [status, setStatus] = useState('idle');
  const [summary, setSummary] = useState(null);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef(null);
  const progressRef = useRef(null);

  const handleFile = async (f) => {
    if (!f || f.type !== 'application/pdf') return;
    setFileName(f.name);
    setStatus('parsing');
    setProgress(0);
    let p = 0;
    progressRef.current = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 90) { clearInterval(progressRef.current); p = 90; }
      setProgress(Math.min(p, 90));
    }, 180);
    try {
      const result = await mockSummarize(f.name);
      clearInterval(progressRef.current);
      setProgress(100);
      setSummary(result);
      setStatus('done');
    } catch { setStatus('error'); }
  };

  const reset = () => { setStatus('idle'); setSummary(null); setProgress(0); setFileName(''); };

  return (
    <div className="tn-tool-card">
      <div className="tn-tool-card-header">
        <div className="tn-tool-icon"><BookOpen size={16} /></div>
        <div>
          <div className="tn-tool-title">PDF Summarizer</div>
          <div className="tn-tool-sub">AI-powered summary for the team</div>
        </div>
      </div>

      {status === 'idle' && (
        <div
          className="tn-drop-zone"
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        >
          <Upload size={20} />
          <span>Drop PDF or click to upload</span>
          <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}

      {status === 'parsing' && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <Loader size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>Analyzing {fileName}…</p>
          <div style={{ height: 4, background: 'var(--bg-color)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#000', borderRadius: 99, transition: 'width 0.25s ease' }} />
          </div>
        </div>
      )}

      {status === 'error' && (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <AlertCircle size={20} color="#ef4444" />
          <p style={{ fontSize: 13, marginTop: 6 }}>Failed. <button onClick={reset} style={{ color: 'blue', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Try again</button></p>
        </div>
      )}

      {status === 'done' && summary && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <CheckCircle size={15} color="#16a34a" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>Summary Ready</span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{summary.title}</p>
          <ol style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {summary.keyPoints.map((pt, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12, lineHeight: 1.5, alignItems: 'flex-start' }}>
                <span style={{ width: 18, height: 18, minWidth: 18, background: '#000', color: '#fff', borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>{i + 1}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{pt}</span>
              </li>
            ))}
          </ol>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={() => { onSave({ title: `PDF Summary: ${summary.title}`, content: summary.keyPoints.join('\n'), type: 'text' }); reset(); }}
              className="btn btn-primary"
              style={{ flex: 1, borderRadius: 999, padding: '8px 14px', fontSize: 12, justifyContent: 'center' }}
            >
              Save to Team
            </button>
            <button onClick={reset} className="btn btn-secondary" style={{ borderRadius: 999, padding: '8px 14px', fontSize: 12 }}>New</button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Team Voice Transcriber ── */
const TeamVoiceTranscriber = ({ onSave }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [supported] = useState(() => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  const startRecording = () => {
    if (!supported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SR();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.onresult = (e) => {
      let full = '';
      for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript;
      setTranscript(full);
    };
    recognitionRef.current.onend = () => { setIsRecording(false); clearInterval(timerRef.current); };
    recognitionRef.current.start();
    setIsRecording(true);
    setTranscript('');
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(t => t + 1), 1000);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    clearInterval(timerRef.current);
    setIsRecording(false);
  };

  return (
    <div className="tn-tool-card">
      <div className="tn-tool-card-header">
        <div className="tn-tool-icon" style={{ background: isRecording ? '#ef4444' : '#000' }}><Mic size={16} /></div>
        <div>
          <div className="tn-tool-title">Voice Transcriber</div>
          <div className="tn-tool-sub">Record lectures for the team</div>
        </div>
      </div>

      {!supported && (
        <p style={{ fontSize: 12, color: '#f59e0b', background: '#fef3c7', padding: '8px 10px', borderRadius: 8 }}>Use Chrome or Edge for speech recognition.</p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 32, justifyContent: 'center', margin: '8px 0' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{
            width: 3, borderRadius: 2,
            background: isRecording ? '#000' : 'var(--border-color)',
            height: isRecording ? `${Math.random() * 24 + 4}px` : `${[8, 16, 24, 14, 20, 12, 28, 10, 22, 16, 18, 8][i]}px`,
            animation: isRecording ? `teamWave${(i % 3) + 1} ${0.5 + (i % 3) * 0.2}s ease-in-out infinite alternate` : 'none',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={!supported}
        style={{
          width: '100%', padding: '9px 0', borderRadius: 999, border: 'none',
          background: isRecording ? '#ef4444' : '#000', color: '#fff',
          fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: 8,
          opacity: supported ? 1 : 0.4,
        }}
      >
        {isRecording ? <><StopCircle size={15} /> Stop — {formatTime(elapsed)}</> : <><Mic size={15} /> Start Recording</>}
      </button>

      {transcript && (
        <div style={{ marginTop: 10 }}>
          <div style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 12px', fontSize: 12, lineHeight: 1.6, color: 'var(--text-primary)', maxHeight: 100, overflowY: 'auto' }}>
            {transcript}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={() => { onSave({ title: `Voice Note — ${new Date().toLocaleDateString()}`, content: transcript, type: 'text' }); setTranscript(''); }}
              className="btn btn-primary"
              style={{ flex: 1, borderRadius: 999, padding: '7px 12px', fontSize: 12, justifyContent: 'center' }}
            >
              Save to Team
            </button>
            <button onClick={() => setTranscript('')} className="btn btn-secondary" style={{ borderRadius: 999, padding: '7px 12px', fontSize: 12 }}>
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Team List ── */
const TeamListView = ({ teams, onSelect, onCreateTeam, onExitTeam }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [exitTarget, setExitTarget] = useState(null);

  return (
    <div className="team-page">
      {showCreate && <CreateTeamModal onClose={() => setShowCreate(false)} onCreate={onCreateTeam} />}
      {exitTarget && <ExitTeamConfirm team={exitTarget} onConfirm={() => { onExitTeam(exitTarget.id); setExitTarget(null); }} onCancel={() => setExitTarget(null)} />}

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
            <div key={team.id} className="team-card">
              <div className="team-card-top" onClick={() => onSelect(team.id)} style={{ cursor: 'pointer', flex: 1 }}>
                <span className="header-badge">{team.subjects?.[0] || team.subject || 'GENERAL'}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    title="Invite member"
                    onClick={e => { e.stopPropagation(); }}
                    className="tn-card-icon-btn"
                  >
                    <UserPlus size={14} />
                  </button>
                  <button
                    title="Exit team"
                    onClick={e => { e.stopPropagation(); setExitTarget(team); }}
                    className="tn-card-icon-btn tn-card-exit-btn"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              </div>
              <h3 className="team-card-name" onClick={() => onSelect(team.id)} style={{ cursor: 'pointer' }}>{team.name}</h3>
              {team.subjects?.length > 1 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {team.subjects.slice(1).map(s => (
                    <span key={s} style={{ fontSize: 10, fontWeight: 600, background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: 99, padding: '2px 8px', color: 'var(--text-secondary)' }}>{s}</span>
                  ))}
                </div>
              )}
              <div className="team-card-footer" onClick={() => onSelect(team.id)} style={{ cursor: 'pointer' }}>
                <div className="team-avatars-row">
                  {team.members.slice(0, 3).map(m => <img key={m.id} src={m.avatar} alt={m.name} />)}
                  {team.members.length > 3 && <div className="avatar-overflow">+{team.members.length - 3}</div>}
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

/* ── Active Collab Indicator (simulated) ── */
const ActiveCollabBar = ({ team }) => {
  const [activeUsers, setActiveUsers] = useState(team.members.slice(0, 2));
  const [typing, setTyping] = useState('');

  useEffect(() => {
    const msgs = [`${team.members[0]?.name || 'Alex'} is typing…`, '', `${team.members[1]?.name || 'Sarah'} is editing…`, ''];
    let i = 0;
    const t = setInterval(() => { setTyping(msgs[i % msgs.length]); i++; }, 3000);
    return () => clearInterval(t);
  }, [team.members]);

  return (
    <div className="tn-collab-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div className="tn-live-dot" />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Live</span>
        <div style={{ display: 'flex', marginLeft: 4 }}>
          {activeUsers.map(u => <img key={u.id} src={u.avatar} alt={u.name} title={u.name} style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid var(--surface-color)', marginLeft: -4, objectFit: 'cover' }} />)}
        </div>
      </div>
      {typing && <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontStyle: 'italic' }}>{typing}</span>}
    </div>
  );
};

/* ── Add Subject Modal ── */
const AddSubjectModal = ({ team, onAdd, onClose }) => {
  const [subject, setSubject] = useState('');
  const remaining = Math.max(0, 3 - (team.subjects?.length || 1));

  const submit = (e) => {
    e.preventDefault();
    if (!subject.trim() || remaining <= 0) return;
    onAdd(subject.trim().toUpperCase());
    onClose();
  };

  return (
    <div className="tn-modal-overlay" onClick={onClose}>
      <div className="tn-modal-box" onClick={e => e.stopPropagation()}>
        <div className="tn-modal-header">
          <h2 className="tn-modal-title">Add Subject</h2>
          <button className="tn-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        {remaining <= 0 ? (
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>This team already has 3 subjects (max). Remove one first.</p>
        ) : (
          <form onSubmit={submit}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>You can add {remaining} more subject{remaining !== 1 ? 's' : ''}.</p>
            <label className="tn-modal-label">New Subject</label>
            <input className="tn-modal-input" style={{ marginTop: 6 }} placeholder="e.g. Biochemistry" value={subject} onChange={e => setSubject(e.target.value)} autoFocus required />
            <button type="submit" className="btn btn-primary" style={{ marginTop: 16, borderRadius: 999, padding: '10px 20px', justifyContent: 'center', width: '100%' }}>
              Add Subject
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

/* ── Team Workspace ── */
const TeamWorkspaceView = ({ team, notes, onOpenNote, onBack, onDeleteNote, onUpdateTeam, onExitTeam }) => {
  const [showInvite, setShowInvite] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSubject, setActiveSubject] = useState(team.subjects?.[0] || team.subject || 'GENERAL');
  const [showTools, setShowTools] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const imageInputRef = useRef(null);

  const filters = ['All', 'Text', 'Drawing'];
  const subjects = team.subjects || [team.subject || 'GENERAL'];

  const filteredNotes = notes.filter(n => {
    if (activeFilter === 'Text') return n.type === 'text';
    if (activeFilter === 'Drawing') return n.type === 'drawing';
    return true;
  });

  const handleCreateNote = (type) => {
    setFabOpen(false);
    onOpenNote({ type, teamId: team.id, tag: team.name.toUpperCase(), subject: activeSubject });
  };

  const handleSaveToolNote = (noteData) => {
    onOpenNote({ ...noteData, teamId: team.id, tag: team.name.toUpperCase(), subject: activeSubject });
  };

  const handleAddSubject = (sub) => {
    const newSubjects = [...subjects, sub];
    onUpdateTeam(team.id, { subjects: newSubjects });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onOpenNote({
        type: 'image',
        teamId: team.id,
        tag: team.name.toUpperCase(),
        title: files[0].name.replace(/\.[^.]+$/, ''),
        images: [{ id: Date.now(), url: ev.target.result, name: files[0].name }],
        content: '',
        subject: activeSubject
      });
    };
    reader.readAsDataURL(files[0]);
  };

  return (
    <div className="team-page" style={{ position: 'relative' }}>
      {showInvite && <InviteModal team={team} onClose={() => setShowInvite(false)} />}
      {showAddSubject && <AddSubjectModal team={{ ...team, subjects }} onAdd={handleAddSubject} onClose={() => setShowAddSubject(false)} />}
      {showExit && <ExitTeamConfirm team={team} onConfirm={() => { onExitTeam(); setShowExit(false); }} onCancel={() => setShowExit(false)} />}

      <input ref={imageInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageUpload} />

      {/* Active collab bar */}
      <ActiveCollabBar team={team} />

      {/* Header */}
      <div className="team-workspace-header">
        <div className="team-workspace-header-left">
          <button className="back-btn" onClick={onBack}><ArrowLeft size={17} /></button>
          <div>
            <div className="header-badge" style={{ marginBottom: 6 }}>
              <Activity size={11} style={{ marginRight: 6 }} />{activeSubject}
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
            <UserPlus size={16} /> Invite
          </button>
          <button className="icon-btn" title="Exit Team" onClick={() => setShowExit(true)}>
            <LogOut size={16} />
          </button>
          <button className="icon-btn" onClick={() => setShowTools(v => !v)} title="AI Tools">
            <BookOpen size={16} />
          </button>
          <button className="icon-btn"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Subject tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        {subjects.map(s => (
          <button
            key={s}
            onClick={() => setActiveSubject(s)}
            className={`filter-pill ${activeSubject === s ? 'active' : ''}`}
          >
            {s}
          </button>
        ))}
        {subjects.length < 3 && (
          <button className="filter-pill" onClick={() => setShowAddSubject(true)} style={{ border: '1px dashed var(--border-color)' }}>
            <Plus size={12} style={{ marginRight: 4 }} />Add Subject
          </button>
        )}
      </div>

      {/* AI Tools panel */}
      {showTools && (
        <div className="tn-tools-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Team AI Tools</h3>
            <button onClick={() => setShowTools(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={16} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <TeamPDFSummarizer onSave={handleSaveToolNote} teamSubject={activeSubject} />
            <TeamVoiceTranscriber onSave={handleSaveToolNote} />
          </div>
        </div>
      )}

      {/* Notebooks header */}
      <div className="team-notebooks-header">
        <h2 className="team-notebooks-title">Team Notebooks</h2>
        <div className="team-notebooks-controls">
          <div className="filter-pills">
            {filters.map(f => (
              <button key={f} className={`filter-pill ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>
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
          <p className="teams-empty-sub">Be the first to add a note to this workspace.</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => handleCreateNote('text')}><FileText size={15} /> Text Note</button>
            <button className="btn btn-secondary" onClick={() => handleCreateNote('drawing')}><PenTool size={15} /> Drawing</button>
          </div>
        </div>
      ) : (
        <div className="team-notes-grid">
          {filteredNotes.map(note => (
            <TeamNoteCard key={note.id} note={note} onOpen={onOpenNote} onDelete={onDeleteNote} />
          ))}
          <div className="team-add-tile" onClick={() => handleCreateNote('text')}>
            <Plus size={20} /><span>Add Note</span>
          </div>
        </div>
      )}

      {/* FAB */}
      <div className="tn-fab-container">
        {fabOpen && (
          <div className="tn-fab-menu">
            <button className="fab-option" onClick={() => handleCreateNote('text')}><FileText size={18} /><span>Text Note</span></button>
            <button className="fab-option" onClick={() => handleCreateNote('drawing')}><PenTool size={18} /><span>Drawing</span></button>
            <button className="fab-option" onClick={() => { setFabOpen(false); imageInputRef.current?.click(); }}><Image size={18} /><span>Image</span></button>
            <button className="fab-option" onClick={() => { setFabOpen(false); setShowTools(true); }}><BookOpen size={18} /><span>AI Tools</span></button>
          </div>
        )}
        <button className={`fab-btn ${fabOpen ? 'fab-open' : ''}`} onClick={() => setFabOpen(v => !v)}>
          {fabOpen ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>
    </div>
  );
};

/* ── Root ── */
const TeamNotes = ({ teams, activeTeamId, onSelectTeam, onCreateTeam, onOpenNote, onDeleteNote, teamNotes, onUpdateTeam, onExitTeam }) => {
  const activeTeam = teams.find(t => t.id === activeTeamId);

  if (!activeTeam) {
    return (
      <TeamListView
        teams={teams}
        onSelect={onSelectTeam}
        onCreateTeam={onCreateTeam}
        onExitTeam={(id) => { onExitTeam(id); onSelectTeam(null); }}
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
      onUpdateTeam={onUpdateTeam}
      onExitTeam={() => { onExitTeam(activeTeam.id); onSelectTeam(null); }}
    />
  );
};

export default TeamNotes;