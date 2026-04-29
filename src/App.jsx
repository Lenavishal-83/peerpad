import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TeamNotes from './pages/TeamNotes';
import DrawingCanvasPage from './pages/DrawingCanvasPage';
import AIToolsPage from './pages/AIToolsPage';
import TextEditorPage from './pages/TextEditorPage';
import SettingsPage from './pages/SettingsPage';
import ArchivePage from './pages/ArchivePage';
import { SyncProvider } from './context/SyncContext';
import { TeamProvider } from './context/TeamContext';

const SEED_NOTES = [
  {
    id: '1',
    title: 'Finals: Skeletal System Deep Dive',
    content: 'Reviewing the axial skeleton structures. AI suggests focusing on the cranial sutures for the upcoming quiz. Key points: cranial bones, suture types, fontanelles in development.',
    type: 'text',
    tag: 'PERSONAL',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    teamId: null,
  },
  {
    id: '3',
    title: 'Thesis Research: Digital Ethics',
    content: 'Must find more sources on data sovereignty in the age of generative AI. Reach out to Dr. Miller for reading list. Key themes: privacy, consent, algorithmic bias.',
    type: 'text',
    tag: 'PERSONAL',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    teamId: null,
  },
];

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [activeNote, setActiveNote] = useState(null);
  const [notes, setNotes] = useState(SEED_NOTES);
  const [archivedNotes, setArchivedNotes] = useState([]);
  const [teams, setTeams] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState(null);

  const handleSaveAndBack = useCallback((noteData) => {
    if (noteData) {
      if (noteData.id) {
        setNotes(prev =>
          prev.map(n => n.id === noteData.id ? { ...n, ...noteData, timestamp: new Date() } : n)
        );
      } else {
        const newNote = {
          ...noteData,
          id: Date.now().toString(),
          timestamp: new Date(),
          teamId: noteData.teamId || null,
          tag: noteData.tag || (noteData.teamId
            ? (teams.find(t => t.id === noteData.teamId)?.name?.toUpperCase() || 'TEAM')
            : 'PERSONAL'),
        };
        setNotes(prev => [newNote, ...prev]);
      }
    }
    setActiveNote(null);
  }, [teams]);

  // Soft-delete: moves note to archive with 30-day expiry
  const handleDeleteNote = useCallback((noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    setArchivedNotes(prev => [
      ...prev,
      {
        ...note,
        deletedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ]);
    setNotes(prev => prev.filter(n => n.id !== noteId));
  }, [notes]);

  const handleRestoreNote = useCallback((noteId) => {
    const note = archivedNotes.find(n => n.id === noteId);
    if (!note) return;
    // eslint-disable-next-line no-unused-vars
    const { deletedAt, expiresAt, ...restored } = note;
    setNotes(prev => [{ ...restored, timestamp: new Date() }, ...prev]);
    setArchivedNotes(prev => prev.filter(n => n.id !== noteId));
  }, [archivedNotes]);

  const handlePermanentDelete = useCallback((noteId) => {
    setArchivedNotes(prev => prev.filter(n => n.id !== noteId));
  }, []);

  const handleCreateTeam = useCallback((teamData) => {
    const newTeam = {
      id: `team-${Date.now()}`,
      name: teamData.name,
      subject: teamData.subject || 'GENERAL',
      members: [{ id: 1, name: 'You', avatar: 'https://i.pravatar.cc/150?u=user' }],
    };
    setTeams(prev => [...prev, newTeam]);
    setActiveTeamId(newTeam.id);
    setCurrentPage('teams');
  }, []);

  const renderPage = () => {
    if (activeNote) {
      if (activeNote.type === 'drawing')
        return <DrawingCanvasPage note={activeNote} onBack={handleSaveAndBack} />;
      if (activeNote.type === 'text')
        return <TextEditorPage note={activeNote} onBack={handleSaveAndBack} />;
    }

    switch (currentPage) {
      case 'home':
        return (
          <Dashboard
            notes={notes.filter(n => !n.teamId)}
            onOpenNote={setActiveNote}
            onDeleteNote={handleDeleteNote}
          />
        );
      case 'teams':
        return (
          <TeamNotes
            teams={teams}
            activeTeamId={activeTeamId}
            onSelectTeam={(id) => setActiveTeamId(id)}
            onCreateTeam={handleCreateTeam}
            onOpenNote={setActiveNote}
            onDeleteNote={handleDeleteNote}
            teamNotes={notes.filter(n => n.teamId === activeTeamId)}
          />
        );
      case 'ai':
        return <AIToolsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'archive':
        return (
          <ArchivePage
            archivedNotes={archivedNotes}
            onRestore={handleRestoreNote}
            onPermanentDelete={handlePermanentDelete}
          />
        );
      default:
        return (
          <Dashboard
            notes={notes.filter(n => !n.teamId)}
            onOpenNote={setActiveNote}
            onDeleteNote={handleDeleteNote}
          />
        );
    }
  };

  return (
    <SyncProvider>
      <TeamProvider>
        <div className="app-container">
          <Sidebar
            currentPage={currentPage}
            onNavigate={(page) => {
              setCurrentPage(page);
              if (page === 'teams') setActiveTeamId(null);
            }}
            onCreateNote={() => setActiveNote({ type: 'text' })}
          />
          <main className="main-content">
            {renderPage()}
          </main>
        </div>
      </TeamProvider>
    </SyncProvider>
  );
}

export default App;