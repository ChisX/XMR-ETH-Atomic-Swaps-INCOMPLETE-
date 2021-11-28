// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.9.0;

contract Swapper {
    uint public time_start;
    uint public time_lock;          // 3600 seconds
    string public secret;           // "abracadabra"
    bytes32 public passhash;        // 0x045babdcd2118960e8c8b8e0ecf65b734686e1b18f58710c9646779f49e942ae
    address public recipient;
    address public owner;
    uint public amount;             // 3000000000000000 (3 finney)

    constructor(address rec,uint sum,bytes32 pass,uint locktime) {
        recipient = rec;
        owner = msg.sender;
        amount = sum;
        passhash = pass;
        time_lock = locktime;
    }

    // Helper Functions
    function getBalance() public view returns(uint) {
        return address(this).balance;
    }
    
    function hash(string memory input) pure public returns(bytes32) {
        return sha256(abi.encodePacked(input));
    }

    function tellTime() view public returns(uint) {
        return block.timestamp;
    }

    // Modifiers
    modifier authorized(string memory inpSecret) {
        require(hash(inpSecret) == passhash,"ERROR: Unauthorized Swap - False Secret");
        _;
    }

    modifier timelock() {
        require(block.timestamp > time_start + time_lock,"ERROR: Unauthorized Swap - Refund yet Unavailable");
        _;
    }

    modifier isOwner() {
        require(msg.sender == owner,'ERROR: Unauthorized Lock Attempt');
        _;
    }

    // Main Code
    function fund() public payable isOwner() {
        time_start = block.timestamp;
    }

    function claim(string memory inpSecret) public authorized(inpSecret) {
        // Reveal Secret for XMR Claim
        secret = inpSecret;
        
        // Transfer Locked Funds
        uint payment = getBalance();
        (bool success,) = recipient.call{value:payment}("");
        require(success,"ERROR: Transfer Failed");
    }

    function refund() public timelock() {
        // Transfer Locked Funds
        uint payment = getBalance();
        (bool success,) = owner.call{value:payment}("");
        require(success,"ERROR: Transfer Failed");
    }
}
