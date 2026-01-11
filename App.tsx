import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Agent, LogEntry, Transaction, TransactionStatus, AgentRole } from './types';
import { INITIAL_AGENTS, MOCK_TRANSACTIONS, generateHash } from './services/mockWeb3';
import { Web3Service, Web3State, INITIAL_WEB3_STATE } from './services/web3Service';
import { SimulationEngine } from './components/SimulationEngine';
import { SolidityViewer } from './components/SolidityViewer';
import { DirectorControls } from './components/DirectorControls';
import { Plus, ShieldAlert, ArrowUpRight, ArrowDownLeft, Activity, Coins, ExternalLink, Loader2, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showDirectorControls, setShowDirectorControls] = useState(false);
  
  // Real Web3 State
  const [web3State, setWeb3State] = useState<Web3State>(INITIAL_WEB3_STATE);
  const [isFunding, setIsFunding] = useState<string | null>(null); // Agent ID being funded

  // Check for Director Mode and Wallet Presence on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('director') === 'true') {
      setShowDirectorControls(true);
    }

    // Proactively check if MetaMask is installed
    if (!Web3Service.getInstance().isWalletInstalled()) {
      setWeb3State(prev => ({
        ...prev,
        error: "MetaMask is not installed. Please install it to use this app."
      }));
    }
  }, []);

  // --- Real Web3 Logic ---
  const handleConnect = async () => {
    const service = Web3Service.getInstance();
    const state = await service.connect();
    setWeb3State(state);
    
    if (state.isConnected) {
       addLog('Wallet connected successfully', 'success', 'System');
       addLog(`Fetched MNEE Balance: ${state.mneeBalance}`, 'info', 'System');
    } else if (state.error) {
       addLog(`Connection failed: ${state.error}`, 'error', 'System');
       // Explicitly alert the user to ensure they see the error (e.g. missing MetaMask)
       alert(state.error);
    }
  };

  // Used by Director Mode to simulate a connection without popup
  const mockConnectWallet = () => {
    setWeb3State({
      ...INITIAL_WEB3_STATE,
      isConnected: true,
      address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
      mneeBalance: "50000.00"
    });
    addLog('Wallet connected (Director Override)', 'success', 'System');
  };

  const handleFundAgent = async (agent: Agent, amount: string) => {
    if (!web3State.signer && !web3State.isConnected) { // Relax check for demo mode
      alert("Please connect your wallet first.");
      return;
    }
    
    try {
      setIsFunding(agent.id);
      addLog(`Initiating transfer of ${amount} MNEE to ${agent.name}...`, 'info', 'Wallet');
      
      // If we have a real signer, use it. If we are in Director Mode (mocked), skip.
      if (web3State.signer) {
        const service = Web3Service.getInstance();
        const tx = await service.sendMNEE(web3State.signer, agent.address, amount);
        addLog(`Transaction sent! Hash: ${tx.hash}`, 'warning', 'Blockchain');
        await tx.wait(1);
      } else {
        // Mock delay for Director Mode
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      addLog(`Transfer Confirmed on-chain.`, 'success', 'Blockchain');
      
      setAgents(prev => prev.map(a => {
        if (a.id === agent.id) {
          return { ...a, balance: a.balance + parseFloat(amount) };
        }
        return a;
      }));

      // Refresh my balance if real
      if (web3State.signer) {
        const service = Web3Service.getInstance();
        const newBalance = await service.getMNEEBalance(web3State.signer, web3State.address!);
        setWeb3State(prev => ({ ...prev, mneeBalance: newBalance }));
      }

    } catch (err: any) {
      console.error(err);
      addLog(`Transfer failed: ${err.message || 'Unknown error'}`, 'error', 'Wallet');
      alert("Transaction Failed. See logs.");
    } finally {
      setIsFunding(null);
    }
  };


  // --- Simulation Logic ---
  const addLog = useCallback((message: string, level: LogEntry['level'] = 'info', agentName?: string) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36),
      timestamp: new Date(),
      level,
      message,
      agentName
    }]);
  }, []);

  const executeSimulationStep = useCallback(() => {
    const random = Math.random();
    const researcher = agents.find(a => a.role === AgentRole.RESEARCHER);
    const provider = agents.find(a => a.role === AgentRole.DATA_PROVIDER);
    const compute = agents.find(a => a.role === AgentRole.COMPUTE_PROVIDER);

    if (!researcher || !provider || !compute) return;

    if (random > 0.7) {
      addLog('Identifying gap in financial training data...', 'info', researcher.name);
      setTimeout(() => {
        addLog(`Requesting "Q4 Market CSV" from ${provider.name}`, 'info', researcher.name);
        setTimeout(() => {
          const cost = 200;
          if (researcher.spentToday + cost > researcher.rules.dailyLimit) {
            addLog(`Transaction Blocked: Daily limit exceeded`, 'error', 'SmartContract');
          } else {
            addLog(`Invoice #INV-${Math.floor(Math.random() * 9999)} received for ${cost} MNEE`, 'warning', provider.name);
            const newTx: Transaction = {
              id: `tx_${Date.now()}`,
              fromAgentId: researcher.id,
              toAgentId: provider.id,
              amount: cost,
              category: 'Dataset',
              description: 'Auto-Payment: Market Data',
              timestamp: Date.now(),
              status: TransactionStatus.CONFIRMED,
              hash: generateHash()
            };
            setTransactions(prev => [newTx, ...prev]);
            setAgents(prev => prev.map(a => {
              if (a.id === researcher.id) return { ...a, balance: a.balance - cost, spentToday: a.spentToday + cost };
              if (a.id === provider.id) return { ...a, balance: a.balance + cost };
              return a;
            }));
            addLog(`Payment authorized. ${cost} MNEE transferred.`, 'success', 'AgentWallet.sol');
          }
        }, 1500);
      }, 1000);
    } else {
       addLog('Training job pending. Evaluating compute resources...', 'info', researcher.name);
       setTimeout(() => {
         const cost = 600;
         addLog(`Requesting GPU cluster from ${compute.name}`, 'info', researcher.name);
         setTimeout(() => {
            const newTx: Transaction = {
              id: `tx_${Date.now()}`,
              fromAgentId: researcher.id,
              toAgentId: compute.id,
              amount: cost,
              category: 'Compute',
              description: 'Auto-Payment: GPU Cluster',
              timestamp: Date.now(),
              status: TransactionStatus.CONFIRMED,
              hash: generateHash()
            };
            setTransactions(prev => [newTx, ...prev]);
            setAgents(prev => prev.map(a => {
              if (a.id === researcher.id) return { ...a, balance: a.balance - cost, spentToday: a.spentToday + cost };
              if (a.id === compute.id) return { ...a, balance: a.balance + cost };
              return a;
            }));
             addLog(`Compute verified. ${cost} MNEE transferred via Smart Contract.`, 'success', 'AgentWallet.sol');
         }, 1200);
       }, 1000);
    }
  }, [agents, addLog]);

  useEffect(() => {
    let interval: any;
    if (isSimulating) {
      interval = setInterval(executeSimulationStep, 4000);
    }
    return () => clearInterval(interval);
  }, [isSimulating, executeSimulationStep]);

  // Derived state for dynamic chart
  const chartData = useMemo(() => {
     return agents.map(agent => ({
       name: agent.role.split(' ')[0], // Use first word of role (Researcher, Data, Compute)
       balance: agent.balance
     }));
  }, [agents]);


  // --- Render Functions ---

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-primary p-6 rounded-xl border border-brand-border shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 text-sm font-medium">System Liquidity</h3>
            <Activity className="w-5 h-5 text-brand-accent" />
          </div>
          <p className="text-3xl font-bold text-white transition-all duration-500">
            {agents.reduce((acc, curr) => acc + curr.balance, 0).toLocaleString()} <span className="text-sm text-brand-secondary">MNEE</span>
          </p>
          <div className="mt-2 text-xs text-brand-accent font-medium flex items-center">
            <ArrowUpRight className="w-3 h-3 mr-1" /> +12% vs last epoch
          </div>
        </div>
        <div className="bg-brand-primary p-6 rounded-xl border border-brand-border shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 text-sm font-medium">24h Transaction Vol</h3>
            <ArrowUpRight className="w-5 h-5 text-brand-secondary" />
          </div>
          <p className="text-3xl font-bold text-white transition-all duration-500">
            {transactions.filter(t => t.timestamp > Date.now() - 86400000).reduce((acc, t) => acc + t.amount, 0).toLocaleString()} <span className="text-sm text-brand-secondary">MNEE</span>
          </p>
        </div>
        <div className="bg-brand-primary p-6 rounded-xl border border-brand-border shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 text-sm font-medium">My Connected Wallet</h3>
            <Wallet className={`w-5 h-5 ${web3State.isConnected ? 'text-green-500' : 'text-slate-500'}`} />
          </div>
          <p className="text-3xl font-bold text-white">
            {parseFloat(web3State.mneeBalance).toLocaleString()} <span className="text-sm text-slate-500">MNEE</span>
          </p>
          <div className="mt-2 text-xs text-slate-400">
             {web3State.isConnected ? 'Available for Agent Funding' : 'Connect to fund agents'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-primary p-6 rounded-xl border border-brand-border shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Real-Time Agent Balances</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3e3925" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#051320', borderColor: '#3e3925', color: '#fff' }}
                    itemStyle={{ color: '#f3bb32' }}
                    formatter={(value: number) => [`${value} MNEE`, 'Balance']}
                  />
                  <Bar dataKey="balance" fill="#f3bb32" radius={[4, 4, 0, 0]} animationDuration={500} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-brand-primary p-6 rounded-xl border border-brand-border shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Live Transactions</h3>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((tx, index) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-brand-border animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${tx.toAgentId === 'ag_1' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                    {tx.toAgentId === 'ag_1' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{tx.description}</p>
                    <p className="text-xs text-slate-500">{new Date(tx.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{tx.amount} <span className="text-brand-secondary text-xs">MNEE</span></p>
                  <p className="text-xs text-slate-500 font-mono flex items-center justify-end">
                    {tx.hash.substring(0, 6)}...
                    <ExternalLink className="w-3 h-3 ml-1 text-slate-600 hover:text-brand-accent cursor-pointer" />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAgents = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Agent Treasury</h2>
          <p className="text-slate-400">View balances and top up agent wallets with real MNEE</p>
        </div>
        <button className="bg-brand-accent text-brand-primary px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-brand-secondary transition-colors font-semibold">
          <Plus className="w-4 h-4" />
          <span>Deploy New Agent</span>
        </button>
      </div>

      <div className="grid gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-brand-primary rounded-xl border border-brand-border overflow-hidden shadow-lg relative">
             {isFunding === agent.id && (
               <div className="absolute inset-0 bg-brand-primary/80 backdrop-blur-sm z-20 flex items-center justify-center flex-col">
                 <Loader2 className="w-8 h-8 text-brand-accent animate-spin mb-2" />
                 <p className="text-brand-accent font-bold">Processing Transaction...</p>
                 <p className="text-xs text-slate-400">Please confirm in MetaMask</p>
               </div>
             )}
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-brand-surface rounded-full flex items-center justify-center border border-brand-border relative">
                  <span className="text-xl font-bold text-brand-accent">{agent.name.charAt(0)}</span>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-brand-surface ${agent.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <span className="font-mono bg-brand-surface border border-brand-border px-2 py-0.5 rounded text-xs">{agent.role}</span>
                    <span className="hidden md:inline">•</span>
                    <span className="font-mono text-slate-500 hidden md:inline">{agent.address}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Balance</p>
                  <p className="text-xl font-bold text-brand-accent transition-all duration-300">{agent.balance.toLocaleString()} MNEE</p>
                </div>
                
                <div className="flex items-center space-x-2">
                   <button 
                     id={`btn-fund-agent-${agent.id}`}
                     onClick={() => {
                        const amount = prompt(`How much MNEE do you want to send to ${agent.name}?`, "100");
                        if (amount && !isNaN(parseFloat(amount))) {
                           handleFundAgent(agent, amount);
                        }
                     }}
                     className="bg-brand-surface hover:bg-brand-border text-white border border-brand-border px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all hover:shadow-[0_0_10px_rgba(243,187,50,0.2)]"
                   >
                     <Coins className="w-4 h-4 mr-2 text-brand-secondary" />
                     Fund Agent
                   </button>
                </div>
              </div>
            </div>
            
            <div className="bg-brand-surface px-6 py-3 border-t border-brand-border flex flex-col md:flex-row md:items-center justify-between text-sm gap-2">
               <div className="flex items-center space-x-6">
                  <span className="flex items-center text-slate-400">
                    <ShieldAlert className="w-4 h-4 mr-2 text-brand-secondary" />
                    Daily Limit: {agent.rules.dailyLimit} MNEE
                  </span>
                  <span className="hidden md:flex items-center text-slate-500">
                    Spent: {agent.spentToday}
                  </span>
               </div>
               <span className="text-slate-500 text-xs md:text-sm truncate">
                 Allowed: {agent.rules.allowedCategories.join(', ')}
               </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Layout 
      activeView={activeView} 
      onChangeView={setActiveView}
      web3State={web3State}
      onConnect={handleConnect}
      isSimulating={isSimulating}
    >
      {activeView === 'dashboard' && renderDashboard()}
      {activeView === 'agents' && renderAgents()}
      {activeView === 'simulation' && (
        <SimulationEngine 
          isRunning={isSimulating}
          setIsRunning={setIsSimulating}
          logs={logs}
          agents={agents}
          transactions={transactions}
          resetSimulation={() => {
            setLogs([]);
            setTransactions(MOCK_TRANSACTIONS);
            setAgents(INITIAL_AGENTS);
          }}
        />
      )}
      {activeView === 'contracts' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Smart Contracts</h2>
            <p className="text-slate-400 mb-6">Generated Solidity code for Agent Wallets and Invoice Registry.</p>
            <SolidityViewer />
          </div>
        </div>
      )}

      {/* Director Mode Controls - Only visible with ?director=true */}
      {showDirectorControls && (
        <DirectorControls 
           setTransactions={setTransactions}
           setLogs={setLogs}
           setAgents={setAgents}
           setActiveView={setActiveView}
           activeView={activeView}
           setIsSimulating={setIsSimulating}
           mockConnectWallet={mockConnectWallet}
        />
      )}
    </Layout>
  );
}

export default App;