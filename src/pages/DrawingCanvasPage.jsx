import { useRef, useState, useEffect } from 'react';
import { ArrowLeft, PenTool, Eraser, Type, Image as ImageIcon, Hand, Undo, Redo, ZoomIn, ZoomOut, Save, Share2, Layers } from 'lucide-react';
import { useSync } from '../context/SyncContext';
import './DrawingCanvasPage.css';

const DrawingCanvasPage = ({ note, onBack }) => {
  const canvasRef = useRef(null);
  const { dispatchEvent } = useSync();
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen'); // pen, eraser
  const [color, setColor] = useState('#000000');
  const [title, setTitle] = useState(note?.title || '');

  // Basic mock history for undo/redo
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Initial white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      saveHistoryState();
    }
  }, []);

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL();
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push(dataURL);
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
      
      dispatchEvent({ type: 'CANVAS_UPDATE', payload: { dataURL } });
    }
  };

  const startDrawing = (e) => {
    const { offsetX, offsetY } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    
    ctx.lineWidth = tool === 'eraser' ? 20 : 3;
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.closePath();
      setIsDrawing(false);
      saveHistoryState();
    }
  };

  const getCoordinates = (e) => {
    if (e.touches && e.touches.length > 0) {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    }
    return { offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY };
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      restoreCanvas(history[historyStep - 1]);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      restoreCanvas(history[historyStep + 1]);
    }
  };

  const restoreCanvas = (dataUrl) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const handleBack = () => {
    onBack({
      id: note?.id,
      title: title || 'Untitled Drawing',
      dataURL: history[historyStep] || '',
      type: 'drawing'
    });
  };

  return (
    <div className="drawing-canvas-page">
      <div className="canvas-header flex-between mb-4">
        <div className="flex items-center gap-4">
          <button className="btn-icon" onClick={handleBack}><ArrowLeft size={20}/></button>
          <div>
            <input 
              className="text-xl font-bold outline-none bg-transparent placeholder-gray-400 w-[300px]" 
              placeholder="Enter title here..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="text-xs text-secondary font-bold uppercase tracking-wider">WORKSPACE • NEUROBIOLOGY 101</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="avatars-group">
            <img src="https://i.pravatar.cc/150?u=user1" alt=""/>
            <img src="https://i.pravatar.cc/150?u=user2" alt=""/>
            <div className="avatar-more bg-accent text-white border-0">+2</div>
          </div>
          <button className="btn btn-secondary border"><Share2 size={16}/> Share</button>
          <button className="btn btn-primary bg-black text-white px-6">Save as Note</button>
        </div>
      </div>

      <div className="canvas-workspace relative flex-1 bg-gray-50 rounded-xl overflow-hidden shadow-inner border border-gray-200">
         {/* Sidebar Tools */}
         <div className="absolute left-6 top-6 flex flex-col gap-4 z-10">
            <div className="bg-white p-2 border rounded-full shadow-lg flex flex-col gap-4">
              <button className={`tool-btn ${tool === 'pen' ? 'active' : ''}`} onClick={() => setTool('pen')}><PenTool size={20}/></button>
              <button className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`} onClick={() => setTool('eraser')}><Eraser size={20}/></button>
              <button className="tool-btn"><Layers size={20}/></button>
              <button className="tool-btn"><Type size={20}/></button>
              <button className="tool-btn"><ImageIcon size={20}/></button>
              <button className="tool-btn"><Hand size={20}/></button>
            </div>
            
            {tool === 'pen' && (
              <div className="bg-white p-3 border rounded-full shadow-lg flex flex-col gap-3">
                 <button className="color-btn" style={{backgroundColor: '#000'}} onClick={() => setColor('#000')}></button>
                 <button className="color-btn" style={{backgroundColor: '#5C6B73'}} onClick={() => setColor('#5C6B73')}></button>
                 <button className="color-btn" style={{backgroundColor: '#C5D0D6'}} onClick={() => setColor('#C5D0D6')}></button>
                 <button className="color-btn" style={{backgroundColor: '#EBEBEB', border: '1px solid #ddd'}} onClick={() => setColor('#EBEBEB')}></button>
              </div>
            )}
         </div>

         {/* Canvas Area */}
         <div className="canvas-container w-full h-full flex items-center justify-center relative dot-pattern">
            <canvas 
              ref={canvasRef}
              width={800}
              height={600}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="bg-white shadow-md cursor-crosshair max-w-full max-h-full"
            />
            
            {/* Mock collaborator cursor feature 5 */}
            <div className="absolute top-1/4 left-1/3 flex flex-col pointer-events-none">
               <div className="cursor-arrow transform -rotate-45" style={{borderBottom: '12px solid #000', borderLeft: '8px solid transparent', borderRight: '8px solid transparent', width: 0, height: 0}}></div>
               <div className="bg-black text-white text-xs px-2 py-0.5 rounded-full mt-1 font-medium">Sarah M.</div>
            </div>
         </div>

         {/* Bottom Control Bar */}
         <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-full border shadow-lg flex items-center gap-6 z-10">
            <div className="flex gap-4">
              <button className="text-gray-400 hover:text-black" onClick={handleUndo}><Undo size={18}/></button>
              <button className="text-gray-400 hover:text-black" onClick={handleRedo}><Redo size={18}/></button>
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="text-sm font-medium flex items-center gap-2"><span className="dot-black"></span> Zoom: 100%</div>
            <div className="text-sm font-medium flex items-center gap-2"><GridIcon size={16}/> Grid: On</div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex gap-4">
               <button className="text-gray-600 hover:text-black"><ZoomOut size={18}/></button>
               <button className="text-gray-600 hover:text-black"><ZoomIn size={18}/></button>
            </div>
         </div>
         
         <button className="absolute bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition z-10">
           <PenTool size={24}/>
         </button>
      </div>
    </div>
  );
};

const GridIcon = (props) => <Layers {...props}/>;

export default DrawingCanvasPage;
