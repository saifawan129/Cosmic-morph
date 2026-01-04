
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Scene } from './components/Scene';
import { MorphState } from './types';
import { chatWithAssistant } from './geminiService';
import { createClient } from '@supabase/supabase-js';
import { 
  Maximize2, 
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
  Mail,
  Send,
  Globe,
  Activity,
  ShieldCheck
} from 'lucide-react';

// Production Supabase Configuration
const SUPABASE_URL = 'https://jfzefdbgbygjybkvsgvv.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_J9UIYBKMF-dTWYJDciXzvA_0LoZVCeQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const INITIAL_STATE: MorphState = {
  color: '#4e54c8',
  roughness: 0.1,
  metalness: 0.8,
  distort: 0.4,
  speed: 1.5,
  scale: 1.5,
  name: 'Nebula Core X1',
  environment: 'city'
};

const ENVIRONMENTS: { id: MorphState['environment']; label: string; icon: React.ReactNode }[] = [
  { id: 'city', label: 'City', icon: <Home className="w-3 h-3" /> },
  { id: 'studio', label: 'Studio', icon: <Zap className="w-3 h-3" /> },
  { id: 'sunset', label: 'Sunset', icon: <Sun className="w-3 h-3" /> },
  { id: 'night', label: 'Night', icon: <Moon className="w-3 h-3" /> },
  { id: 'forest', label: 'Forest', icon: <Cloud className="w-3 h-3" /> },
];

