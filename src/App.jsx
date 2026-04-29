import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TeamNotes from './pages/TeamNotes';
import DrawingCanvasPage from './pages/DrawingCanvasPage';
import AIToolsPage from './pages/AIToolsPage';
import TextEditorPage from './pages/TextEditorPage';
import { SyncProvider } from './context/SyncContext';
import { TeamProvider } from './context/TeamContext';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [activeNote, setActiveNote] = useState(null);
  const [notes, setNotes] = useState([
    {
      id: '1',
      title: 'Finals: Skeletal System Deep Dive',
      content: 'Reviewing the axial skeleton structures. AI suggests focusing on the cranial sutures for the upcoming quiz...',
      type: 'text',
      tag: 'ANATOMY TEAM',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
    },
    {
      id: '2',
      title: 'User Flow Concept #3',
      content: 'Initial wireframes for the mobile navigation system. Exploring circular menu patterns.',
      type: 'drawing',
      tag: 'DESIGN WORKSHOP',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
      id: '3',
      title: 'Thesis Research: Digital Ethics',
      content: 'Must find more sources on data sovereignty in the age of generative AI. Reach out to Dr. Miller for reading list.',
      type: 'text',
      tag: 'PERSONAL',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
  ]);

  const handleSaveAndBack = (noteData) => {
    if (noteData) {
      if (noteData.id) {
        setNotes(prev => prev.map(n => n.id === noteData.id ? { ...noteData, timestamp: new Date() } : n));
      } else {
        setNotes(prev => [{ ...noteData, id: Date.now().toString(), timestamp: new Date() }, ...prev]);
      }
    }
    setActiveNote(null);
  };

  const renderPage = () => {
    if (activeNote) {
      if (activeNote.type === 'drawing') return <DrawingCanvasPage note={activeNote} onBack={handleSaveAndBack} />;
      if (activeNote.type === 'text') return <TextEditorPage note={activeNote} onBack={handleSaveAndBack} />;
    }

    switch (currentPage) {
      case 'home':
        return <Dashboard notes={notes} onOpenNote={setActiveNote} />;
      case 'teams':
        return <TeamNotes onOpenNote={setActiveNote} />;
      case 'ai':
        return <AIToolsPage />;
      default:
        return <Dashboard notes={notes} onOpenNote={setActiveNote} />;
    }
  };

  return (
    <SyncProvider>
      <TeamProvider>
        <div className="app-container">
          <Sidebar
            currentPage={currentPage}
            onNavigate={setCurrentPage}
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