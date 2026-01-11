// SPDX-License-Identifier: MIT
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
}
