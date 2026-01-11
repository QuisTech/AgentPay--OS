# AgentPay OS 🤖💸

**Autonomous AI Agent Treasury with On-Chain Budgets and Spend Governance.**

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status: Hackathon](https://img.shields.io/badge/Status-Hackathon_Submission-blue)
![Stack: React + Ethers](https://img.shields.io/badge/Tech-React_%7C_TypeScript_%7C_Ethers.js-00d8ff)
<img width="1366" height="768" alt="Screenshot (164)" src="https://github.com/user-attachments/assets/9b50b7ae-db01-4965-94d7-3c21270aa19f" />
---

## 📖 Overview

**AgentPay OS** is a financial operating system designed for the coming age of Autonomous AI Agents. As AI agents begin to negotiate resources (compute, data, storage) independently, they need a secure, rules-based way to hold funds and execute payments.

AgentPay OS provides a dashboard for humans to provision "Agent Wallets" with **MNEE tokens**, set strict spending limits (daily caps, allowed categories), and monitor autonomous spending in real-time.

### 🎯 Problem Solved
AI Agents currently lack financial autonomy. Giving an agent a private key is risky. AgentPay OS solves this by introducing **Smart Contract Governance** and **Treasury Management** layers between the agent and the blockchain.

---

## ✨ Key Features

### 1. 🏦 Multi-Agent Treasury Management
- Visualize all your deployed AI agents in one dashboard.
- Monitor real-time balances, daily spend velocity, and budget utilization.
- **Tech:** React + Recharts for visualization.

### 2. 🔗 Real On-Chain Funding
- Connect your **MetaMask** wallet.
- Fund specific AI agents with **MNEE tokens** directly from the UI.
- Validates network connection (Ethereum Mainnet) and handles ERC-20 transfers.
- **Tech:** Ethers.js v6, Window.ethereum API.

### 3. 🛡️ Autonomous Payment Simulation
- Watch a live simulation of agents negotiating and transacting.
- See "Researcher" agents buy datasets from "Data Provider" agents.
- Observe "Compute" agents leasing GPUs.
- **Governance Logic:** Transactions are rejected if they exceed daily limits defined in the agent's policy.

### 4. 📜 Smart Contract Inspection
- Built-in Solidity viewer to inspect the underlying logic for `AgentWallet.sol` (Budget enforcement) and `InvoiceRegistry.sol` (Service settlement).

---

## 🧪 Dev Tools: Director Mode

To assist with creating high-quality demonstrations, this repository includes a hidden **Director Mode**. This tool automates the UI interactions (mouse movements, clicking, navigation) to create smooth, perfectly timed walkthroughs.

**To enable Director Mode:**
Append `?director=true` to your URL.
```
http://localhost:5173/?director=true
```
This will reveal the camera control button in the bottom right, allowing you to run the automated presentation script.

---

## 🛠️ Technology Stack

*   **Frontend Framework:** React 18 (TypeScript)
*   **Web3 Integration:** Ethers.js v6
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **Charts:** Recharts
*   **Token Standard:** ERC-20 (MNEE)

---

## 📂 Project Structure

```text
.
├── components/                 # UI Components
│   ├── DirectorControls.tsx    # Hidden "Director Mode" for recording demos
│   ├── Layout.tsx              # Main application shell (Sidebar + Header)
│   ├── SimulationEngine.tsx    # Visualizer for the autonomous agent simulation
│   └── SolidityViewer.tsx      # Component to display and copy smart contract code
│
├── services/                   # Business Logic & Data Layers
│   ├── mockWeb3.ts             # Initial mock data (Agents, Transactions)
│   └── web3Service.ts          # Singleton service for Ethers.js & MNEE token interaction
│
├── App.tsx                     # Main Application Controller & View Router
├── index.html                  # HTML entry point with Tailwind CSS script
├── index.tsx                   # React DOM entry point
├── metadata.json               # Project configuration metadata
├── README.md                   # Project documentation
├── types.ts                    # Shared TypeScript interfaces (Agent, Transaction, Role)
└── video.md                    # Voiceover script for the demo video
```

---

## 🚀 Installation & Setup

### Prerequisites
*   Node.js (v16+)
*   MetaMask Browser Extension
*   Ethereum Mainnet ETH (for gas) and MNEE Tokens

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/agentpay-os.git
cd agentpay-os
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🦊 Web3 Configuration

This application is configured to interact with the **MNEE Token** on **Ethereum Mainnet**.

1.  **Network:** Ensure MetaMask is connected to **Ethereum Mainnet**. The app will prompt you to switch if you are on the wrong chain.
2.  **Token Contract:** `0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF`
3.  **Funding Agents:**
    *   Navigate to the **Agent Treasury** tab.
    *   Click "Fund Agent" on any card.
    *   Enter the amount of MNEE to transfer.
    *   Confirm the transaction in MetaMask.

---

## 💰 Getting MNEE Tokens for Testing

Since MNEE is a live mainnet stablecoin, you have several options:

### For Real Testing:
1. **Purchase MNEE** on supported exchanges
2. **Bridge/swap** from other tokens

### For Demo/Simulation:
The app includes a **full simulation mode** that demonstrates:
- Autonomous agent decision-making
- Budget enforcement logic
- Transaction flows
- Smart contract interactions

No real MNEE needed to experience the core functionality!

---

## 🏆 Hackathon Tracks

This project submits to the **AI & Agent Payments** track.

*   **AI Integration:** Simulates autonomous decision-making loops where agents identify resource gaps (e.g., missing datasets) and autonomously initiate purchase orders.
*   **DeFi / Payments:** Utilizes on-chain ERC-20 settlements for agent-to-agent economy.
*   **Safety:** Demonstrates how to "safe-rail" AI spending using solidity-based spending limits.

---

## 👨‍⚖️ For Hackathon Judges

### Key Technical Achievements:
1. **Real MNEE Integration**: Uses official contract `0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF`
2. **Production-Grade Web3**: Ethers.js v6 with proper error handling
3. **Autonomous Agent Simulation**: Complete payment flow visualization
4. **Budget Governance**: Smart contract-ready spending rules

### What to Look For:
- Wallet connection on Ethereum Mainnet
- Agent funding with MNEE tokens
- Autonomous payment simulation
- Smart contract code generation

---

## 🎥 Video Demo

[Watch the 5-minute demo video here](https://www.youtube.com/watch?v=77WGvUctgNM)
*Covers: Wallet connection, Agent funding, Autonomous simulation, Smart contracts*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built with ❤️ for the Web3 AI Hackathon.*