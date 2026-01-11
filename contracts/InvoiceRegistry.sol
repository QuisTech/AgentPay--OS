// SPDX-License-Identifier: MIT
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
}
