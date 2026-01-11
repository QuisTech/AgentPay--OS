import { Agent, AgentRole, Transaction, TransactionStatus } from '../types';

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'ag_1',
    name: 'Alpha Research Unit',
    role: AgentRole.RESEARCHER,
    address: '0x71C...9A21',
    balance: 5000,
    spentToday: 120,
    status: 'active',
    rules: {
      dailyLimit: 1000,
      allowedCategories: ['Dataset', 'Compute', 'Storage'],
      requireApprovalAbove: 2000
    }
  },
  {
    id: 'ag_2',
    name: 'Omni Data Source',
    role: AgentRole.DATA_PROVIDER,
    address: '0xB23...11F9',
    balance: 1200,
    spentToday: 0,
    status: 'active',
    rules: {
      dailyLimit: 500,
      allowedCategories: ['Infrastructure'],
      requireApprovalAbove: 500
    }
  },
  {
    id: 'ag_3',
    name: 'GPU Cluster Delta',
    role: AgentRole.COMPUTE_PROVIDER,
    address: '0x99A...44C2',
    balance: 850,
    spentToday: 50,
    status: 'active',
    rules: {
      dailyLimit: 2000,
      allowedCategories: ['Power', 'Maintenance'],
      requireApprovalAbove: 1000
    }
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    fromAgentId: 'ag_1',
    toAgentId: 'ag_2',
    amount: 150,
    category: 'Dataset',
    description: 'Purchase: Q3 Financial Dataset',
    timestamp: Date.now() - 3600000,
    status: TransactionStatus.CONFIRMED,
    hash: '0xab...cd'
  },
  {
    id: 'tx_2',
    fromAgentId: 'ag_1',
    toAgentId: 'ag_3',
    amount: 400,
    category: 'Compute',
    description: 'Lease: H100 GPU Instance (1hr)',
    timestamp: Date.now() - 7200000,
    status: TransactionStatus.CONFIRMED,
    hash: '0xef...12'
  }
];

export const generateHash = () => {
  return '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
};

export const MNEE_TOKEN_ADDRESS = "0xMNEE...TOKEN";