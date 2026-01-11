import React, { useEffect, useRef } from 'react';
import { Agent, LogEntry, Transaction } from '../types';
import { Play, Pause, RefreshCw, Terminal } from 'lucide-react';

interface SimulationEngineProps {
  isRunning: boolean;
  setIsRunning: (val: boolean) => void;
  logs: LogEntry[];
  agents: Agent[];
  transactions: Transaction[];
  resetSimulation: () => void;
}

export const SimulationEngine: React.FC<SimulationEngineProps> = ({ 
  isRunning, 
  setIsRunning, 
  logs, 
  agents,
  transactions,
  resetSimulation
}) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Control Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-brand-primary p-6 rounded-xl border border-brand-border shadow-lg">
          <h3 className="text-lg font-semibold text-brand-accent mb-4">Autonomous Agent Loop</h3>
          <p className="text-sm text-slate-400 mb-6">
            This module runs simulated Node.js agent scripts. It demonstrates agents autonomously discovering services, validating budgets via smart contracts, and executing MNEE payments.
          </p>
          
          <div className="flex space-x-3 mb-6">
            <button
              id="btn-start-simulation"
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                isRunning 
                  ? 'bg-amber-900/40 text-amber-200 border border-amber-700/50 hover:bg-amber-900/60' 
                  : 'bg-brand-accent text-brand-primary hover:bg-brand-secondary shadow-[0_0_10px_rgba(243,187,50,0.4)]'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isRunning ? 'Pause Agents' : 'Start Agents'}</span>
            </button>
            
            <button
              onClick={resetSimulation}
              className="px-4 py-3 rounded-lg bg-brand-surface border border-brand-border text-slate-400 hover:text-white hover:border-brand-accent transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-brand-surface rounded-lg border border-brand-border">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Active Protocols</div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-900/30 text-blue-300 border border-blue-800 text-xs rounded-md font-mono">Auto-Negotation</span>
                <span className="px-2 py-1 bg-brand-accent/10 text-brand-accent border border-brand-accent/30 text-xs rounded-md font-mono">MNEE-Settlement</span>
                <span className="px-2 py-1 bg-purple-900/30 text-purple-300 border border-purple-800 text-xs rounded-md font-mono">Rule-Enforcer</span>
              </div>
            </div>
            
            <div className="p-3 bg-brand-surface rounded-lg border border-brand-border">
               <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Recent On-Chain Txs</div>
               <div className="space-y-2">
                 {transactions.slice(0, 3).map(tx => (
                   <div key={tx.id} className="flex justify-between items-center text-xs">
                     <span className="font-mono text-slate-400">{tx.hash.substring(0, 8)}...</span>
                     <span className="font-bold text-brand-accent">{tx.amount} MNEE</span>
                   </div>
                 ))}
                 {transactions.length === 0 && <div className="text-xs text-slate-500 italic">No transactions yet</div>}
               </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-brand-primary p-6 rounded-xl border border-brand-border shadow-lg">
          <h4 className="font-medium text-white mb-3">Simulation Legend</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center text-slate-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 shadow-[0_0_5px_blue]"></span>
              Agent Reasoning (Chain of Thought)
            </li>
            <li className="flex items-center text-slate-400">
              <span className="w-2 h-2 rounded-full bg-brand-secondary mr-2 shadow-[0_0_5px_orange]"></span>
              Invoice Generation
            </li>
            <li className="flex items-center text-slate-400">
              <span className="w-2 h-2 rounded-full bg-brand-accent mr-2 shadow-[0_0_5px_yellow]"></span>
              Smart Contract Validation & Payment
            </li>
             <li className="flex items-center text-slate-400">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-2 shadow-[0_0_5px_red]"></span>
              Budget Rejections
            </li>
          </ul>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="lg:col-span-2 bg-[#02080c] rounded-xl border border-brand-border shadow-2xl overflow-hidden flex flex-col h-[600px]">
        <div className="bg-[#051320] px-4 py-2 flex items-center justify-between border-b border-brand-border">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-brand-accent" />
            <span className="text-sm font-mono text-slate-400">agent-node-cluster :: output</span>
          </div>
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
          </div>
        </div>
        
        <div 
          ref={logContainerRef}
          className="flex-1 overflow-auto p-4 font-mono text-sm space-y-2"
        >
          {logs.length === 0 && (
            <div className="text-slate-600 italic text-center mt-20">
              System ready. Click <span className="text-brand-accent">Start Agents</span> to begin autonomous simulation.
            </div>
          )}
          {logs.map((log) => (
            <div key={log.id} className="flex items-start animate-fade-in border-l-2 border-transparent hover:border-brand-border pl-2 transition-colors">
              <span className="text-slate-600 mr-3 text-xs shrink-0 select-none">
                [{log.timestamp.toLocaleTimeString().split(' ')[0]}]
              </span>
              <div className="break-words">
                {log.agentName && (
                  <span className={`font-bold mr-2 ${
                    log.level === 'error' ? 'text-red-400' :
                    log.level === 'success' ? 'text-brand-accent' :
                    'text-blue-400'
                  }`}>
                    {log.agentName}:
                  </span>
                )}
                <span className={
                   log.level === 'error' ? 'text-red-300' :
                   log.level === 'success' ? 'text-brand-accent/80' :
                   log.level === 'warning' ? 'text-brand-secondary' :
                   'text-slate-300'
                }>
                  {log.message}
                </span>
              </div>
            </div>
          ))}
          {isRunning && (
            <div className="flex items-center space-x-2 mt-4 text-brand-accent animate-pulse">
               <span className="w-2 h-4 bg-brand-accent block"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};