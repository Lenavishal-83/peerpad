import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload, Mic, FileText, Sparkles, X, CheckCircle,
  AlertCircle, Loader, StopCircle, Copy, Download,
  ChevronRight, BarChart2, Zap, BookOpen, TrendingUp
} from 'lucide-react';

/* ─── helpers ─── */
const formatBytes = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

/* ─── Mock AI summary generator ─── */
const mockSummarize = (fileName) =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        title: fileName.replace(/\.pdf$/i, ''),
        keyPoints: [
          'Neuroplasticity refers to the brain\'s ability to reorganize itself by forming new neural connections throughout life.',
          'Active recall and spaced repetition improve long-term retention by up to 40% compared to passive reading.',
          'The hippocampus plays a central role in memory consolidation, transferring short-term memories to long-term storage.',
          'Sleep is critical for memory formation — slow-wave sleep stages help consolidate declarative memories.',
          'Stress hormones (cortisol) impair prefrontal cortex function, reducing working memory capacity.',
        ],
        wordCount: Math.floor(Math.random() * 8000) + 2000,
        readTime: Math.floor(Math.random() * 20) + 5,
        confidence: Math.floor(Math.random() * 10) + 88,
      });
    }, 2800)
  );

/* ─── Stats strip ─── */
const StatsStrip = ({ summaryCount }) => (
  <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
    <div style={styles.statCard}>
      <div style={styles.statNum}>{summaryCount}</div>
      <div style={styles.statLabel}>SUMMARIES</div>
    </div>
    <div style={{ ...styles.statCard, background: '#0a0a0a', border: '1px solid #0a0a0a' }}>
      <div style={{ ...styles.statNum, color: '#fff' }}>92%</div>
      <div style={{ ...styles.statLabel, color: '#666' }}>ACCURACY</div>
    </div>
  </div>
);

/* ─── PDF Upload & Summarizer ─── */
const PDFSummarizer = ({ onSummaryGenerated, summaryCount }) => {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | parsing | done | error
  const [summary, setSummary] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const progressRef = useRef(null);

  const handleFile = useCallback(async (f) => {
    if (!f || f.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }
    setFile(f);
    setStatus('parsing');
    setProgress(0);

    // Fake progress animation
    let p = 0;
    progressRef.current = setInterval(() => {
      p += Math.random() * 12;
      if (p >= 90) { clearInterval(progressRef.current); p = 90; }
      setProgress(Math.min(p, 90));
    }, 200);

    try {
      const result = await mockSummarize(f.name);
      clearInterval(progressRef.current);
      setProgress(100);
      setSummary(result);
      setStatus('done');
      onSummaryGenerated();
    } catch {
      setStatus('error');
    }
  }, [onSummaryGenerated]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setSummary(null);
    setProgress(0);
  };

  return (
    <div style={styles.card}>
      {/* Upload zone */}
      {status === 'idle' && (
        <div
          style={{
            ...styles.dropZone,
            borderColor: dragOver ? '#0a0a0a' : '#d1d5db',
            background: dragOver ? '#f9fafb' : 'transparent',
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <div style={styles.uploadIcon}>
            <Upload size={26} color="#fff" />
          </div>
          <h3 style={styles.cardTitle}>Upload PDF for AI Summary</h3>
          <p style={styles.cardDesc}>
            Drag and drop your academic papers, journals, or lecture notes here.
            Our AI will distill complex concepts into digestible insights.
          </p>
          <button style={styles.primaryBtn} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            Browse Documents <ChevronRight size={16} />
          </button>
          <FileText size={80} style={{ position: 'absolute', bottom: 20, right: 24, opacity: 0.05 }} />
        </div>
      )}

      {/* Parsing state */}
      {status === 'parsing' && (
        <div style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Analyzing <em>{file?.name}</em></p>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
            AI is distilling concepts into insights...
          </p>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>{Math.round(progress)}%</p>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <AlertCircle size={32} color="#ef4444" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600 }}>Something went wrong</p>
          <button style={{ ...styles.primaryBtn, marginTop: 16 }} onClick={reset}>Try Again</button>
        </div>
      )}

      {/* Summary done */}
      {status === 'done' && summary && (
        <div style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <CheckCircle size={18} color="#16a34a" />
                <span style={{ fontWeight: 700, color: '#16a34a', fontSize: 13 }}>Summary Complete</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 20 }}>{summary.title}</h3>
              <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                <span style={styles.metaPill}>{summary.wordCount.toLocaleString()} words</span>
                <span style={styles.metaPill}>{summary.readTime} min read</span>
                <span style={{ ...styles.metaPill, background: '#dcfce7', color: '#166534' }}>
                  {summary.confidence}% confidence
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={styles.iconBtn}
                title="Copy summary"
                onClick={() => navigator.clipboard.writeText(summary.keyPoints.join('\n'))}
              >
                <Copy size={16} />
              </button>
              <button style={styles.iconBtn} onClick={reset} title="Upload another">
                <X size={16} />
              </button>
            </div>
          </div>

          <div style={styles.divider} />

          <h4 style={{ fontWeight: 700, fontSize: 12, letterSpacing: '0.08em', color: '#6b7280', textTransform: 'uppercase', marginBottom: 14 }}>
            Key Points
          </h4>
          <ol style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {summary.keyPoints.map((pt, i) => (
              <li key={i} style={styles.keyPoint}>
                <span style={styles.keyNum}>{i + 1}</span>
                <span style={{ fontSize: 14, lineHeight: 1.5, color: '#1a1a1a' }}>{pt}</span>
              </li>
            ))}
          </ol>

          <button
            style={{ ...styles.primaryBtn, marginTop: 20, width: '100%', justifyContent: 'center' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={15} /> Summarize Another PDF
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={(e) => { reset(); setTimeout(() => handleFile(e.target.files[0]), 100); }}
          />
        </div>
      )}
    </div>
  );
};

