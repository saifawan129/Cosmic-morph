
import React, { useState, useRef, useEffect, memo } from 'react';
import { Scene } from './components/Scene';
import { MorphState } from './types';
import { chatWithAssistant } from './geminiService';
import { 
  Cpu, 
  Sparkles, 
  RefreshCcw,
  Loader2,
  ChevronRight,
  Sun,
  Moon,
  Home,
  Cloud,
  MessageSquare,
  User,
  Bot,
  Zap,
  Activity,
  Layers
} from 'lucide-react';

const INITIAL_STATE: MorphState = {
  color: '#4e54c8',
  roughness: 0.1,
  metalness: 0.8,
  distort: 0.3,
  speed: 1.0,
  scale: 1.2,
  name: 'Core System',
  environment: 'city'
};

const ENVIRONMENTS: { id: MorphState['environment']; label: string }[] = [
  { id: 'city', label: 'City' },
  { id: 'studio', label: 'Studio' },
  { id: 'sunset', label: 'Sunset' },
  { id: 'night', label: 'Night' },
  { id: 'forest', label: 'Forest' },
];

const PRESET_COLORS = ['#4e54c8', '#ff0055', '#00ffaa', '#ffd700', '#ffffff', '#8a2be2'];

// Optimized UI Panels using memo to prevent re-renders from Canvas activity
const ControlPanel = memo(({ state, update }: { state: MorphState, update: any }) => (
  <div className="pointer-events-auto glass-panel p-6 rounded-3xl border-white/5 space-y-8">
    <div className="flex items-center gap-3 mb-6">
      <Cpu className="w-4 h-4 text-blue-400" />
      <h2 className="text-[9px] font-bold tracking-[0.3em] uppercase opacity-50">System Controls</h2>
    </div>

    <ControlSlider label="Distortion" value={state.distort} min={0} max={1.5} step={0.05} onChange={(v) => update('distort', v)} />
    <ControlSlider label="Roughness" value={state.roughness} min={0} max={1} step={0.05} onChange={(v) => update('roughness', v)} />
    
    <div className="grid grid-cols-6 gap-2">
      {PRESET_COLORS.map(c => (
        <button 
          key={c}
          onClick={() => update('color', c)}
          className={`h-6 rounded-md transition-all ${state.color === c ? 'ring-2 ring-white scale-110' : 'opacity-40'}`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>

    <div className="flex flex-wrap gap-1.5">
      {ENVIRONMENTS.map(env => (
        <button 
          key={env.id}
          onClick={() => update('environment', env.id)}
          className={`px-2 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-wider border transition-all ${state.environment === env.id ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5'}`}
        >
          {env.label}
        </button>
      ))}
    </div>
  </div>
));

const App: React.FC = () => {
  const [morphState, setMorphState] = useState<MorphState>(INITIAL_STATE);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role:string, text:string}[]>([]);
  const [fps, setFps] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    const updateStats = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      requestAnimationFrame(updateStats);
    };
    const handle = requestAnimationFrame(updateStats);
    return () => cancelAnimationFrame(handle);
  }, []);

  const handleChat = async () => {
    if (!prompt.trim() || isGenerating) return;
    const userMessage = { role: 'user', text: prompt };
    setChatHistory(prev => [...prev, userMessage]);
    setPrompt('');
    setIsGenerating(true);

    try {
      const rawResponse = await chatWithAssistant(prompt, []);
      const jsonMatch = rawResponse.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        const newState = JSON.parse(jsonMatch[0]);
        setMorphState(prev => ({ ...prev, ...newState }));
      }
      const displayText = rawResponse.replace(/\{[\s\S]*?\}/, '').trim();
      setChatHistory(prev => [...prev, { role: 'model', text: displayText || "Aligned." }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Signal lost." }]);
    } finally {
      setIsGenerating(false);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const updateParam = (key: string, val: any) => {
    setMorphState(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="relative w-screen h-screen bg-[#010103] text-white overflow-hidden select-none font-sans">
      <Scene morphState={morphState} />

      <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-xl font-black uppercase italic tracking-tighter">Cosmic</h1>
        </div>
        
        <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-3 pointer-events-auto">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span className="text-[10px] font-mono font-bold text-cyan-400">{fps} FPS TARGET: 40</span>
        </div>
      </header>

      <div className="absolute inset-0 p-6 pt-24 flex flex-col md:flex-row justify-between pointer-events-none z-40 gap-6">
        <aside className="w-full md:w-64">
          <ControlPanel state={morphState} update={updateParam} />
        </aside>

        <aside className="w-full md:w-80 flex flex-col h-full gap-4">
          <div className="pointer-events-auto flex flex-col flex-1 glass-panel rounded-3xl overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide text-[12px]">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse text-right' : ''}`}>
                  <div className={`p-3 rounded-xl ${msg.role === 'user' ? 'bg-blue-600/20' : 'bg-white/5'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isGenerating && <Loader2 className="w-4 h-4 animate-spin opacity-30" />}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-black/40 flex gap-2">
              <input 
                value={prompt} 
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChat()}
                className="flex-1 bg-white/5 rounded-xl px-4 py-2 text-[12px] focus:outline-none"
                placeholder="Style command..."
              />
              <button onClick={handleChat} className="p-2 bg-blue-600 rounded-xl"><ChevronRight /></button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const ControlSlider = ({ label, value, min, max, step, onChange }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[8px] uppercase font-bold opacity-40">
      <span>{label}</span>
      <span className="text-blue-400">{value.toFixed(2)}</span>
    </div>
    <input 
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-white/5 rounded-full appearance-none accent-blue-500 cursor-pointer"
    />
  </div>
);

export default App;
