import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TeamNotes from './pages/TeamNotes';
import DrawingCanvasPage from './pages/DrawingCanvasPage';
import AIToolsPage from './pages/AIToolsPage';
import TextEditorPage from './pages/TextEditorPage';
import SettingsPage from './pages/SettingsPage';
import ArchivePage from './pages/ArchivePage';
import AboutPage from './pages/AboutPage';
import { SyncProvider } from './context/SyncContext';
import { TeamProvider } from './context/TeamContext';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [activeNote, setActiveNote] = useState(null);
  const [notes, setNotes] = useState([]);
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
          subjectId: noteData.subjectId || null,
          tag: noteData.tag || (noteData.teamId
            ? (teams.find(t => t.id === noteData.teamId)?.name?.toUpperCase() || 'TEAM')
            : 'PERSONAL'),
          collaborators: noteData.collaborators || [],
          images: noteData.images || [],
        };
        setNotes(prev => [newNote, ...prev]);
      }
    }
    setActiveNote(null);
  }, [teams]);

  const handleDeleteNote = useCallback((noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    setArchivedNotes(prev => [
      ...prev,
      { ...note, deletedAt: new Date(), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    ]);
    setNotes(prev => prev.filter(n => n.id !== noteId));
  }, [notes]);

  const handleRestoreNote = useCallback((noteId) => {
    const note = archivedNotes.find(n => n.id === noteId);
    if (!note) return;
    const { deletedAt, expiresAt, ...restored } = note; // eslint-disable-line no-unused-vars
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
      subjects: [{ id: 's1', name: teamData.subject || 'General' }],
      members: [{ id: 1, name: 'You', avatar: 'https://i.pravatar.cc/150?u=user', email: 'you@peerpad.app' }],
      pendingInvites: [],
    };
    setTeams(prev => [...prev, newTeam]);
    setActiveTeamId(newTeam.id);
    setCurrentPage('teams');
  }, []);

  const handleExitTeam = useCallback((teamId) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
    setNotes(prev => prev.filter(n => n.teamId !== teamId));
    setActiveTeamId(null);
  }, []);

  const handleUpdateTeam = useCallback((teamId, updater) => {
    setTeams(prev => prev.map(t => t.id === teamId ? updater(t) : t));
  }, []);

  // Save AI tool output (summary/transcript) to notes
  const handleSaveAINote = useCallback((noteData) => {
    const newNote = {
      id: Date.now().toString(),
      title: noteData.title,
      content: noteData.content,
      type: 'text',
      tag: noteData.teamId
        ? (teams.find(t => t.id === noteData.teamId)?.name?.toUpperCase() || 'TEAM')
        : 'AI NOTE',
      timestamp: new Date(),
      teamId: noteData.teamId || null,
      subjectId: noteData.subjectId || null,
      collaborators: [],
      images: [],
      aiGenerated: true,
    };
    setNotes(prev => [newNote, ...prev]);
  }, [teams]);

  const handleArchiveAINote = useCallback((noteData) => {
    const note = {
      id: Date.now().toString(),
      title: noteData.title,
      content: noteData.content,
      type: 'text',
      tag: 'AI NOTE',
      timestamp: new Date(),
      teamId: null,
      collaborators: [],
      images: [],
      aiGenerated: true,
      deletedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
    setArchivedNotes(prev => [note, ...prev]);
  }, []);

  const renderPage = () => {
    if (activeNote) {
      if (activeNote.type === 'drawing')
        return <DrawingCanvasPage note={activeNote} onBack={handleSaveAndBack} />;
      if (activeNote.type === 'text')
        return (
          <TextEditorPage
            note={activeNote}
            onBack={handleSaveAndBack}
            teamSubject={
              activeNote.teamId
                ? teams.find(t => t.id === activeNote.teamId)?.subjects?.find(s => s.id === activeNote.subjectId)?.name
                : null
            }
          />
        );
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
            onExitTeam={handleExitTeam}
            onUpdateTeam={handleUpdateTeam}
            onOpenNote={setActiveNote}
            onDeleteNote={handleDeleteNote}
            teamNotes={notes.filter(n => n.teamId === activeTeamId)}
            onSaveAINote={handleSaveAINote}
            onArchiveAINote={handleArchiveAINote}
          />
        );
      case 'ai':
        return (
          <AIToolsPage
            onSaveNote={handleSaveAINote}
            onArchiveNote={handleArchiveAINote}
          />
        );
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
      case 'about':
        return <AboutPage />;
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