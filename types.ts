export enum AgentRole {
  RESEARCHER = 'Researcher',
  DATA_PROVIDER = 'Data Provider',
  COMPUTE_PROVIDER = 'Compute Provider',
  AUDITOR = 'Auditor'
}

export enum TransactionStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  FAILED = 'Failed',
  REJECTED = 'Rejected (Policy)'
}

export interface SpendingRule {
  dailyLimit: number;
  allowedCategories: string[];
  requireApprovalAbove: number;
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  address: string;
  balance: number; // In MNEE
  spentToday: number;
  rules: SpendingRule;
  status: 'active' | 'paused';
}

export interface Transaction {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  amount: number;
  category: string;
  description: string;
  timestamp: number;
  status: TransactionStatus;
  hash: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  agentName?: string;
}