/* ─── Voice Recorder & Transcriber ─── */
const VoiceTranscriber = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [supported, setSupported] = useState(true);
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setSupported(false);
    }
  }, []);

  const startRecording = () => {
    if (!supported) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SR();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (e) => {
      let full = '';
      for (let i = 0; i < e.results.length; i++) {
        full += e.results[i][0].transcript;
      }
      setTranscript(full);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
      clearInterval(timerRef.current);
    };

    recognitionRef.current.onerror = () => {
      setIsRecording(false);
      clearInterval(timerRef.current);
    };

    recognitionRef.current.start();
    setIsRecording(true);
    setTranscript('');
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const clearTranscript = () => setTranscript('');

  const copyTranscript = () => {
    navigator.clipboard.writeText(transcript).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.card}>
      <div style={{ padding: '28px 32px' }}>
        <h3 style={styles.cardTitle}>Record &amp; Transcribe</h3>
        <p style={{ ...styles.cardDesc, marginBottom: 24 }}>
          Capture lectures in real-time with instant AI transcription.
        </p>

        {!supported && (
          <div style={styles.warningBox}>
            <AlertCircle size={16} />
            <span>Speech recognition isn't supported in this browser. Try Chrome or Edge.</span>
          </div>
        )}

        {/* Waveform / idle visual */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, height: 56, marginBottom: 24 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 4,
                borderRadius: 2,
                background: isRecording ? '#0a0a0a' : '#e5e7eb',
                height: isRecording
                  ? `${Math.random() * 40 + 10}px`
                  : `${[14, 22, 36, 28, 18, 44, 32, 24, 16, 40, 20, 34, 26, 12, 38, 30, 22, 42, 16, 28][i]}px`,
                animation: isRecording ? `wave${(i % 5) + 1} ${0.6 + (i % 5) * 0.15}s ease-in-out infinite alternate` : 'none',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            style={{
              ...styles.primaryBtn,
              background: isRecording ? '#dc2626' : '#0a0a0a',
              gap: 10,
              minWidth: 160,
              justifyContent: 'center',
              opacity: supported ? 1 : 0.4,
            }}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!supported}
          >
            {isRecording ? (
              <><StopCircle size={18} /> Stop — {formatTime(elapsed)}</>
            ) : (
              <><span style={styles.recDot} /> Start Session</>
            )}
          </button>
        </div>

        {/* Transcript box */}
        {(transcript || isRecording) && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Live Transcript
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={styles.iconBtn} onClick={copyTranscript} title="Copy">
                  {copied ? <CheckCircle size={14} color="#16a34a" /> : <Copy size={14} />}
                </button>
                <button style={styles.iconBtn} onClick={downloadTranscript} title="Download">
                  <Download size={14} />
                </button>
                <button style={styles.iconBtn} onClick={clearTranscript} title="Clear">
                  <X size={14} />
                </button>
              </div>
            </div>
            <div
              style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: '16px 18px',
                minHeight: 100,
                maxHeight: 220,
                overflowY: 'auto',
                fontSize: 14,
                lineHeight: 1.7,
                color: '#1a1a1a',
                fontStyle: transcript ? 'normal' : 'italic',
              }}
            >
              {transcript || (isRecording ? 'Listening...' : '')}
              {isRecording && (
                <span style={{ display: 'inline-block', width: 2, height: 14, background: '#0a0a0a', marginLeft: 2, animation: 'blink 1s step-end infinite', verticalAlign: 'text-bottom' }} />
              )}
            </div>
            {transcript && (
              <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
                {transcript.split(' ').filter(Boolean).length} words
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Note Intelligence card ─── */
const NoteIntelligenceCard = ({ summaryCount }) => {
  const weeklyPercent = 65 + Math.min(summaryCount * 5, 30);
  return (
    <div style={{ ...styles.card, padding: '24px 28px', background: '#fafafa' }}>
      <h4 style={{ fontWeight: 800, letterSpacing: '0.06em', marginBottom: 20, fontSize: 13, textTransform: 'uppercase' }}>
        Note Intelligence
      </h4>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Weekly Output</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>+12% vs last week</span>
      </div>
      <div style={{ height: 6, background: '#e5e7eb', borderRadius: 99, marginBottom: 20 }}>
        <div style={{ height: '100%', width: `${weeklyPercent}%`, background: '#0a0a0a', borderRadius: 99, transition: 'width 0.5s ease' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Active Focus</div>
          <div style={{ fontWeight: 700 }}>Psychology</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Summaries</div>
          <div style={{ fontWeight: 700 }}>{summaryCount} Generated</div>
        </div>
      </div>

      <div style={{ ...styles.divider, marginTop: 20, marginBottom: 16 }} />

      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { icon: <TrendingUp size={14} />, label: 'Progress', val: '+23%' },
          { icon: <BookOpen size={14} />, label: 'Notes Read', val: '47' },
          { icon: <Zap size={14} />, label: 'Sessions', val: '8' },
        ].map((stat) => (
          <div key={stat.label} style={styles.miniStat}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4, color: '#6b7280' }}>
              {stat.icon}
              <span style={{ fontSize: 10, textTransform: 'uppercase', fontWeight: 700 }}>{stat.label}</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{stat.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── AI Hub stats ─── */
const AIHubHeader = ({ summaryCount }) => (
  <div style={{ marginBottom: 36 }}>
    <div style={styles.badge}>
      <Sparkles size={11} style={{ marginRight: 6 }} /> AI INTELLIGENCE HUB
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 16 }}>
      <div>
        <h1 style={styles.heroTitle}>Academic Sanctuary</h1>
        <p style={{ color: '#6b7280', fontSize: 15, maxWidth: 420, lineHeight: 1.6 }}>
          Elevate your research with our suite of organic AI assistants designed for the modern scholar.
        </p>
      </div>
      <StatsStrip summaryCount={summaryCount} />
    </div>
  </div>
);

/* ─── Quick tip card ─── */
const TipCard = () => (
  <div style={{ ...styles.card, background: '#0a0a0a', color: '#fff', padding: '24px 28px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, lineHeight: 1.3 }}>
          AI Pro Tip
        </h3>
        <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>
          Upload lecture slides as PDFs for the most accurate, structured summaries. Combine with voice recording for complete coverage.
        </p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 12, flexShrink: 0, marginLeft: 16 }}>
        <BarChart2 size={22} color="#fff" />
      </div>
    </div>
  </div>
);

/* ─── Floating recording indicator ─── */
const FloatingRecordingBar = ({ isRecording, onStop }) =>
  isRecording ? (
    <div style={styles.floatingBar}>
      <div style={styles.recDot} />
      <span style={{ fontSize: 14, fontWeight: 500 }}>Peer AI is listening...</span>
      <div style={{ height: 20, width: 1, background: 'rgba(255,255,255,0.2)', margin: '0 8px' }} />
      <button
        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0 4px' }}
        onClick={onStop}
      >
        <StopCircle size={18} />
      </button>
    </div>
  ) : null;

/* ─── Root Page ─── */
const AIToolsPage = () => {
  const [summaryCount, setSummaryCount] = useState(34);
  const [globalRecording, setGlobalRecording] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes wave1 { from { height: 8px; } to { height: 44px; } }
        @keyframes wave2 { from { height: 12px; } to { height: 36px; } }
        @keyframes wave3 { from { height: 6px; } to { height: 52px; } }
        @keyframes wave4 { from { height: 18px; } to { height: 30px; } }
        @keyframes wave5 { from { height: 10px; } to { height: 40px; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

        .ai-tools-root * { box-sizing: border-box; }
        .ai-tools-root { font-family: 'Sora', sans-serif; }
        .ai-tools-root button { font-family: 'Sora', sans-serif; }
      `}</style>

      <div className="ai-tools-root" style={styles.root}>
        <AIHubHeader summaryCount={summaryCount} />

        <div style={styles.grid}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ animation: 'fadeUp 0.4s ease both' }}>
              <PDFSummarizer
                onSummaryGenerated={() => setSummaryCount((c) => c + 1)}
                summaryCount={summaryCount}
              />
            </div>
            <div style={{ animation: 'fadeUp 0.5s 0.08s ease both' }}>
              <VoiceTranscriber onRecordingChange={setGlobalRecording} />
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ animation: 'slideIn 0.4s 0.1s ease both' }}>
              <NoteIntelligenceCard summaryCount={summaryCount} />
            </div>
            <div style={{ animation: 'slideIn 0.4s 0.2s ease both' }}>
              <TipCard />
            </div>
          </div>
        </div>

        <FloatingRecordingBar isRecording={globalRecording} onStop={() => setGlobalRecording(false)} />
      </div>
    </>
  );
};

/* ─── Styles ─── */
const styles = {
  root: {
    padding: '44px 52px',
    maxWidth: 1200,
    minHeight: '100vh',
    overflowY: 'auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: 28,
    alignItems: 'start',
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    position: 'relative',
  },
  dropZone: {
    padding: '48px 36px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '2px dashed',
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  uploadIcon: {
    width: 60,
    height: 60,
    background: '#0a0a0a',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
  },
  cardTitle: {
    fontWeight: 800,
    fontSize: 22,
    marginBottom: 10,
    letterSpacing: '-0.02em',
  },
  cardDesc: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 1.65,
    maxWidth: 420,
    marginBottom: 6,
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: '#0a0a0a',
    color: '#fff',
    border: 'none',
    borderRadius: 999,
    padding: '12px 24px',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: 8,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    border: '1px solid #e5e7eb',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#6b7280',
    transition: 'all 0.2s',
  },
  progressTrack: {
    height: 6,
    background: '#e5e7eb',
    borderRadius: 99,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    background: '#0a0a0a',
    borderRadius: 99,
    transition: 'width 0.3s ease',
  },
  metaPill: {
    fontSize: 12,
    fontWeight: 600,
    background: '#f3f4f6',
    color: '#374151',
    borderRadius: 99,
    padding: '3px 10px',
  },
  keyPoint: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
    padding: '10px 14px',
    background: '#f9fafb',
    borderRadius: 10,
    border: '1px solid #f3f4f6',
  },
  keyNum: {
    width: 22,
    height: 22,
    minWidth: 22,
    background: '#0a0a0a',
    color: '#fff',
    borderRadius: '50%',
    fontSize: 11,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  divider: {
    height: 1,
    background: '#f3f4f6',
    margin: '16px 0',
  },
  statCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    padding: '14px 20px',
    minWidth: 90,
  },
  statNum: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginTop: 2,
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    background: '#f3f4f6',
    padding: '5px 12px',
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: '#374151',
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
    marginBottom: 10,
  },
  recDot: {
    width: 9,
    height: 9,
    background: '#ef4444',
    borderRadius: '50%',
    animation: 'blink 1.2s ease-in-out infinite',
  },
  warningBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#fef3c7',
    border: '1px solid #fcd34d',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13,
    color: '#92400e',
    marginBottom: 16,
  },
  miniStat: {
    flex: 1,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '10px 12px',
  },
  floatingBar: {
    position: 'fixed',
    bottom: 32,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#0a0a0a',
    color: '#fff',
    borderRadius: 999,
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    zIndex: 999,
    fontSize: 14,
    fontWeight: 600,
    animation: 'fadeUp 0.3s ease',
  },
};

export default AIToolsPage;