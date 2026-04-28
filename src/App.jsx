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
  const [notes, setNotes] = useState([]);

  const handleSaveAndBack = (noteData) => {
    if (noteData) {
      if (noteData.id) {
        setNotes(prev => prev.map(n => n.id === noteData.id ? noteData : n));
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
        return <Dashboard onOpenNote={setActiveNote} />;
    }
  };

  return (
    <SyncProvider>
      <TeamProvider>
        <div className="app-container">
          <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
          <main className="main-content">
            {renderPage()}
          </main>
        </div>
      </TeamProvider>
    </SyncProvider>
  );
}

export default App;
