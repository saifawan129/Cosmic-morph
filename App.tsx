
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

// Production Supabase Configuration - Updated with latest credentials
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

  // Background Nebula Layers for cinematic depth
  const nebulaLayers = useMemo(() => [
    { color: 'rgba(79, 70, 229, 0.25)', speed: '55s', top: '-25%', left: '-15%', size: '100vw' },
    { color: 'rgba(147, 51, 234, 0.22)', speed: '75s', bottom: '-15%', right: '-25%', size: '95vw' },
    { color: 'rgba(6, 182, 212, 0.18)', speed: '45s', top: '15%', right: '-10%', size: '70vw' },
  ], []);

  // Latency Monitoring for production stats
  useEffect(() => {
    const start = performance.now();
    const handle = requestAnimationFrame(() => {
      setLatency(performance.now() - start);
    });
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
      setChatHistory(prev => [...prev, { role: 'model', text: displayText || "System alignment synchronized." }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', text: "Signal instability detected. Retrying neural link..." }]);
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
      console.error("Supabase persistent error:", err);
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
      
      {/* Dynamic Background Rendering */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
         {nebulaLayers.map((layer, i) => (
           <div 
             key={i}
             className="nebula-layer" 
             style={{ 
               backgroundColor: layer.color,
               width: layer.size,
               height: layer.size,
               top: layer.top,
               left: layer.left,
               right: layer.right,
               bottom: layer.bottom,
               '--speed': layer.speed 
             } as any} 
           />
         ))}
         
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(1,1,3,0.95)_100%)]" />

         {/* Star Field Simulation */}
         <div className="absolute inset-0 opacity-40">
           {Array.from({ length: 120 }).map((_, i) => (
             <div 
               key={i} 
               className="star" 
               style={{
                 left: `${(i * 17.37) % 100}%`,
                 top: `${(i * 23.14) % 100}%`,
                 width: `${Math.random() * 2 + 0.5}px`,
                 height: `${Math.random() * 2 + 0.5}px`,
                 "--duration": `${Math.random() * 4 + 2}s`
               } as any}
             />
           ))}
         </div>
      </div>

      <Scene morphState={morphState} />

      {/* Persistent Header */}
      <header className="absolute top-0 left-0 w-full p-8 lg:p-12 flex justify-between items-start z-50 pointer-events-none ui-enter">
        <div className="pointer-events-auto">
          <div className="flex items-center gap-5 group">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform duration-500 backdrop-blur-md">
              <Maximize2 className="w-7 h-7 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-5xl font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-blue-500">
                COSMIC MORPH <span className="text-blue-500 font-extralight italic">STUDIO</span>
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-2 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[9px] uppercase tracking-[0.4em] text-green-400 font-mono font-bold">NODE_ACTIVE</p>
                </div>
                <p className="text-[9px] uppercase tracking-[0.2em] opacity-30 font-mono font-bold">Vercel Edge Deployment v5.0.1</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto hidden md:flex items-center gap-5">
          <div className="glass-panel px-8 py-5 rounded-[2.5rem] flex items-center gap-10">
            <div className="flex items-center gap-4">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase opacity-40 font-black tracking-[0.2em] leading-none mb-1">Security</span>
                <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-widest">Supabase_SSL</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-4">
              <Activity className="w-5 h-5 text-purple-400" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase opacity-40 font-black tracking-[0.2em] leading-none mb-1">Core_Health</span>
                <span className="text-[11px] font-mono text-purple-400 font-bold uppercase tracking-widest">Optimized</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <div className="absolute inset-0 p-8 lg:p-12 pt-[220px] flex flex-col lg:flex-row justify-between pointer-events-none z-40 gap-10">
        
        {/* Left Control Column */}
        <aside className="w-full lg:w-96 flex flex-col gap-8 ui-enter" style={{ animationDelay: '0.1s' }}>
          <div className="pointer-events-auto glass-panel p-10 rounded-[4rem] relative overflow-hidden group border-white/5">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-transparent" />
            
            <div className="flex items-center gap-5 mb-12">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Cpu className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="font-black text-sm tracking-[0.4em] uppercase text-white/90">Morph Engine</h2>
            </div>

            <div className="space-y-12">
              <ControlSlider label="Geometric Distortion" value={morphState.distort} min={0} max={2} step={0.1} onChange={(v) => updateParam('distort', v)} />
              <ControlSlider label="Oscillation Speed" value={morphState.speed} min={0} max={5} step={0.1} onChange={(v) => updateParam('speed', v)} />
              <ControlSlider label="Surface Roughness" value={morphState.roughness} min={0} max={1} step={0.05} onChange={(v) => updateParam('roughness', v)} />
              
              <div className="pt-4">
                <p className="text-[11px] uppercase opacity-60 font-black mb-6 tracking-[0.3em] flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,1)]" />
                  Color Matrix
                </p>
                <div className="grid grid-cols-5 gap-4">
                  {PRESET_COLORS.map(c => (
                    <button 
                      key={c}
                      onClick={() => updateParam('color', c)}
                      className={`w-11 h-11 rounded-[1.25rem] border-2 transition-all duration-500 flex items-center justify-center hover:scale-125 active:scale-90 ${morphState.color === c ? 'border-white shadow-[0_0_30px_rgba(255,255,255,0.4)] rotate-12 scale-110' : 'border-transparent opacity-30 hover:opacity-100'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase opacity-60 font-black mb-6 tracking-[0.3em] flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,1)]" />
                  Ambient Lighting
                </p>
                <div className="flex flex-wrap gap-3">
                  {ENVIRONMENTS.map(env => (
                    <button 
                      key={env.id}
                      onClick={() => updateParam('environment', env.id)}
                      className={`px-5 py-4 rounded-[1.5rem] border text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all ${morphState.environment === env.id ? 'bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.5)] scale-105' : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}`}
                    >
                      {env.icon}
                      {env.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Interaction Column */}
        <aside className="w-full lg:w-[480px] flex flex-col gap-8 h-full pb-10 ui-enter" style={{ animationDelay: '0.2s' }}>
          
          {/* AI Communication Interface */}
          <div className="pointer-events-auto flex flex-col flex-1 glass-panel rounded-[4rem] overflow-hidden border-white/5">
            <div className="p-10 border-b border-white/10 flex items-center justify-between bg-white/[0.03] backdrop-blur-2xl">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-purple-600 to-indigo-800 p-[2px] shadow-[0_0_35px_rgba(147,51,234,0.4)] group">
                      <div className="w-full h-full bg-[#0a0a14] rounded-[1.4rem] flex items-center justify-center transition-all group-hover:bg-[#151525]">
                        <Sparkles className="w-7 h-7 text-purple-400 animate-pulse" />
                      </div>
                  </div>
                  <div>
                      <h2 className="text-base font-black tracking-[0.4em] uppercase text-white/95 leading-none mb-2">AI Synthesizer</h2>
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
                        <p className="text-[10px] text-purple-400 uppercase font-mono tracking-widest font-black">Neural_Array_Online</p>
                      </div>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 font-sans scrollbar-hide">
              {chatHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-30 space-y-8 px-12">
                  <div className="w-24 h-24 rounded-[3rem] border-2 border-dashed border-white/15 flex items-center justify-center rotate-45 animate-spin-slow">
                      <MessageSquare className="w-10 h-10 -rotate-45" />
                  </div>
                  <p className="text-[12px] tracking-[0.5em] uppercase font-black text-blue-200">Awaiting visual synchronization</p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-6 duration-700`}>
                  <div className={`w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center border shadow-2xl backdrop-blur-md ${msg.role === 'user' ? 'bg-blue-600/20 border-blue-500/50' : 'bg-purple-600/20 border-purple-500/50'}`}>
                     {msg.role === 'user' ? <User className="w-6 h-6 text-blue-300" /> : <Bot className="w-6 h-6 text-purple-300" />}
                  </div>
                  <div className={`px-7 py-5 rounded-[2.2rem] max-w-[85%] leading-relaxed text-[14px] font-medium shadow-2xl transition-all hover:scale-[1.02] ${msg.role === 'user' ? 'bg-blue-600/30 text-blue-50 rounded-tr-none border border-blue-500/20' : 'bg-white/10 text-white/90 rounded-tl-none border border-white/5'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex gap-6">
                  <div className="w-11 h-11 rounded-2xl bg-purple-600/20 border border-purple-500/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                  </div>
                  <div className="bg-white/5 px-7 py-5 rounded-[2.2rem] rounded-tl-none border border-white/10 text-[12px] italic opacity-40 animate-pulse tracking-[0.2em] uppercase font-bold">
                    Analyzing Geometric Harmonics...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-10 bg-black/50 border-t border-white/10 backdrop-blur-3xl">
               <div className="relative group">
                  <input 
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="Describe a geometric state..."
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 text-[15px] focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all pr-20 placeholder:text-white/10 font-bold tracking-wide"
                  />
                  <button 
                    onClick={handleChat}
                    disabled={isGenerating}
                    className="absolute right-3 top-3 bottom-3 px-6 bg-purple-600 rounded-[1.5rem] hover:bg-purple-500 active:scale-95 transition-all disabled:opacity-50 shadow-2xl shadow-purple-900/50 flex items-center justify-center group/btn"
                  >
                    <ChevronRight className="w-7 h-7 text-white group-hover/btn:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>
          </div>

          {/* Identity Transmission Node */}
          <div className="pointer-events-auto glass-panel p-10 rounded-[4rem] relative overflow-hidden group border-white/5">
             <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[120px] rounded-full group-hover:bg-cyan-500/20 transition-all duration-1000" />
             
             <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 rounded-[1.5rem] bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.35)] group-hover:scale-110 transition-transform duration-700">
                   <Mail className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-[0.4em] uppercase text-white/95 leading-none mb-2">Transmission Link</h2>
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-cyan-500/60 animate-spin-slow" />
                    <span className="text-[10px] text-cyan-400 font-mono tracking-widest font-black uppercase">Supabase_Relay_Active</span>
                  </div>
                </div>
             </div>
             
             <p className="text-[12px] text-blue-100/60 mb-10 leading-relaxed uppercase tracking-[0.2em] font-bold drop-shadow-md">
               Register your identity with the central fleet. Receive prioritized core updates and experimental visual shaders.
             </p>

             <form onSubmit={handleEmailSubmit} className="relative">
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="IDENTITY@COSMOS.LINK"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-[1.5rem] px-8 py-6 text-[13px] font-mono font-bold focus:outline-none focus:border-cyan-500 focus:bg-white/[0.08] transition-all pr-20 placeholder:opacity-20 uppercase tracking-widest"
                />
                <button 
                  type="submit"
                  disabled={submittingEmail}
                  className="absolute right-3 top-3 bottom-3 px-6 bg-cyan-600 rounded-xl hover:bg-cyan-500 transition-all flex items-center justify-center disabled:opacity-50 shadow-[0_15px_30px_rgba(6,182,212,0.4)] active:scale-95 group/btn"
                >
                  {submittingEmail ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />}
                </button>
             </form>
             
             <div className="mt-6 h-5">
                {subscriptionStatus === 'success' && (
                  <p className="text-[11px] text-green-400 animate-in fade-in slide-in-from-bottom-2 uppercase font-black tracking-[0.3em] flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full shadow-[0_0_15px_rgba(74,222,128,1)]" /> Broadcast Finalized. Identity Authenticated.
                  </p>
                )}
                {subscriptionStatus === 'error' && (
                  <p className="text-[11px] text-red-400 animate-in fade-in slide-in-from-bottom-2 uppercase font-black tracking-[0.3em] flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-red-400 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)]" /> Transmission Error. Re-initiate link.
                  </p>
                )}
             </div>
          </div>

        </aside>
      </div>

      {/* Global Interface Footer */}
      <footer className="absolute bottom-0 left-0 w-full p-10 lg:p-12 flex justify-between items-end pointer-events-none z-50 ui-enter">
        <div className="flex gap-16 text-[11px] font-mono opacity-50 uppercase tracking-[0.6em] font-black">
           <span className="flex items-center gap-5">
             <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_25px_blue]" />
             Stream_Pulse: Optimized
           </span>
           <span className="hidden lg:inline text-white/40">GCP_Instance_Load: {(Math.random() * 5 + 2).toFixed(1)}%</span>
           <span className="text-cyan-400/80 font-bold">RTT: {latency.toFixed(1)}ms</span>
        </div>
        <div className="pointer-events-auto">
          <button 
            onClick={() => { setMorphState(INITIAL_STATE); setChatHistory([]); }}
            className="group flex items-center gap-5 text-[12px] font-black opacity-50 hover:opacity-100 transition-all uppercase tracking-[0.4em] bg-white/[0.03] px-10 py-5 rounded-[2rem] border border-white/5 hover:border-blue-500/40 hover:bg-blue-500/5 backdrop-blur-3xl shadow-2xl"
          >
            <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
            Full_System_Purge
          </button>
        </div>
      </footer>

      {/* Volumetric Cursor Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[60] bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,50%),rgba(59,130,246,0.08)_0%,transparent_65%)]" 
           onMouseMove={(e) => {
             const el = e.currentTarget as HTMLElement;
             el.style.setProperty('--x', e.clientX + 'px');
             el.style.setProperty('--y', e.clientY + 'px');
           }} 
      />
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
  <div className="space-y-6">
    <div className="flex justify-between text-[11px] uppercase font-black tracking-[0.4em]">
      <span className="opacity-40">{label}</span>
      <span className="text-blue-400 font-mono text-[16px] drop-shadow-[0_0_15px_rgba(96,165,250,0.8)] font-black">{value.toFixed(2)}</span>
    </div>
    <div className="relative h-4 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/5 group shadow-inner">
        <input 
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-900 via-blue-500 to-cyan-300 transition-all duration-500 shadow-[0_0_30px_rgba(59,130,246,0.7)]"
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        >
          <div className="absolute top-0 right-0 w-12 h-full bg-white/30 blur-xl" />
        </div>
    </div>
  </div>
);

export default App;
