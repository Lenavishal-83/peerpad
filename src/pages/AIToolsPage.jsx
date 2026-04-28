import { useState, useRef } from 'react';
import { Upload, Mic, FileText, BarChart, Settings, Play, Sparkles } from 'lucide-react';
import { useSync } from '../context/SyncContext';
import './AIToolsPage.css';

const AIToolsPage = () => {
  const { dispatchEvent } = useSync();
  const [pdfFile, setPdfFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const fileInputRef = useRef(null);

  // Voice to text states
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  // --- FEATURE 2: PDF SUMMARIZER ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
      parsePDF(file);
    }
  };

  const parsePDF = (file) => {
    console.log(`Parsing PDF: ${file.name}`);
    setIsSummarizing(true);
    // Simulate parsing and generating summary
    setTimeout(() => {
      generateSummary(`Simulated extracted text from ${file.name}`);
    }, 1500);
  };

  const generateSummary = (text) => {
    const mockSummary = "Here is the AI-generated summary of your uploaded document. Key points include: 1. Neuroplasticity refers to physiological changes in the brain. 2. Active recall improves retention by 40%. 3. The document emphasizes spaced repetition.";
    setSummary(mockSummary);
    setIsSummarizing(false);
    dispatchEvent({ type: 'PDF_SUMMARY_GENERATED', payload: { fileName: pdfFile?.name, summary: mockSummary } });
  };

  // --- FEATURE 3: VOICE TO TEXT ---
  const startVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
    };

    recognitionRef.current.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
      dispatchEvent({ type: 'VOICE_TRANSCRIPT_SAVED', payload: { transcript } });
    };

    recognitionRef.current.start();
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      setTranscript('');
      startVoiceRecording();
    }
  };

  return (
    <div className="ai-tools-page">
      <div className="page-header mb-8">
        <div className="header-badge"><SparklesIcon size={12} className="mr-2"/> AI INTELLIGENCE HUB</div>
        <div className="flex-between mt-4">
          <div>
            <h1 className="text-5xl font-bold mb-2">Academic Sanctuary</h1>
            <p className="text-secondary w-2/3">Elevate your research with our suite of organic AI assistants designed for the modern scholar.</p>
          </div>
          <div className="stats-row flex gap-4">
            <div className="stat-card">
              <div className="text-3xl font-bold">34</div>
              <div className="text-xs uppercase font-bold text-secondary">Summaries</div>
            </div>
            <div className="stat-card bg-black text-white">
              <div className="text-3xl font-bold">92%</div>
              <div className="text-xs uppercase font-bold text-gray-400">Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-6">
        <div className="flex flex-col gap-6">
          {/* PDF Upload Card */}
          <div className="ai-card p-10 flex flex-col items-center text-center relative border-dashed">
             <div className="bg-black text-white p-4 rounded-full shadow-lg mb-6 z-10 cursor-pointer hover:scale-105 transition" onClick={() => fileInputRef.current.click()}>
               <Upload size={24} />
             </div>
             <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
             <h3 className="text-2xl font-bold mb-2">Upload PDF for AI Summary</h3>
             <p className="text-secondary text-sm w-3/4 mb-6">Drag and drop your academic papers, journals, or lecture notes here. Our AI will distill complex concepts into digestible insights.</p>
             <button className="btn btn-primary" onClick={() => fileInputRef.current.click()}>Browse Documents</button>
             
             {/* Decorative marks */}
             <FileText size={64} className="absolute top-8 right-8 text-secondary opacity-10" />
          </div>

          {pdfFile && (
            <div className="ai-card p-6 bg-green-50 border border-green-200">
               <h4 className="font-bold text-green-800 mb-2">{pdfFile.name}</h4>
               {isSummarizing ? (
                 <p className="text-sm text-green-700 animate-pulse">AI is generating summary...</p>
               ) : (
                 <p className="text-sm text-green-800">{summary}</p>
               )}
            </div>
          )}

          {/* Voice to Text Card */}
          <div className="ai-card p-8 flex">
             <div className="flex-1">
               <h3 className="text-2xl font-bold mb-2">Record & Transcribe</h3>
               <p className="text-secondary text-sm w-5/6 mb-6">Capture lectures in real-time with instant AI transcription.</p>
               
               {isRecording && (
                 <div className="audio-waveform mb-6 justify-center">
                    <div className="wave-bar bg-accent h-4 animate-wave-1"></div>
                    <div className="wave-bar bg-accent h-8 animate-wave-2"></div>
                    <div className="wave-bar bg-accent h-12 animate-wave-3"></div>
                    <div className="wave-bar bg-accent h-6 animate-wave-4"></div>
                    <div className="wave-bar bg-accent h-10 animate-wave-5"></div>
                 </div>
               )}

               <div className="flex gap-4">
                 <button className={`btn shadow-md ${isRecording ? 'bg-red-500 text-white' : 'btn-primary'}`} onClick={toggleRecording}>
                   <span className="dot-white mr-2"></span> {isRecording ? 'Stop Recording' : 'Start Session'}
                 </button>
                 <button className="btn-icon circle shadow-md"><Settings size={18}/></button>
               </div>
             </div>
             
             {transcript && (
               <div className="flex-1 border-l pl-6 max-h-48 overflow-y-auto">
                 <h4 className="text-xs font-bold text-secondary uppercase mb-2">Live Transcript</h4>
                 <p className="text-sm italic">{transcript}</p>
               </div>
             )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
           {/* Side cards */}
           <div className="ai-card p-6 border-none bg-gradient-to-br from-gray-50 to-gray-100">
             <h4 className="font-bold tracking-wider mb-6">NOTE INTELLIGENCE</h4>
             <div className="flex-between text-xs font-bold uppercase mb-2">
               <span>Weekly Output</span>
               <span className="text-green-600">+12% vs last week</span>
             </div>
             <div className="progress-bar mb-6 bg-gray-200 h-2 rounded"><div className="bg-black h-full rounded w-3/4"></div></div>
             
             <div className="flex-between">
               <div>
                 <div className="text-xs text-secondary font-bold uppercase">Active Focus</div>
                 <div className="font-bold mt-1">Psychology</div>
               </div>
               <div className="text-right">
                 <div className="text-xs text-secondary font-bold uppercase">Flashcards</div>
                 <div className="font-bold mt-1">128 Ready</div>
               </div>
             </div>
           </div>

           <div className="ai-card bg-black text-white p-6 flex-between items-end min-h-[160px]">
              <div>
                <h3 className="text-2xl font-bold mb-2">Exam Predictor</h3>
                <p className="text-gray-400 text-sm">Analyze syllabus & notes</p>
              </div>
              <div className="bg-white/10 p-3 rounded-full"><BarChart size={24} /></div>
           </div>

           <div className="ai-card p-6">
             <h3 className="text-xl font-bold mb-2">Generate Flashcards from Notes</h3>
             <p className="text-secondary text-sm mb-6">Select a note cluster to automatically generate Spaced Repetition flashcards.</p>
             
             <div className="flex gap-2 mb-6 flex-wrap">
               <span className="bg-black text-white text-xs px-3 py-1 rounded-full font-bold">QUANTUM PHYSICS 101</span>
               <span className="bg-gray-100 text-xs px-3 py-1 rounded-full font-bold">NEUROBIOLOGY CH. 4</span>
             </div>

             <button className="btn btn-secondary w-full">Process Flashcards</button>
           </div>
        </div>
      </div>
      
      {/* Floating Action Bar equivalent for isRecording */}
      {isRecording && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white rounded-full px-6 py-3 flex items-center shadow-2xl z-50">
           <div className="sparkle-icon mr-3"><Mic size={16}/></div>
           <span className="text-sm font-medium mr-4">Peer AI is listening...</span>
           <div className="h-4 w-px bg-white/20 mx-2"></div>
           <button className="text-white/70 hover:text-white px-2" onClick={stopVoiceRecording}><FileText size={16}/></button>
        </div>
      )}
    </div>
  );
};

// Helper for top icon
const SparklesIcon = (props) => <Sparkles {...props} />;

export default AIToolsPage;
