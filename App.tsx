
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
  ShieldCheck,
  Terminal,
  Layers
} from 'lucide-react';

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
  const [fps, setFps] = useState(0);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const updateStats = () => {
      const now = performance.now();
      setLatency(now - lastTime);
      frameCount++;
      
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

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

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
          console.warn("Geometric metadata parsing failed.");
        }
      }

      const displayText = rawResponse.replace(/\{[\s\S]*?\}/, '').trim();
      setChatHistory(prev => [...prev, { role: 'model', text: displayText || "Neural alignment complete." }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Signal instability detected. Please re-initiate uplink." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    
    setSubmittingEmail(true);
    setSubscriptionStatus('idle');
    
    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email, created_at: new Date().toISOString() }]);
        
      if (error) throw error;
      setSubscriptionStatus('success');
      setEmail('');
      setTimeout(() => setSubscriptionStatus('idle'), 6000);
    } catch (err) {
      setSubscriptionStatus('error');
    } finally {
      setSubmittingEmail(false);
    }
  };

  const updateParam = (key: keyof MorphState, val: string | number) => {
    setMorphState(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="relative w-screen h-screen bg-[#010103] text-white overflow-hidden select-none font-sans">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
         <div className="nebula-layer bg-blue-600/10 w-[100vw] h-[100vw] -top-1/4 -left-1/4" style={{'--speed': '60s'} as any} />
         <div className="nebula-layer bg-purple-600/10 w-[90vw] h-[90vw] -bottom-1/4 -right-1/4" style={{'--speed': '80s'} as any} />
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(1,1,3,0.9)_100%)]" />

         {/* Star Field */}
         <div className="absolute inset-0 opacity-20">
           {Array.from({ length: 100 }).map((_, i) => (
             <div 
               key={i} 
               className="star" 
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `${Math.random() * 100}%`,
                 width: `${Math.random() * 2}px`,
                 height: `${Math.random() * 2}px`,
                 "--duration": `${Math.random() * 3 + 2}s`
               } as any}
             />
           ))}
         </div>
      </div>

      <Scene morphState={morphState} />

      {/* Production HUD Header */}
      <header className="absolute top-0 left-0 w-full p-6 lg:p-10 flex justify-between items-start z-50 pointer-events-none ui-enter">
        <div className="pointer-events-auto">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.2)] backdrop-blur-md">
              <Layers className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white uppercase italic">
                Cosmic <span className="text-blue-500 not-italic">Morph</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[8px] uppercase tracking-[0.3em] text-green-400 font-mono font-bold">Vercel Deployment Live</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto hidden md:flex items-center gap-4">
          <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-6 border-white/10">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono font-bold text-cyan-400">{fps} FPS</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-mono font-bold text-purple-400">{latency.toFixed(0)} MS</span>
            </div>
          </div>
        </div>
      </header>

      {/* Control Workspace */}
      <div className="absolute inset-0 p-6 lg:p-10 pt-32 flex flex-col lg:flex-row justify-between pointer-events-none z-40 gap-8">
        
        {/* Left Column: Core Controls */}
        <aside className="w-full lg:w-80 flex flex-col gap-6 ui-enter" style={{ animationDelay: '0.1s' }}>
          <div className="pointer-events-auto glass-panel p-8 rounded-[2.5rem] border-white/5">
            <div className="flex items-center gap-4 mb-10">
              <Cpu className="w-5 h-5 text-blue-400" />
              <h2 className="font-bold text-[10px] tracking-[0.3em] uppercase opacity-70">Morph Engine v1.0</h2>
            </div>

            <div className="space-y-10">
              <ControlSlider label="Distortion" value={morphState.distort} min={0} max={2} step={0.01} onChange={(v) => updateParam('distort', v)} />
              <ControlSlider label="Velocity" value={morphState.speed} min={0} max={5} step={0.01} onChange={(v) => updateParam('speed', v)} />
              <ControlSlider label="Roughness" value={morphState.roughness} min={0} max={1} step={0.01} onChange={(v) => updateParam('roughness', v)} />
              
              <div className="pt-2">
                <p className="text-[9px] uppercase opacity-40 font-bold mb-4 tracking-[0.2em]">Color Profile</p>
                <div className="grid grid-cols-5 gap-3">
                  {PRESET_COLORS.map(c => (
                    <button 
                      key={c}
                      onClick={() => updateParam('color', c)}
                      className={`w-8 h-8 rounded-lg transition-all duration-300 ${morphState.color === c ? 'scale-125 border-2 border-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[9px] uppercase opacity-40 font-bold mb-4 tracking-[0.2em]">Environment</p>
                <div className="flex flex-wrap gap-2">
                  {ENVIRONMENTS.map(env => (
                    <button 
                      key={env.id}
                      onClick={() => updateParam('environment', env.id)}
                      className={`px-3 py-2 rounded-xl border text-[9px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${morphState.environment === env.id ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                    >
                      {env.id === morphState.environment && <div className="w-1 h-1 bg-black rounded-full" />}
                      {env.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: AI & Transmission */}
        <aside className="w-full lg:w-[400px] flex flex-col gap-6 h-full ui-enter" style={{ animationDelay: '0.2s' }}>
          
          {/* AI Terminal */}
          <div className="pointer-events-auto flex flex-col flex-1 glass-panel rounded-[2.5rem] overflow-hidden border-white/5">
            <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
               <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-70">AI Synthesizer</h2>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
                 <span className="text-[8px] font-mono opacity-40 uppercase">Ready</span>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
              {chatHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-20 space-y-4">
                  <MessageSquare className="w-8 h-8" />
                  <p className="text-[10px] tracking-[0.3em] uppercase font-bold">Initiate Command Sequence</p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-4`}>
                  <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center border ${msg.role === 'user' ? 'bg-blue-600/20 border-blue-500/30' : 'bg-purple-600/20 border-purple-500/30'}`}>
                     {msg.role === 'user' ? <User className="w-4 h-4 text-blue-300" /> : <Bot className="w-4 h-4 text-purple-300" />}
                  </div>
                  <div className={`px-5 py-3 rounded-2xl max-w-[80%] text-[13px] leading-relaxed ${msg.role === 'user' ? 'bg-blue-600/20 text-blue-50 border border-blue-500/10' : 'bg-white/5 text-white/90 border border-white/5'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex gap-4 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  </div>
                  <div className="bg-white/5 px-5 py-3 rounded-2xl border border-white/5 text-[11px] uppercase tracking-widest font-bold opacity-30">
                    Processing...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-6 bg-black/40 border-t border-white/5">
               <div className="relative">
                  <input 
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="E.g. 'Make it look like liquid gold'"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[13px] focus:outline-none focus:border-purple-500 transition-all pr-16 placeholder:opacity-20 font-medium"
                  />
                  <button 
                    onClick={handleChat}
                    disabled={isGenerating}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-purple-600 rounded-xl hover:bg-purple-500 transition-all disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
               </div>
            </div>
          </div>

          {/* Email Transmission */}
          <div className="pointer-events-auto glass-panel p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />
             
             <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center">
                   <Mail className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-70">Uplink Registration</h2>
             </div>
             
             <p className="text-[11px] text-white/40 mb-6 leading-relaxed uppercase tracking-wider font-bold">
               Receive core-level updates and experimental shaders.
             </p>

             <form onSubmit={handleEmailSubmit} className="relative">
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ID@ORBIT.LINK"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-4 text-[12px] font-mono focus:outline-none focus:border-cyan-500 transition-all pr-14 placeholder:opacity-20 uppercase"
                />
                <button 
                  type="submit"
                  disabled={submittingEmail}
                  className="absolute right-2 top-2 bottom-2 px-3 bg-cyan-600 rounded-lg hover:bg-cyan-500 transition-all disabled:opacity-50"
                >
                  {submittingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
             </form>
             
             <div className="mt-4 h-4">
                {subscriptionStatus === 'success' && <p className="text-[9px] text-green-400 uppercase font-bold tracking-widest animate-in slide-in-from-bottom-1">Transmission Success.</p>}
                {subscriptionStatus === 'error' && <p className="text-[9px] text-red-400 uppercase font-bold tracking-widest">Relay Failed.</p>}
             </div>
          </div>

        </aside>
      </div>

      {/* Footer Branding */}
      <footer className="absolute bottom-0 left-0 w-full p-8 lg:p-10 flex justify-between items-end pointer-events-none z-50 ui-enter">
        <div className="flex gap-8 text-[9px] font-mono opacity-40 uppercase tracking-[0.4em] font-bold">
           <span className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Production Node 01
           </span>
           <span className="hidden lg:inline">© 2024 Cosmic Studio</span>
        </div>
        <div className="pointer-events-auto">
          <button 
            onClick={() => { setMorphState(INITIAL_STATE); setChatHistory([]); }}
            className="flex items-center gap-3 text-[10px] font-bold opacity-40 hover:opacity-100 transition-all uppercase tracking-widest bg-white/5 px-6 py-3 rounded-full border border-white/5 hover:border-blue-500/20"
          >
            <RefreshCcw className="w-4 h-4" /> Reset Workspace
          </button>
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
    <div className="flex justify-between text-[9px] uppercase font-bold tracking-[0.2em] opacity-50">
      <span>{label}</span>
      <span className="text-blue-400 font-mono">{value.toFixed(2)}</span>
    </div>
    <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 group">
        <input 
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
    </div>
  </div>
);

export default App;
