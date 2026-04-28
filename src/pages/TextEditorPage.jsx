import { useState } from 'react';
import { ArrowLeft, Share2, MoreVertical, Bold, Italic, List as ListIcon, Image as ImageIcon, Link2, Eraser, PlayCircle, BookOpen, HelpCircle } from 'lucide-react';
import { useSync } from '../context/SyncContext';
import './TextEditorPage.css';

const TextEditorPage = ({ note, onBack }) => {
  const { dispatchEvent } = useSync();
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || `Neural plasticity, also known as brain plasticity...`);

  const handleEdit = (e) => {
    setContent(e.target.value);
    dispatchEvent({ type: 'NOTE_EDIT', payload: { content: e.target.value } });
  };

  const handleBack = () => {
    onBack({
      id: note?.id,
      title: title || 'Untitled Note',
      content,
      type: 'text'
    });
  };

  return (
    <div className="text-editor-page">
      <div className="flex flex-1 h-full max-w-[1400px] w-full mx-auto bg-white rounded-xl shadow-sm border overflow-hidden">
        
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col relative overflow-y-auto hidden-scrollbar relative bg-white">
          <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 p-6 flex-between">
             <div className="flex items-center gap-4">
               <button className="btn-icon" onClick={handleBack}><ArrowLeft size={20}/></button>
               <div className="text-sm font-bold tracking-wider text-gray-800">PeerPad <span className="font-normal text-secondary text-xs uppercase tracking-widest ml-2">ACADEMIC SANCTUARY</span></div>
             </div>
             <div className="flex items-center gap-4">
               <div className="text-xs text-secondary font-medium flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Cloud Saved</div>
               <button className="btn btn-primary px-6"><Share2 size={16}/> Share</button>
               <button className="btn-icon circle"><MoreVertical size={20}/></button>
             </div>
          </div>

          <div className="max-w-3xl mx-auto w-full px-12 py-10 pb-40">
             <div className="flex items-center gap-3 mb-4">
                <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">NEUROSCIENCE 101</span>
                <span className="text-xs text-secondary">Last edited 2m ago</span>
             </div>
             
             <input 
               className="text-4xl font-bold mb-8 outline-none w-full bg-transparent placeholder-gray-300" 
               placeholder="Enter title here..."
               value={title}
               onChange={(e) => setTitle(e.target.value)}
             />
             
             <textarea 
               className="w-full text-lg leading-relaxed text-gray-800 resize-none outline-none min-h-[500px]"
               value={content}
               onChange={handleEdit}
             />

             {/* Floating UI Elements (Mock cursors / Selections) */}
             <div className="absolute top-[420px] left-[180px] bg-gray-50 border rounded-xl p-6 w-[600px] shadow-sm pointer-events-none">
                 <h3 className="font-bold mb-4">Key Mechanisms</h3>
                 <ul className="space-y-4">
                   <li className="flex gap-2"><span className="text-black font-bold">✓ Synaptic Plasticity:</span> The strength of communication between neurons.</li>
                   <li className="flex gap-2"><span className="text-black font-bold">✓ Synaptogenesis:</span> The formation of new synapses.</li>
                   <li className="flex gap-2"><span className="text-black font-bold">✓ Myelination:</span> The development of the myelin sheath around axons to speed up transmission.</li>
                 </ul>
                 {/* Live Cursor 1 */}
                 <div className="absolute top-[30px] left-[200px] w-px h-6 bg-black">
                   <div className="absolute top-100 left-0 bg-black text-white text-[10px] px-1 font-bold whitespace-nowrap -ml-1 mt-1">Sarah M.</div>
                 </div>
             </div>

             {/* Live Cursor 2 */}
             <div className="absolute bottom-[280px] left-[450px] w-px h-6 bg-gray-500 pointer-events-none">
                <div className="absolute top-100 left-0 bg-gray-500 text-white text-[10px] px-1 font-bold whitespace-nowrap -ml-1 mt-1">Prof. Julian</div>
             </div>
          </div>

          {/* Floating Toolbar */}
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 -ml-[150px] bg-white px-6 py-3 rounded-full border shadow-xl flex items-center gap-6 z-20">
             <button className="text-black font-bold"><Bold size={18}/></button>
             <button className="text-gray-500 hover:text-black italic"><Italic size={18}/></button>
             <button className="text-gray-500 hover:text-black"><ListIcon size={18}/></button>
             <div className="w-px h-4 bg-gray-200"></div>
             <button className="text-gray-500 hover:text-black"><ImageIcon size={18}/></button>
             <button className="text-gray-500 hover:text-black"><Link2 size={18}/></button>
             <div className="w-px h-4 bg-gray-200"></div>
             <button className="text-gray-500 hover:text-black"><Eraser size={18}/></button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[320px] bg-gray-50 border-l flex flex-col hidden-scrollbar overflow-y-auto p-6">
           <div className="mb-8">
             <div className="flex-between text-xs font-bold uppercase tracking-wider mb-4">
               <span>Collaborators</span>
               <span className="bg-black text-white px-2 py-0.5 rounded-full text-[10px]">3 ACTIVE</span>
             </div>
             <div className="avatars-group">
                <img src="https://i.pravatar.cc/150?u=u1" alt=""/>
                <img src="https://i.pravatar.cc/150?u=u2" alt=""/>
                <img src="https://i.pravatar.cc/150?u=u3" alt=""/>
                <div className="avatar-more">+2</div>
             </div>
           </div>

           <div className="mb-8 border-t pt-8">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center"><BookOpen size={18}/></div>
               <div>
                 <h4 className="font-bold text-sm">Study AI</h4>
                 <p className="text-[10px] text-secondary font-bold uppercase">YOUR ACADEMIC PARTNER</p>
               </div>
             </div>

             <div className="flex flex-col gap-3">
               <button className="flex items-center justify-between p-4 bg-white border rounded-xl hover:border-black transition">
                 <span className="text-sm font-semibold flex items-center gap-3"><PlayCircle size={16}/> Summarize Note</span>
                 <ArrowLeft size={16} className="transform rotate-180 text-gray-400"/>
               </button>
               <button className="flex items-center justify-between p-4 bg-white border rounded-xl hover:border-black transition">
                 <span className="text-sm font-semibold flex items-center gap-3"><BookOpen size={16}/> Explain Concept</span>
                 <ArrowLeft size={16} className="transform rotate-180 text-gray-400"/>
               </button>
               <button className="flex items-center justify-between p-4 bg-white border rounded-xl hover:border-black transition">
                 <span className="text-sm font-semibold flex items-center gap-3"><HelpCircle size={16}/> Generate Quiz</span>
                 <ArrowLeft size={16} className="transform rotate-180 text-gray-400"/>
               </button>
             </div>
           </div>

           <div className="mt-4">
             <div className="text-[10px] font-bold uppercase text-secondary mb-2 tracking-wider">AI Insight</div>
             <div className="bg-white p-4 rounded-xl border text-sm text-gray-600 leading-relaxed shadow-sm">
                "Based on your notes, this topic is highly likely to appear in the Final Exam. I suggest focusing on the hippocampus sections."
             </div>
           </div>

           <div className="mt-auto pt-8 border-t">
              <div className="flex-between text-[10px] font-bold text-secondary uppercase mb-2">
                <span>Readability Score</span>
                <span className="text-black">84/100</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full"><div className="w-[84%] bg-black h-full rounded-full"></div></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditorPage;
