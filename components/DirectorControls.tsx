import React, { useState, useRef } from 'react';
import { Camera, Video, Square, Play, MousePointer2, X, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Transaction, LogEntry, Agent } from '../types';

interface DirectorControlsProps {
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  setActiveView: (view: string) => void;
  setIsSimulating: (val: boolean) => void;
  mockConnectWallet: () => void;
  activeView: string;
}

// 5 Minute Script (300,000ms total roughly)
// Format: action: 'cmd:target' or 'wait' or 'inject:activity'
const DEMO_SCRIPT = [
  // --- INTRO (0:00 - 0:45) ---
  { duration: 5000, text: "Welcome to the future of the Agentic Economy.", action: 'view:dashboard' },
  { duration: 8000, text: "We are entering an era where AI agents perform complex tasks independently.", action: 'move:nav-dashboard' },
  { duration: 7000, text: "But there is one major barrier: Financial Autonomy.", action: 'highlight:stats' },
  { duration: 8000, text: "Today, an AI agent cannot open a bank account. They are financially paralyzed.", action: 'wait' },
  { duration: 7000, text: "Introducing AgentPay OS. The first Treasury Management System for AI.", action: 'move:nav-dashboard' },
  { duration: 10000, text: "It allows us to provision wallets, set spending budgets, and execute on-chain payments.", action: 'inject:activity' },

  // --- TREASURY (0:45 - 1:45) ---
  { duration: 5000, text: "Let's look at our fleet.", action: 'move:nav-agents' },
  { duration: 2000, text: "Navigating to Agent Treasury...", action: 'click:nav-agents' },
  { duration: 8000, text: "Here we have our Alpha Research Unit, Omni Data Source, and GPU Cluster.", action: 'highlight:agent-card' },
  { duration: 8000, text: "Right now, the Research Unit is running low on funds.", action: 'wait' },
  { duration: 5000, text: "Unlike a simulation, AgentPay OS connects to the real blockchain.", action: 'move:connect-wallet' },
  { duration: 3000, text: "Connecting Treasury Master Key...", action: 'click:connect-wallet' },
  { duration: 5000, text: "Now that I'm authenticated, I can fund this agent.", action: 'move:fund-btn' },
  { duration: 4000, text: "Sending 500 MNEE tokens...", action: 'click:fund-btn' },
  { duration: 10000, text: "This transaction is happening on-chain. MNEE provides stable value transfer.", action: 'wait' },
  { duration: 5000, text: "And there it is. The agent is capitalized.", action: 'inject:activity' },

  // --- SIMULATION (1:45 - 3:30) ---
  { duration: 5000, text: "Now, let's take the human out of the loop.", action: 'move:nav-sim' },
  { duration: 2000, text: "Entering Simulation Engine...", action: 'click:nav-sim' },
  { duration: 8000, text: "On the right, the terminal output. On the left, the logic.", action: 'move:start-agents' },
  { duration: 3000, text: "Activating the swarm.", action: 'click:start-agents' },
  { duration: 10000, text: "Watch closely. The Researcher realizes it's missing data.", action: 'inject:activity' },
  { duration: 10000, text: "It queries the network and finds 'Omni Data Source'.", action: 'inject:activity' },
  { duration: 10000, text: "It wants to buy. But first, it must check the Smart Contract Governance.", action: 'inject:activity' },
  { duration: 10000, text: "The system validates: Is this within the daily limit?", action: 'inject:activity' },
  { duration: 10000, text: "Passed. Payment executed. 200 MNEE moved instantly.", action: 'inject:activity' },
  
  // Dashboard Peek during Simulation
  { duration: 5000, text: "Let's check the economy impact.", action: 'move:nav-dash' },
  { duration: 2000, text: "Back to Dashboard...", action: 'click:nav-dash' },
  { duration: 15000, text: "See the Real-Time Chart? Balances are shifting live as agents trade.", action: 'inject:activity' },
  { duration: 5000, text: "Returning to simulation...", action: 'move:nav-sim' },
  { duration: 2000, text: "Viewing logs...", action: 'click:nav-sim' },
  { duration: 15000, text: "The simulation continues autonomously. Compute is being leased now.", action: 'inject:activity' },

  // --- SMART CONTRACTS (3:30 - 4:15) ---
  { duration: 5000, text: "How do we trust this?", action: 'move:nav-contracts' },
  { duration: 2000, text: "Opening Smart Contracts...", action: 'click:nav-contracts' },
  { duration: 10000, text: "This is the AgentWallet.sol contract. Every agent uses this.", action: 'move:code-viewer' },
  { duration: 10000, text: "It enforces daily limits that reset every 24 hours.", action: 'scroll:code-viewer' },
  { duration: 10000, text: "It also checks category whitelists. Storage agents cannot buy Compute.", action: 'scroll:code-viewer' },
  { duration: 8000, text: "This ensures that even if an agent hallucinates, funds are safe.", action: 'wait' },

  // --- CONCLUSION (4:15 - 5:00) ---
  { duration: 5000, text: "The future isn't just about smarter models.", action: 'move:nav-dash' },
  { duration: 2000, text: "Final check...", action: 'click:nav-dash' },
  { duration: 10000, text: "It's about how those models interact with the economy.", action: 'inject:activity' },
  { duration: 10000, text: "AgentPay OS provides the missing financial rails.", action: 'inject:activity' },
  { duration: 8000, text: "Agents transact. Humans govern.", action: 'wait' },
  { duration: 10000, text: "Built with React, Ethers.js, and MNEE. Thank you.", action: 'finish' },
];

