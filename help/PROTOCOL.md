# XMR-ETH XCAS - Atomic Swaps Protocol Specification

## <u>Premise</u>:
One user (let's call him Alex) has ETH and wants XMR. Another (call him Bob) has XMR and wants ETH. This protocol will describe some technical points within a process that allows Alex and Bob to trade for their desired currencies at an agreed-upon rate in a decentralize manner, making use of Cross-Chain Atomic Swap Technology.

let *N1* be the number of ether Alex agreed to exchange for the agreed number *N2* of Bob's monero. Keep in mind that both Alex and Bob have at least one Ethereum and one Monero account prepared (one has the funds they trade away, and another receives the funds they want).


## <u>Basis</u>:
Connecting to an RPC node via external (or self-hosted) XMR node, a client has the option to use any of the basic functions the node can use. Naturally, this includes the "transfer" function, which is meant to create a monero transaction (apply certain default options, for basic security and privacy) and ultimately relay it to the network. At this point, the transaction can be independently verified by miners and included into a block - thus it becomes an accepted record of the monero ledger, and the payment has been fully processed.

A finer point in this standard function is that its precise operation is only to create a transaction - not necessarily to also propagate it to the network. By using it with the option "do_not_relay", "transfer" creates and signs the transaction, but does not post it, and returns its metadata, which can then be used to manually post it at a later time. Furthermore, since the transaction is already signed, any node can post it. This leads to 2 distinct possibilities:
1) It provides the opportunity for a time-lock to be set.
2) It allows the opportunity for a 3rd party to claim a controlled amount of funds.

## <u>Implementation</u>:
The 2 possibilities spoken of earlier enable the construction of cross-chain atomic swaps between monero and other cryptocurrencies despite the notable challenge of monero lacking a scripting language that allows for smart-contract development, like Bitcoin and Ethereum. However, there are also certain challenges to be faced.

For one thing, how will Alex (ETH-Seller) claim the XMR from Bob? How will Bob pass the metadata to Alex in a secure way, as to eliminate the possibility of Alex cheating him off his funds? And should he find a way to do so, how can Alex guarantee that Bob will not reclaim his monero after Alex exposes his own funds?

### <u>Bob's Timelock</u>:
I would like to begin by considering the 3rd problem. Besides "do_not_relay", another option of interest one can find in the "transfer" function is "unlock_time". Unlike in Bitcoin, however, where a locktime option is used to set the earliest possible time a transaction can be included in a block(earliest time-of-mining), monero's timelock option instead allows payments to be mined, but make them un-spendable before the specified time (or block height) (earliest time-of-spending).

The difference is that in monero, the transaction cannot be cancelled by posting it again under different options before the specified time. The sender, therefore, is predetermined from the first issue. However, what if the sender and the receiver are one and the same? What effect does that produce?

The monero will return to the owner (Bob) after the transaction is mined (~30 min, typically), but they won't be able to spend it until after the self-imposed timelock. And that provides the opportunity for another user(Alex) to claim these funds instead. Thus, ironically, Bob pays the cost of his own timelock, and Alex foots the bill of receiving the funds from him.

[Unlock Time in Monero - Link 1](https://web.getmonero.org/resources/moneropedia/unlocktime.html)

[Unlock Time in Monero - Link 2](https://monero.stackexchange.com/questions/1818/how-to-use-unlock-time)

### <u>Alex's Hashlock</u>:
Now remains to solve the issues of how Alex will receive the XMR metadata. In an HTLC (Hash & Time-Locked Contract), both funds are locked with the same secret password, which is invented and revealed when the user that initiates the trade claims his promised assets. This implies that the other user must watch the blockchain his assets are being claimed on for the revelation of that information.

However, the monero blockchain is deeply-seated in privacy and is not easy to observe. Hence, it is only natural to place the burden of the initiative on Bob, who will claim ethereum. Therefore, it is necessary that Alex's ether must first be claimed by Bob, thus revealing the hashlock secret, which will allow Alex to claim Bob's monero.

As we know, this secret must be the monero metadata, which via aforemetioned means will be timelocked to Bob. The revelation step can takes no special consideration beyond that. The metadata will be hashed (for example, with SHA256) by Bob, passed as the secret to Alex, who will lock his ETH with it. When Bob claims Alex's ETH, he reveals the metadata to do so, allowing Alex to use it and claim XMR.

### <u>Outline</u>:
I propose the following non-technical methodology in trustlessly and securely exchanging the 2 cryptocurrencies:

1) Bob prepares a transaction to send XMR to Alex, but does not post.
2) Bob hashes the metadata and (e.g. with SHA256) and sends the hash to Alex.
3) Bob also prepares the same transaction, but to himself this time, and this time relays it to he network.
4) Alex uses this hash to lock his ETH, and sets a timelock on them too.
5) When Bob claims Alex's ETH, he must reveal the original form of the metadata returned from his un-relayed transaction to Alex.
6) Alex, who watches for this, learns this information and relays Bob's payment to him by himself on his own connection to a monero RPC node.

