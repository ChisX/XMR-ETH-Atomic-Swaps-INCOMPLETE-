# Shyswap ETH-XMR Cross-Chain Atomic Swapper
Prototype ReactJS Application that features a custom-made Monero(XMR) & Ethereum(ETH) Wallet Code written in Javascript, featuring functionalities allowing them to transact in a decentralized, atomic-swap manner.

The interface is very basic since it is only meant to be a PoC for the validity of the underlying cryptocurrency wallet code to enable XCAS between monero and another currency. A production-grade version that will be featured in a demo soon to come will feature advanced security to ensure the privacy of its users.

While quite technical, you are advised to inspect the [protocol](help/PROTOCOL.md) yourselves to fully grasp the transaction logic behind it, particularly if you have doubts on how atomic swapping functions as a concept.

Lastly, as this is still early work in our project array regarding Atomic Swapping - a concept we adore for its sheer potential in decentralization - developers forking and otherwise inspecting this code are fervently encouraged to report any and all issues they encounter. Constructive criticism is always welcome.

## Libraries
 Library Used      | Role within the Application
---------------------|-------------------------
ReactJS (+ Plugins)  |Front-End Interface & UX
Axios                |Making API Requests & Connections between Different parts of the Application
Monero-Javascript    |Interfacing with Monero Daemon & RPC Server
ethereumjs-tx        |Tool which facilitates the making of a variety of transactions, including the instantiation and calling of smart contracts.
Web3JS               | Interacting with ETH Accounts and Smart Contracts

## Development
Enter the project's root directory and run the following commands in order:
```
1) npm install - To install dependencies (This may take several minutes.
2) npm start   - To run the react server that displays the interface.
```