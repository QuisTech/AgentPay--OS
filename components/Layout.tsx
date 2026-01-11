import React from 'react';
import { LayoutDashboard, Users, FileCode, PlayCircle, Wallet, AlertCircle, Zap } from 'lucide-react';
import { Web3State } from '../services/web3Service';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onChangeView: (view: string) => void;
  web3State: Web3State;
  onConnect: () => void;
  isSimulating?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onChangeView, web3State, onConnect, isSimulating }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agents', label: 'Agent Treasury', icon: Users },
    { id: 'simulation', label: 'Live Simulation', icon: PlayCircle },
    { id: 'contracts', label: 'Smart Contracts', icon: FileCode },
  ];

  return (
    <div className="flex h-screen bg-brand-primary text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-primary border-r border-brand-border flex flex-col shadow-2xl">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center font-bold text-brand-primary text-lg">A</div>
            <h1 className="text-xl font-bold tracking-tight text-white">AgentPay OS</h1>
          </div>
          <p className="text-xs text-brand-secondary mt-1">Autonomous Finance Layer</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeView === item.id
                  ? 'bg-brand-accent text-brand-primary shadow-[0_0_15px_rgba(243,187,50,0.3)]'
                  : 'text-slate-400 hover:text-brand-accent hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.id === 'simulation' && isSimulating && (
                <span className="flex h-2 w-2 relative ml-auto">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-brand-border">
          <div className="bg-brand-border/30 rounded-lg p-4 border border-brand-border">
            <p className="text-xs text-slate-400 mb-2">My Treasury Balance</p>
            {web3State.isConnected ? (
              <p className="text-xl font-bold text-brand-accent truncate">
                {parseFloat(web3State.mneeBalance).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} MNEE
              </p>
            ) : (
               <p className="text-sm text-slate-500 italic">Connect Wallet</p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-brand-primary relative">
        {/* Background Gradient Effect */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-brand-accent/5 to-transparent pointer-events-none" />

        <header className="h-16 bg-brand-primary border-b border-brand-border flex items-center justify-between px-8 relative z-10">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-white capitalize tracking-wide">
              {navItems.find(i => i.id === activeView)?.label}
            </h2>
            {isSimulating && (
               <div className="flex items-center space-x-1 px-2 py-1 bg-green-900/20 border border-green-900/50 rounded text-xs text-green-400 animate-pulse-soft">
                  <Zap className="w-3 h-3 fill-current" />
                  <span className="font-mono uppercase tracking-wider">Agents Active</span>
               </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
             {web3State.error && (
                <div className="flex items-center text-red-200 text-sm font-medium px-4 py-1.5 bg-red-900/60 border border-red-500/50 rounded-lg shadow-sm animate-pulse">
                  <AlertCircle className="w-4 h-4 mr-2 text-red-400" />
                  {web3State.error}
                </div>
             )}
            <button
              id="btn-connect-wallet"
              onClick={onConnect}
              disabled={web3State.isConnected}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${
                web3State.isConnected
                  ? 'bg-brand-accent border-brand-accent text-brand-primary font-bold cursor-default'
                  : 'bg-transparent border-brand-accent text-brand-accent hover:bg-brand-accent/10'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">
                {web3State.isConnected 
                  ? `${web3State.address?.substring(0, 6)}...${web3State.address?.substring(38)}` 
                  : 'Connect Wallet'}
              </span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 relative z-10 scrollbar-thin scrollbar-thumb-brand-border scrollbar-track-transparent">
          {children}
        </div>
      </main>
    </div>
  );
};