export const DirectorControls: React.FC<DirectorControlsProps> = ({ 
  setTransactions, 
  setLogs, 
  setAgents,
  setActiveView,
  setIsSimulating,
  mockConnectWallet,
  activeView
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingScript, setIsPlayingScript] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState("");
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const isPlayingScriptRef = useRef(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  // --- Virtual Mouse & Automation Engine ---

  const moveMouseToElement = (selector: string): boolean => {
    let el: HTMLElement | null = null;
    
    if (!selector.includes('.') && !selector.includes(' ') && !selector.includes(':')) {
       el = document.getElementById(selector);
    } 
    
    if (!el) {
       el = document.querySelector(selector) as HTMLElement;
    }

    if (el) {
      const rect = el.getBoundingClientRect();
      const randomX = Math.random() * 20 - 10;
      const randomY = Math.random() * 20 - 10;
      setMousePos({ 
        x: rect.left + rect.width / 2 + randomX, 
        y: rect.top + rect.height / 2 + randomY 
      });
      return true;
    }
    return false;
  };

  const processAction = async (action: string) => {
    const [cmd, target] = action.split(':');

    const targetMap: Record<string, string> = {
      'nav-agents': 'nav-agents',
      'nav-sim': 'nav-simulation',
      'nav-dash': 'nav-dashboard',
      'nav-contracts': 'nav-contracts',
      'connect-wallet': 'btn-connect-wallet',
      'fund-btn': 'btn-fund-agent-ag_1',
      'start-agents': 'btn-start-simulation',
      'code-viewer': 'code-viewer-content'
    };

    if (cmd === 'view') {
       setActiveView(target);
       await new Promise(r => setTimeout(r, 500));
    } 
    else if (cmd === 'move') {
      const selector = targetMap[target] || target;
      moveMouseToElement(selector);
    } 
    else if (cmd === 'click') {
      // Visual Click
      const clickRipple = document.createElement('div');
      Object.assign(clickRipple.style, {
        position: 'fixed',
        left: `${mousePos.x}px`,
        top: `${mousePos.y}px`,
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: 'rgba(243, 187, 50, 0.5)',
        transform: 'translate(-50%, -50%) scale(0)',
        transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
        pointerEvents: 'none',
        zIndex: '9999'
      });
      document.body.appendChild(clickRipple);
      requestAnimationFrame(() => {
        clickRipple.style.transform = 'translate(-50%, -50%) scale(3)';
        clickRipple.style.opacity = '0';
      });
      setTimeout(() => clickRipple.remove(), 500);

      // Logic
      if (target === 'nav-agents') setActiveView('agents');
      if (target === 'nav-sim') setActiveView('simulation');
      if (target === 'nav-dash') setActiveView('dashboard');
      if (target === 'nav-contracts') setActiveView('contracts');
      if (target === 'connect-wallet') mockConnectWallet();
      if (target === 'start-agents') setIsSimulating(true);
      if (target === 'fund-btn') {
        const agentName = "Alpha Research Unit";
        setAgents(prev => prev.map(a => a.name === agentName ? {...a, balance: a.balance + 500} : a));
      }
    }
    else if (cmd === 'scroll') {
       const el = document.getElementById('code-viewer-content');
       if (el) {
         el.scrollBy({ top: 150, behavior: 'smooth' });
       }
    }
    else if (cmd === 'inject') {
       // Micro-movements to data to simulate liveliness
       setAgents(prev => prev.map(a => {
         if (Math.random() > 0.5) return a;
         const change = Math.floor(Math.random() * 10) - 5;
         return {...a, balance: a.balance + change};
       }));
    }
  };

  const startSequence = async () => {
    // 1. Get Stream IMMEDIATELY (User gesture preservation)
    let stream: MediaStream;
    try {
      // NOTE: cursor: 'never' is a Chrome-specific constraint and might be ignored by other browsers.
      // We cast to any to avoid TS errors.
      stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { 
          frameRate: 30,
          cursor: "never"
        } as any,
        audio: true 
      });
    } catch (e) {
      console.error("Failed to get display media", e);
      // If user cancelled, just return
      return;
    }

    // 2. Start Countdown (Now that we have the stream, we can delay)
    setCountdown(3);
    await new Promise(r => setTimeout(r, 1000));
    setCountdown(2);
    await new Promise(r => setTimeout(r, 1000));
    setCountdown(1);
    await new Promise(r => setTimeout(r, 1000));
    setCountdown(null);

    // 3. Start Recording
    startRecordingStream(stream);

    // 4. Run Script
    setIsPlayingScript(true);
    isPlayingScriptRef.current = true;
    
    for (const step of DEMO_SCRIPT) {
      if (!isPlayingScriptRef.current) break;

      setCurrentSubtitle(step.text);
      await processAction(step.action);
      
      // Split duration into small chunks to allow interrupt or injects
      const steps = step.duration / 500;
      for (let i = 0; i < steps; i++) {
        if (!isPlayingScriptRef.current) break;
        // Inject random movement during long waits
        if (step.action === 'inject:activity' || step.action === 'wait') {
           if (Math.random() > 0.8) processAction('inject:activity');
        }
        await new Promise(r => setTimeout(r, 500));
      }
    }
    
    stopDirectorMode();
  };

  const stopDirectorMode = () => {
    setIsPlayingScript(false);
    isPlayingScriptRef.current = false;
    setCurrentSubtitle("");
    if (isRecording) stopRecording();
  };

  // --- Recorder Logic ---

  const startRecordingStream = (stream: MediaStream) => {
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    chunksRef.current = [];
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agentpay_5min_demo_${Date.now()}.webm`;
      a.click();
      stream.getTracks().forEach(track => track.stop());
    };
    
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const handleRecordToggle = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: { 
            frameRate: 30,
            cursor: "never"
          } as any,
          audio: true 
        });
        startRecordingStream(stream);
      } catch (e) {
        console.error("Recording started failed", e);
      }
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleScreenshot = async () => {
    if (panelRef.current) panelRef.current.style.display = 'none';
    try {
      const root = document.getElementById('root');
      if (root) {
        const canvas = await html2canvas(root, { backgroundColor: '#051320', scale: 2 });
        const link = document.createElement('a');
        link.download = `agentpay_shot_${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (panelRef.current) panelRef.current.style.display = 'block';
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => setIsMinimized(false)}
          className="bg-brand-accent text-brand-primary p-2 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex flex-col items-center justify-center backdrop-blur-md">
           <div className="text-9xl font-bold text-white animate-ping">{countdown}</div>
           <p className="text-2xl text-brand-accent mt-8 font-bold">MOVE YOUR REAL MOUSE OFF SCREEN!</p>
        </div>
      )}

      {/* Ghost Mouse Cursor */}
      {isPlayingScript && (
        <div 
          style={{ 
            left: mousePos.x, 
            top: mousePos.y,
            transition: 'top 1s cubic-bezier(0.25, 0.1, 0.25, 1), left 1s cubic-bezier(0.25, 0.1, 0.25, 1)'
          }}
          className="fixed z-[9999] pointer-events-none drop-shadow-2xl"
        >
          <MousePointer2 className="w-8 h-8 text-white fill-brand-accent transform -rotate-12" />
        </div>
      )}

      {/* Teleprompter Subtitles */}
      {isPlayingScript && currentSubtitle && (
        <div className="fixed bottom-10 left-0 w-full flex justify-center z-[9000] pointer-events-none">
          <div className="bg-black/70 backdrop-blur-md px-8 py-4 rounded-full border border-brand-accent/30 text-white text-xl font-medium shadow-2xl animate-fade-in max-w-4xl text-center">
            {currentSubtitle}
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div 
        ref={panelRef}
        className={`fixed bottom-4 right-4 z-50 bg-black/80 backdrop-blur-md border border-brand-border rounded-xl shadow-2xl w-72 overflow-hidden transition-opacity ${isPlayingScript ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
      >
        <div className="flex items-center justify-between px-4 py-2 bg-brand-surface border-b border-brand-border">
          <div className="flex items-center space-x-2">
            <Video className="w-4 h-4 text-brand-accent" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Director Studio</span>
          </div>
          <button onClick={() => setIsMinimized(true)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          
          {/* Auto-Pilot Big Button */}
          {!isPlayingScript ? (
            <button 
              onClick={startSequence}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-gradient-to-r from-brand-accent to-brand-secondary text-brand-primary font-bold shadow-lg hover:brightness-110 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start 5-Min Demo</span>
            </button>
          ) : (
            <button 
              onClick={stopDirectorMode}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-lg bg-red-600 text-white font-bold shadow-lg hover:bg-red-500 transition-all animate-pulse"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Recording</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => handleRecordToggle()}
              className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-xs font-bold border transition-all ${
                isRecording 
                  ? 'bg-red-900/50 text-red-400 border-red-500' 
                  : 'bg-brand-surface border-brand-border text-slate-300 hover:bg-brand-border'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-slate-500'}`} />
              <span>{isRecording ? 'REC' : 'Manual Rec'}</span>
            </button>
            
            <button 
              onClick={handleScreenshot}
              className="flex items-center justify-center space-x-2 py-2 rounded-lg bg-brand-surface border border-brand-border text-slate-300 hover:bg-brand-border text-xs font-bold"
            >
              <Camera className="w-3 h-3" />
              <span>Snapshot</span>
            </button>
          </div>

          <div className="bg-brand-primary/50 p-3 rounded border border-brand-border">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Status</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Script Engine:</span>
              <span className={isPlayingScript ? "text-green-400 font-mono" : "text-slate-500 font-mono"}>
                {isPlayingScript ? "RUNNING" : "IDLE"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-slate-300">Demo Length:</span>
              <span className="text-brand-accent font-mono">5m 00s</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};