## <u>Failure Cases</u>:
### <u>Step-wise Vulnerability Assessment</u>:
Here, I would like to analyze the various possibilities in which this protocol may be violated by parties involved.

F1) <u>Bob locks XMR but Alex shirks</u>: Then Alex cannot claim Bob's XMR and Bob just has to wait out his fund's timelock to reclaim.
F2) <u>Both lock funds but Bob shirks</u>: Then Bob awaits the expiration of his self-tx's timelock, while Alex also awaits the contract's timelock.
F3) <u>Bob tries to claim both types of funds</u>: After Bob claims Alex's ETH, his timelock is still in effect, giving Alex the chance to claim Bob's XMR before he does.

### <u>Key Images</u>:
One final technical point of interest shall be addressed, and that is the issue of ensuring that Bob's assets are frozen by the timelock. In Step #3 of the outline, the implicit assumption was made that the self-tx would use the same UTXOs (inputs) as the ones the wallet would use in the transaction toward Alex. But if that isn't true, then the frozen funds will not be the ones Bob promised to Alex, and he can steal them after he locks his ETH in his smart contract.

The means by which an input-level timelock is assured is through use of one of monero's special cryptographic features, known as a Key Image. In fact, this feature was originally necessitated by monero's Ring Signatures, which are meant to obfuscate the sender's address. Without a guarantee that the inputs were not already utilized, monero's native user-obfuscation could be used to double-spend funds.

By identifying inputs by their key images when making the self-transaction, they can selectively used to ensure that the 2 transactions on Bob's side (Monero) will bear references to the same set of UTXOs.

[Key Images - Link 1](https://monerodocs.org/public-address/standard-address/)

[Key Images - Link 2](https://monero.stackexchange.com/questions/2883/what-is-a-key-image)

### <u>Security Considerations due XMR-Obfuscation </u>:
In addition to the points explored, there are also 2 more ways in which the protocol can offer a selective advantage for one of the parties to abscond with funds. These are born on monero's emphasis on privacy.

Observe, for Step 3#:

1) Alex will receive a SHA256 hash, but precisely because he cannot inverse it to find the input, he cannot verify it was generated using Bob's XMR Tx-metadata. Bob here has the chance to pass a false-hash.

, and for Step 4#:

2) Alex must know for sure Bob has locked his funds before exposing his own to his claim. However, what he will receive from Bob is simply a transaction hash, which due to monero's privacy-oriented character, will not be able to be used to directly verify Bob's involvement in it. It could be just another transaction.

How can we account for these 2 vulnerabilities? The answer, I believe, is simply to automate the process. By creating a user interface(UI) that automatically carries out the metadata-hash generation and validates the self-transaction was constructed and posted successfully, Bob has no control over the process.

## <u>Process</u>:
After this long discussion on the matter, I would like to conclude by offering another, more detailed and technically accurate, outline of the protocol:
1) Bob prepares a transaction to Alex's XMR account.
2) Bob hashes the transaction metadata with SHA256 and passes it to Alex.
3) Bob relays a self-transaction with the same inputs.
4) Alex inspects the self-transaction and locks his ETH via timelock and Bob's hash.
5) Bob claims ETH by revealing the pre-signed transaction metadata.
6) Alex then relays the prepared monero transaction, claiming Bob's XMR, while Bob's timelock is still in effect.
