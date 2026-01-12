import React, { useState, useRef } from 'react';
import { Camera, Video, Square, Play, MousePointer2, X, Loader2, Upload, Music, Trash2 } from 'lucide-react';
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
const DEMO_SCRIPT = [
  // --- INTRO (0:00 - 0:45) ---
  { duration: 4000, text: "Welcome to AgentPay OS. The financial operating system for the AI economy.", action: 'move:nav-dashboard' },
  { duration: 4000, text: "As AI agents become autonomous, they face a critical barrier: They cannot bank.", action: 'move:stat-liquidity' }, 
  { duration: 5000, text: "They can generate code and art, but they cannot pay for their own resources.", action: 'move:nav-agents' },
  { duration: 5000, text: "We built the missing Treasury Layer. Secure, on-chain, and human-governed.", action: 'move:btn-connect-wallet' },
  { duration: 6000, text: "Let's log in. I'm connecting the Master Treasury Key via MetaMask.", action: 'click:connect-wallet' },
  { duration: 4000, text: "Authenticated. Access granted to the Organization's funds.", action: 'move:stat-wallet-balance' },

  // --- TREASURY & FUNDING (0:45 - 1:45) ---
  { duration: 3000, text: "First, let's inspect our fleet of autonomous agents.", action: 'move:nav-agents' },
  { duration: 1000, text: "Navigating...", action: 'click:nav-agents' },
  { duration: 5000, text: "We have three active agents: A Researcher, a Data Provider, and a GPU Cluster.", action: 'move:agent-card-ag_1' },
  { duration: 5000, text: "The Alpha Research Unit is our primary spender. It buys data to train models.", action: 'move:agent-card-ag_2' },
  { duration: 6000, text: "Notice the Data Source agent. It earns MNEE tokens by selling datasets.", action: 'move:agent-card-ag_3' },
  { duration: 5000, text: "The GPU Cluster leases compute power. It's expensive.", action: 'move:btn-fund-agent-ag_1' },
  { duration: 5000, text: "Our Researcher is running low. Let's provision funds manually first.", action: 'click:fund-btn' }, 
  { duration: 6000, text: "I'm sending 500 MNEE. This is a real on-chain ERC-20 transfer.", action: 'wait' },
  { duration: 4000, text: "Transaction confirmed. The balance updates instantly.", action: 'inject:activity' },
  { duration: 5000, text: "Now that it's funded, we can enable autonomous mode.", action: 'move:nav-sim' },

  // --- SIMULATION (1:45 - 3:15) ---
  { duration: 2000, text: "Switching to the Simulation Engine...", action: 'click:nav-sim' },
  { duration: 5000, text: "This is the brain of the operation. Node.js agents interacting via smart contracts.", action: 'move:terminal-output' },
  { duration: 5000, text: "On the left: Control & Status. On the right: The live terminal feed.", action: 'move:btn-start-simulation' },
  { duration: 3000, text: "Initializing the swarm...", action: 'click:start-agents' },
  { duration: 5000, text: "The system is live. Agents are now waking up and assessing their needs.", action: 'inject:activity' },
  
  // Scenario 1
  { duration: 6000, text: "[Event] The Researcher detects a gap in its financial training data.", action: 'move:terminal-output' }, 
  { duration: 6000, text: "It pings the network. 'Omni Data Source' responds with availability.", action: 'inject:activity' },
  { duration: 6000, text: "The Researcher requests an invoice. Cost: 200 MNEE.", action: 'move:sim-legend' }, 
  { duration: 6000, text: "Crucial Step: The 'AgentWallet' contract intercepts the payment request.", action: 'inject:activity' }, 
  { duration: 5000, text: "It validates: Is 'Dataset' an allowed category? Is it under the daily limit?", action: 'inject:activity' },
  { duration: 5000, text: "Validation Passed. Payment executed on-chain.", action: 'move:sim-recent-txs' }, 
  
  // Scenario 2
  { duration: 6000, text: "The agent now needs to process this data. It needs a GPU.", action: 'inject:activity' },
  { duration: 6000, text: "It negotiates a lease with 'GPU Cluster Delta'.", action: 'move:terminal-output' },
  { duration: 6000, text: "The price is higher here. 600 MNEE for 1 hour of H100 time.", action: 'inject:activity' },
  { duration: 5000, text: "The budget governance contract approves the spend automatically.", action: 'move:sim-recent-txs' },
  { duration: 4000, text: "No human intervention required. Just oversight.", action: 'wait' },

  // --- DASHBOARD (3:15 - 4:00) ---
  { duration: 3000, text: "Let's see the financial impact in real-time.", action: 'move:nav-dash' },
  { duration: 1000, text: "Back to Dashboard...", action: 'click:nav-dash' },
  { duration: 5000, text: "Look at the 'Live Transactions' feed.", action: 'move:dashboard-tx-list' }, 
  { duration: 5000, text: "We see the Data Purchase and the Compute Lease settling instantly.", action: 'move:dashboard-chart' }, 
  { duration: 6000, text: "The chart reflects the wealth transfer. Researcher down, Providers up.", action: 'inject:activity' },
  { duration: 5000, text: "This is a closed-loop AI economy running on MNEE.", action: 'wait' },

  // --- CONTRACTS (4:00 - 4:40) ---
  { duration: 3000, text: "What protects the treasury from a rogue agent?", action: 'move:nav-contracts' },
  { duration: 1000, text: "Let's inspect the code.", action: 'click:nav-contracts' },
  { duration: 5000, text: "This is the Solidity contract deployed for every agent.", action: 'move:code-viewer-content' },
  { duration: 5000, text: "The 'executePayment' function is the gatekeeper.", action: 'scroll:code-viewer' },
  { duration: 6000, text: "It checks 'rule.spentToday + amount <= rule.dailyLimit'.", action: 'scroll:code-viewer' },
  { duration: 6000, text: "If an agent gets hacked or hallucinates, the damage is capped mathematically.", action: 'inject:activity' }, 
  { duration: 4000, text: "Trust is in the code, not the LLM.", action: 'wait' },

  // --- OUTRO (4:40 - 5:00) ---
  { duration: 3000, text: "AgentPay OS solves the last mile for AI autonomy.", action: 'move:nav-dashboard' },
  { duration: 1000, text: "Final status check.", action: 'click:nav-dash' },
  { duration: 5000, text: "Agents are working. Budgets are safe. The economy is growing.", action: 'inject:activity' },
  { duration: 5000, text: "Ready for the MNEE Hackathon. Thank you.", action: 'finish' },
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
  const [voiceoverSrc, setVoiceoverSrc] = useState<string | null>(null);
  
  const isPlayingScriptRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

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

    // 4. Start Audio (if loaded)
    if (voiceoverSrc) {
       audioPlayerRef.current = new Audio(voiceoverSrc);
       audioPlayerRef.current.play().catch(e => console.error("Audio play failed", e));
    }

    // 5. Run Script
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
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
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

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVoiceoverSrc(url);
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
           {voiceoverSrc && <p className="text-white mt-4 text-sm animate-pulse">Voiceover Audio Active - Remember to Share Audio</p>}
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

          {/* Audio Upload Controls */}
          <div className="space-y-2">
            <input 
              type="file" 
              accept="audio/*" 
              ref={audioInputRef} 
              className="hidden"
              onChange={handleAudioUpload}
            />
            {!voiceoverSrc ? (
              <button 
                onClick={() => audioInputRef.current?.click()}
                className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-brand-surface border border-brand-border text-slate-300 hover:bg-brand-border text-xs font-bold dashed border-2 border-dashed border-slate-700 hover:border-slate-500 hover:text-white transition-colors"
              >
                <Upload className="w-3 h-3" />
                <span>Upload Voiceover (Optional)</span>
              </button>
            ) : (
              <div className="flex items-center justify-between bg-brand-accent/10 border border-brand-accent/30 rounded-lg p-2">
                <div className="flex items-center space-x-2 text-brand-accent">
                  <Music className="w-4 h-4" />
                  <span className="text-xs font-bold">Voiceover Ready</span>
                </div>
                <button 
                  onClick={() => setVoiceoverSrc(null)}
                  className="p-1 hover:bg-red-900/50 rounded text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

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