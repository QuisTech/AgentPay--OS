import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const CONTRACTS = {
  AgentWallet: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentWallet is Ownable {
    IERC20 public mneeToken;
    
    struct SpendingRule {
        uint256 dailyLimit;
        uint256 spentToday;
        uint256 lastResetTime;
        mapping(string => bool) allowedCategories;
    }

    SpendingRule public rule;
    
    event PaymentExecuted(address indexed to, uint256 amount, string category, string reason);
    event FundsReceived(address indexed from, uint256 amount);

    constructor(address _mneeToken, uint256 _dailyLimit) {
        mneeToken = IERC20(_mneeToken);
        rule.dailyLimit = _dailyLimit;
        rule.lastResetTime = block.timestamp;
    }

    function executePayment(address _to, uint256 _amount, string memory _category, string memory _reason) external onlyOwner {
        _resetDailyLimitIfNeeded();
        
        require(_amount <= mneeToken.balanceOf(address(this)), "Insufficient MNEE funds");
        require(rule.spentToday + _amount <= rule.dailyLimit, "Daily limit exceeded");
        // In prod: Check allowedCategories[_category]
        
        rule.spentToday += _amount;
        require(mneeToken.transfer(_to, _amount), "Transfer failed");
        
        emit PaymentExecuted(_to, _amount, _category, _reason);
    }

    function _resetDailyLimitIfNeeded() internal {
        if (block.timestamp >= rule.lastResetTime + 1 days) {
            rule.spentToday = 0;
            rule.lastResetTime = block.timestamp;
        }
    }
    
    // Allow contract to receive ETH for gas (optional)
    receive() external payable {}
}`,
  InvoiceRegistry: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract InvoiceRegistry {
    struct Invoice {
        address issuer;
        address payer;
        uint256 amount;
        string ipfsHash; // Details of service
        bool settled;
    }

    mapping(uint256 => Invoice) public invoices;
    uint256 public invoiceCount;

    event InvoiceCreated(uint256 indexed id, address indexed issuer, address indexed payer, uint256 amount);
    event InvoiceSettled(uint256 indexed id);

    function createInvoice(address _payer, uint256 _amount, string memory _ipfsHash) external returns (uint256) {
        invoiceCount++;
        invoices[invoiceCount] = Invoice({
            issuer: msg.sender,
            payer: _payer,
            amount: _amount,
            ipfsHash: _ipfsHash,
            settled: false
        });
        
        emit InvoiceCreated(invoiceCount, msg.sender, _payer, _amount);
        return invoiceCount;
    }

    function markSettled(uint256 _id) external {
        Invoice storage inv = invoices[_id];
        require(msg.sender == inv.issuer || msg.sender == inv.payer, "Unauthorized");
        inv.settled = true;
        emit InvoiceSettled(_id);
    }
}`
};

export const SolidityViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'AgentWallet' | 'InvoiceRegistry'>('AgentWallet');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CONTRACTS[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-brand-primary rounded-xl border border-brand-border overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 bg-brand-surface border-b border-brand-border">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('AgentWallet')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'AgentWallet'
                ? 'bg-brand-accent text-brand-primary font-bold'
                : 'text-slate-400 hover:text-white hover:bg-brand-border/50'
            }`}
          >
            AgentWallet.sol
          </button>
          <button
            onClick={() => setActiveTab('InvoiceRegistry')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'InvoiceRegistry'
                ? 'bg-brand-accent text-brand-primary font-bold'
                : 'text-slate-400 hover:text-white hover:bg-brand-border/50'
            }`}
          >
            InvoiceRegistry.sol
          </button>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center text-xs text-slate-400 hover:text-brand-accent transition-colors"
        >
          {copied ? <Check className="w-4 h-4 mr-1 text-green-500" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied ? 'Copied' : 'Copy Code'}
        </button>
      </div>
      <div className="p-0">
        <pre 
          id="code-viewer-content" 
          className="p-4 bg-[#02080c] text-slate-300 text-xs overflow-auto font-mono h-[400px] scroll-smooth"
        >
          <code>{CONTRACTS[activeTab]}</code>
        </pre>
      </div>
      <div className="px-4 py-3 bg-brand-surface border-t border-brand-border text-xs text-slate-500">
        * These contracts are generated for the Ethereum Virtual Machine (EVM). Use Hardhat/Foundry to deploy.
      </div>
    </div>
  );
};