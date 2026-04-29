import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TeamNotes from './pages/TeamNotes';
import DrawingCanvasPage from './pages/DrawingCanvasPage';
import AIToolsPage from './pages/AIToolsPage';
import TextEditorPage from './pages/TextEditorPage';
import { SyncProvider } from './context/SyncContext';
import { TeamProvider } from './context/TeamContext';

const SEED_NOTES = [
  {
    id: '1',
    title: 'Finals: Skeletal System Deep Dive',
    content: 'Reviewing the axial skeleton structures. AI suggests focusing on the cranial sutures for the upcoming quiz...',
    type: 'text',
    tag: 'ANATOMY TEAM',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    teamId: null,
  },
  {
    id: '2',
    title: 'User Flow Concept #3',
    content: 'Initial wireframes for the mobile navigation system. Exploring circular menu patterns.',
    type: 'drawing',
    tag: 'DESIGN WORKSHOP',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    teamId: null,
  },
  {
    id: '3',
    title: 'Thesis Research: Digital Ethics',
    content: 'Must find more sources on data sovereignty in the age of generative AI. Reach out to Dr. Miller for reading list.',
    type: 'text',
    tag: 'PERSONAL',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    teamId: null,
  },
];

const SEED_TEAMS = [
  {
    id: 'team-1',
    name: 'Anatomy Study Group',
    subject: 'MEDICAL SCIENCE',
    memberCount: 3,
    members: [
      { id: 1, name: 'Alex', avatar: 'https://i.pravatar.cc/150?u=alex' },
      { id: 2, name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=sarah' },
      { id: 3, name: 'Dr. Julian', avatar: 'https://i.pravatar.cc/150?u=julian' },
    ],
  },
];

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [activeNote, setActiveNote] = useState(null);
  const [notes, setNotes] = useState(SEED_NOTES);
  const [teams, setTeams] = useState(SEED_TEAMS);
  const [activeTeamId, setActiveTeamId] = useState(null);

  // Shared note save — works for both personal and team notes
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

  const handleCreateTeam = useCallback((teamData) => {
    const newTeam = {
      id: `team-${Date.now()}`,
      name: teamData.name,
      subject: teamData.subject || 'GENERAL',
      memberCount: 1,
      members: [{ id: 1, name: 'You', avatar: 'https://i.pravatar.cc/150?u=user' }],
    };
    setTeams(prev => [...prev, newTeam]);
    setActiveTeamId(newTeam.id);
    setCurrentPage('teams');
  }, []);

  const handleOpenTeam = useCallback((teamId) => {
    setActiveTeamId(teamId);
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
          />
        );
      case 'teams':
        return (
          <TeamNotes
            teams={teams}
            activeTeamId={activeTeamId}
            onSelectTeam={setActiveTeamId}
            onCreateTeam={handleCreateTeam}
            onOpenNote={setActiveNote}
            teamNotes={notes.filter(n => n.teamId === activeTeamId)}
            allNotes={notes}
          />
        );
      case 'ai':
        return <AIToolsPage />;
      default:
        return (
          <Dashboard
            notes={notes.filter(n => !n.teamId)}
            onOpenNote={setActiveNote}
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
              if (page === 'teams' && teams.length > 0 && !activeTeamId) {
                setActiveTeamId(teams[0].id);
              }
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