const PRESET_COLORS = [
  '#4e54c8', '#ff0055', '#00ffaa', '#ffd700', '#ffffff', '#ff4500', '#8a2be2', '#00d4ff', '#ff00ff'
];

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const App: React.FC = () => {
  const [morphState, setMorphState] = useState<MorphState>(INITIAL_STATE);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [email, setEmail] = useState('');
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [latency, setLatency] = useState(0);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Background stars - reduced count for performance
  const stars = useMemo(() => Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 3 + 2
  })), []);

  useEffect(() => {
    const start = performance.now();
    const handle = requestAnimationFrame(() => setLatency(performance.now() - start));
    return () => cancelAnimationFrame(handle);
  }, []);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [chatHistory]);

  const handleChat = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    const userMessage: ChatMessage = { role: 'user', text: prompt };
    setChatHistory(prev => [...prev, userMessage]);
    setPrompt('');
    setIsGenerating(true);

    try {
      const historyForApi = chatHistory.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const rawResponse = await chatWithAssistant(prompt, historyForApi);
      
      const jsonMatch = rawResponse.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        try {
          const newState = JSON.parse(jsonMatch[0]);
          setMorphState(prev => ({
            ...prev,
            ...newState,
            distort: Math.max(0, Math.min(2, newState.distort ?? prev.distort)),
            roughness: Math.max(0, Math.min(1, newState.roughness ?? prev.roughness)),
            speed: Math.max(0, Math.min(5, newState.speed ?? prev.speed)),
          }));
        } catch (e) {
          console.warn("Parsing failed.");
        }
      }

      const displayText = rawResponse.replace(/\{[\s\S]*?\}/, '').trim();
      setChatHistory(prev => [...prev, { role: 'model', text: displayText || "Alignment synchronized." }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Signal instability detected." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubmittingEmail(true);
    try {
      const { error } = await supabase.from('subscribers').insert([{ email, created_at: new Date().toISOString() }]);
      if (error) throw error;
      setSubscriptionStatus('success');
      setEmail('');
      setTimeout(() => setSubscriptionStatus('idle'), 5000);
    } catch (err) {
      setSubscriptionStatus('error');
    } finally {
      setSubmittingEmail(false);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#010103] text-white overflow-hidden select-none">
      
      {/* Background System */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="nebula-v2" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0">
          {stars.map((star) => (
            <div 
              key={star.id} 
              className="star" 
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animation: `twinkle ${star.duration}s infinite ease-in-out`
              }}
            />
          ))}
        </div>
      </div>

      <Scene morphState={morphState} />

      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-6 lg:p-10 flex justify-between items-start z-50 pointer-events-none ui-enter">
        <div className="pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center backdrop-blur-md">
              <Maximize2 className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-blue-400">
                COSMIC MORPH
              </h1>
              <p className="text-[9px] uppercase tracking-[0.4em] text-blue-500/60 font-mono font-bold">NODE_OPTIMIZED_V5</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 pointer-events-auto">
          <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest">Perf_Target_60</span>
            </div>
          </div>
        </div>
      </header>

      {/* Control Grid */}
      <div className="absolute inset-0 p-6 lg:p-10 pt-32 lg:pt-40 flex flex-col lg:flex-row justify-between pointer-events-none z-40 gap-8 overflow-y-auto scrollbar-hide">
        
        {/* Left Controls */}
        <aside className="w-full lg:w-80 flex flex-col gap-6 ui-enter" style={{ animationDelay: '0.1s' }}>
          <div className="pointer-events-auto glass-panel p-8 rounded-[2.5rem] border-white/5">
            <div className="flex items-center gap-3 mb-8">
              <Cpu className="w-5 h-5 text-blue-400" />
              <h2 className="font-black text-[10px] tracking-[0.3em] uppercase opacity-70">Morph Engine</h2>
            </div>

            <div className="space-y-8">
              <ControlSlider label="Distortion" value={morphState.distort} min={0} max={2} step={0.1} onChange={(v) => setMorphState(s => ({...s, distort: v}))} />
              <ControlSlider label="Speed" value={morphState.speed} min={0} max={5} step={0.1} onChange={(v) => setMorphState(s => ({...s, speed: v}))} />
              
              <div className="pt-4">
                <p className="text-[9px] uppercase opacity-40 font-black mb-4 tracking-[0.2em]">Color Core</p>
                <div className="grid grid-cols-5 gap-3">
                  {PRESET_COLORS.map(c => (
                    <button 
                      key={c}
                      onClick={() => setMorphState(s => ({...s, color: c}))}
                      className={`w-9 h-9 rounded-xl border-2 transition-all ${morphState.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[9px] uppercase opacity-40 font-black mb-4 tracking-[0.2em]">Atmosphere</p>
                <div className="flex flex-wrap gap-2">
                  {ENVIRONMENTS.map(env => (
                    <button 
                      key={env.id}
                      onClick={() => setMorphState(s => ({...s, environment: env.id}))}
                      className={`px-3 py-2 rounded-xl border text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${morphState.environment === env.id ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                    >
                      {env.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Chat */}
        <aside className="w-full lg:w-96 flex flex-col gap-6 h-full pb-10 ui-enter" style={{ animationDelay: '0.2s' }}>
          <div className="pointer-events-auto flex flex-col flex-1 glass-panel rounded-[2.5rem] overflow-hidden border-white/5">
            <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-white/5">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-[11px] font-black tracking-[0.3em] uppercase">Synthesizer</h2>
                    <p className="text-[8px] text-purple-400 font-mono tracking-widest">NEURAL_LINK_OK</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border ${msg.role === 'user' ? 'bg-blue-600/20 border-blue-500/30' : 'bg-purple-600/20 border-purple-500/30'}`}>
                     {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-[13px] ${msg.role === 'user' ? 'bg-blue-600/30 border border-blue-500/20' : 'bg-white/5 border border-white/10'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isGenerating && <div className="text-[10px] opacity-40 uppercase tracking-widest animate-pulse">Processing...</div>}
              <div ref={chatEndRef} />
            </div>

            <div className="p-6 bg-black/20 border-t border-white/5">
               <div className="relative">
                  <input 
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="Describe design..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-purple-500 transition-all pr-12"
                  />
                  <button onClick={handleChat} disabled={isGenerating} className="absolute right-2 top-2 bottom-2 px-3 bg-purple-600 rounded-xl hover:bg-purple-500 disabled:opacity-50">
                    <ChevronRight className="w-5 h-5" />
                  </button>
               </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer Stats */}
      <footer className="absolute bottom-0 left-0 w-full p-8 flex justify-between items-end pointer-events-none z-50">
        <div className="flex gap-10 text-[9px] font-mono opacity-40 uppercase tracking-[0.4em] font-bold">
           <span>Pulse: {latency.toFixed(1)}ms</span>
           <span className="hidden lg:inline">Status: Operational</span>
        </div>
      </footer>
    </div>
  );
};

const ControlSlider: React.FC<{ 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  step: number; 
  onChange: (v: number) => void 
}> = ({ label, value, min, max, step, onChange }) => (
  <div className="space-y-4">
    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest opacity-60">
      <span>{label}</span>
      <span className="text-blue-400">{value.toFixed(2)}</span>
    </div>
    <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <input 
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div 
          className="absolute top-0 left-0 h-full bg-blue-500"
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
    </div>
  </div>
);

export default App;
