import { useState } from 'react';
import { Search, FileText, PenTool, Upload, Mic, Grid, List, Plus, X } from 'lucide-react';
import './Dashboard.css';

const Dashboard = ({ notes = [], onOpenNote }) => {
  const [fabOpen, setFabOpen] = useState(false);

  return (
    <div className="dashboard relative">
      <header className="dashboard-header">
        <div className="search-bar">
          <Search size={20} className="text-secondary" />
          <input type="text" placeholder="Search your sanctuary..." />
        </div>
        <div className="header-actions">
          <button className="nav-tab active">Notes</button>
          <button className="nav-tab">Collections</button>
          <button className="nav-tab">Shared</button>
          <div className="avatar-small ml-4">
            <img src="https://i.pravatar.cc/150?u=user" alt="User" />
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {notes.length === 0 ? (
          <>
            <h1 className="hero-title">
              All Your Team's Notes.<br/>
              One Place. <span className="text-italic text-secondary">Powered</span><br/>
              <span className="text-italic text-secondary">by AI.</span>
            </h1>

            <div className="quick-actions">
              <button className="action-pill" onClick={() => onOpenNote({ type: 'text' })}>
                <FileText size={18} />
                <span>Text Note</span>
              </button>
              <button className="action-pill" onClick={() => onOpenNote({ type: 'drawing' })}>
                <PenTool size={18} />
                <span>Drawing</span>
              </button>
              <button className="action-pill">
                <Upload size={18} />
                <span>Upload PDF</span>
              </button>
              <button className="action-pill">
                <Mic size={18} />
                <span>Voice Note</span>
              </button>
            </div>
            
            <div className="mt-8 text-secondary text-sm text-center py-12 border-2 border-dashed rounded-xl">
              <p>You have no notes yet. Click the + button or an action above to create one.</p>
            </div>
          </>
        ) : (
          <div className="entries-section">
            <div className="entries-header border-b pb-4 mb-6">
              <h2 className="text-2xl font-bold">Your Sanctuary Entries</h2>
              <div className="view-toggles">
                <button className="view-toggle active"><Grid size={16} /></button>
                <button className="view-toggle"><List size={16} /></button>
              </div>
            </div>

            <div className="entries-grid">
              {notes.map(note => (
                <div key={note.id} className="entry-card p-6" onClick={() => onOpenNote(note)}>
                  <div className="card-top">
                    {note.type === 'text' ? <FileText size={20} className="text-secondary" /> : <PenTool size={20} className="text-secondary" />}
                    <span className="badge">PERSONAL</span>
                  </div>
                  <h3 className="card-title mt-4 font-bold">{note.title}</h3>
                  
                  {note.type === 'text' && (
                    <p className="card-desc mt-2 opacity-70" style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                      {note.content}
                    </p>
                  )}
                  
                  {note.type === 'drawing' && (
                    <div className="card-preview-image mt-4 bg-gray-50 border border-gray-200 rounded-md h-32 mb-4 overflow-hidden relative">
                       {note.dataURL && <img src={note.dataURL} style={{width: '100%', height: '100%', objectFit: 'contain', backgroundColor: 'white'}} alt="Drawing preview" />}
                    </div>
                  )}

                  <div className="card-footer mt-auto pt-6 border-t border-gray-100 flex-between">
                    <div className="avatars-group">
                      <img src="https://i.pravatar.cc/150?u=user" alt="User" />
                    </div>
                    <span className="time-ago">JUST NOW</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-10 right-10 flex flex-col items-end z-50">
        {fabOpen && (
          <div className="flex flex-col gap-3 mb-4 animate-fade-in">
             <button 
                className="bg-white text-black font-semibold shadow-lg rounded-full px-6 py-3 flex items-center gap-3 hover:scale-105 transition"
                onClick={() => { setFabOpen(false); onOpenNote({ type: 'text' }); }}
             >
                Text Note <FileText size={18}/>
             </button>
             <button 
                className="bg-white text-black font-semibold shadow-lg rounded-full px-6 py-3 flex items-center gap-3 hover:scale-105 transition"
                onClick={() => { setFabOpen(false); onOpenNote({ type: 'drawing' }); }}
             >
                Drawing Canvas <PenTool size={18}/>
             </button>
          </div>
        )}
        <button 
          className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition shrink-0"
          onClick={() => setFabOpen(!fabOpen)}
        >
          {fabOpen ? <X size={28} /> : <Plus size={28} />}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
