// Imports
let api   = require('./api')
let web3  = require('web3')
let Tx    = require('ethereumjs-tx').Transaction
let axios = require('axios')

// Settings
let PROJECTID = '4ae1a7cf65794f9dbb5222f2e10316c8'
let ABI_SHUFFLER = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"balance","type":"uint256"}],"name":"DealShuffledFunds","type":"event"},{"inputs":[],"name":"CJA","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"addrSpace","type":"address[]"}],"name":"storeAddresses","outputs":[],"stateMutability":"payable","type":"function"}]
let ABI_SWAPPER  = [{"inputs":[{"internalType":"address","name":"rec","type":"address"},{"internalType":"uint256","name":"sum","type":"uint256"},{"internalType":"bytes32","name":"pass","type":"bytes32"},{"internalType":"uint256","name":"locktime","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"amount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"inpSecret","type":"string"}],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"fee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"fund","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"getBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"input","type":"string"}],"name":"hash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"passhash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"recipient","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"refund","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"secret","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"time_lock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"time_start","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]
let ShufflerAddr = '0x9ddfc791152dda96616282dbf8b106d70e705d1f'
// let SwapperAddr  = '0xebdA80D4B139D811E8fb4a3e4437ee2B1cc7d9fc'

// Maincode
class EthereumWallet {
  constructor() {
    this.api = new api()
    this.url_main     = `https://mainnet.infura.io/v3/${PROJECTID}`
    this.url_rinkeby  = `https://rinkeby.infura.io/v3/${PROJECTID}`
    this.url_ropsten  = `https://ropsten.infura.io/v3/${PROJECTID}`
    this.url_kovan    = `https://kovan.infura.io/v3/${PROJECTID}`
    this.url_goerli   = `https://goerli.infura.io/v3/${PROJECTID}`
    this.url = this.url_main  // Default Network is the Ethereum Mainnet
    this.keychain = []        // Array to hold accounts for a user
  }

  ShowWallet(i=0) {
    return this.keychain[i]
  }

  SwitchNetwork(net) {
    switch (net) {
      case 'main':
        this.url = this.url_main
        break
      case 'rinkeby':
        this.url = this.url_rinkeby
        break
      case 'ropsten':
        this.url = this.url_ropsten
        break
      case 'kovan':
        this.url = this.url_kovan
        break
      case 'goerli':
        this.url = this.url_goerli
        break
      default:
        console.error('ERROR: Network Not Supported, Default to Mainnet')
        this.url = this.url_main; break
    }
  }

  NewWallet(net,key=false) {
    return new Promise((resolve,reject) => {
      try {
        // Switch Network if Necessary
        if (net !== 'main') this.SwitchNetwork(net)
        let accounts = new web3(this.url).eth.accounts

        // Create New Account (or Import Old Account, by private key)
        let Account = key ? accounts.privateKeyToAccount(key) : accounts.create()
        if (!key) this.keychain.push(Account)
        resolve(Account)
      } catch (err) { reject(err) }
    })
  }

  // By default, fetches the balance for the first address of your account
  AccountBalance(net,Address=this.keychain[0].address) {
    return new Promise(async (resolve,reject) => {
      try {
        // Switch Network if Necessary
        if (net !== 'main') this.SwitchNetwork(net)
        let WEB3 = new web3(this.url)

        // Fetch Address Balance in ETH
        let balance = WEB3.utils.fromWei(await WEB3.eth.getBalance(Address),'ether')
        resolve(Number(balance))
      } catch (err) { reject(err) }
    })
  }

  getGasPrices() {
    return new Promise((resolve,reject) => {
      try {
        let url = 'https://ethgasstation.info/json/ethgasAPI.json'
        axios.get(url).then(({data}) => resolve({
          low: data.safeLow/10,
          medium: data.average/10,
          high: data.fast/10
        }))
      } catch (err) { reject(err) }
    })
  }

  PrivateFromPublic(address,keychain=this.keychain) {
    return new Promise((resolve,reject) => {
      try {
        // Find Account by Address
        let account = keychain.filter(x => x.address === address)
        resolve(account)
      } catch (err) { reject(err) }
    })
  }

  SendTransaction(net,SenderAddress,SenderPrivKey,ReceiveAddress,TxAmount) {
    return new Promise((resolve,reject) => {
      try {
        // Switch Network if Necessary
        if (net !== 'main') this.SwitchNetwork(net)
        let WEB3 = new web3(this.url)

        // Validation Check
        this.AccountBalance(net,SenderAddress).then(balance => {
          if (balance < TxAmount) reject('ERROR: Insufficient Balance')
        }).catch(err => reject(err))

        // Transaction Code
        WEB3.eth.getTransactionCount(SenderAddress,(err,txcount) => {
          if (err) reject(err)
          this.getGasPrices().then(gasPrices => {
            // Pt[1/3]: Prepare Transaction Object
            let TxObject = {
              nonce: WEB3.utils.toHex(txcount),
              to: ReceiveAddress,
              value: WEB3.utils.toHex(WEB3.utils.toWei(TxAmount.toString(),'ether')),
              gasLimit: WEB3.utils.toHex(21000),
              gasPrice: WEB3.utils.toHex(WEB3.utils.toWei('10','gwei'))
            }

            // Pt[2/3]: Sign Transaction
            let tx = new Tx(TxObject,{'chain':net})
            let privKey = Buffer.from((SenderPrivKey.split('0x'))[1],'hex')
            tx.sign(privKey)

            // Pt[3/3]: Post Transaction
            let serializedTx = tx.serialize()
            let RawT = '0x' + serializedTx.toString('hex')
            WEB3.eth.sendSignedTransaction(RawT,(err,txhash) => {
              if (err) {reject(err)} else resolve(txhash)
            })
          })
        })
      } catch (err) { reject(err) }
    })
  }

  // Deploying a contract requires sending the hex-representation of its
  // code using a non-standard transaction object
  writeContract(net,SenderAddress,SenderPrivKey,codeHex) {
    return new Promise((resolve,reject) => {
      try {
        // Switch Network if Necessary
        if (net !== 'main') this.SwitchNetwork(net)
        let WEB3 = new web3(this.url)

        // Transaction Code
        WEB3.eth.getTransactionCount(SenderAddress,(err,txcount) => {
          if (err) reject(err)
          this.getGasPrices().then(gasPrices => {
            // Pt[1/3]: Prepare Transaction Object
            let TxObject = {
              nonce: WEB3.utils.toHex(txcount),
              gasLimit: WEB3.utils.toHex(8e5),  //Scientific Notation(== 8*10**5)
              gasPrice: WEB3.utils.toHex(WEB3.utils.toWei('10','gwei')),
              data: codeHex // Smart Contract Code as Hex
            }

            // Pt[2/3]: Sign Transaction
            let tx = new Tx(TxObject,{'chain':net})
            let privKey = Buffer.from((SenderPrivKey.split('0x'))[1],'hex')
            tx.sign(privKey)

            // Pt[3/3]: Post Transaction
            let serializedTx = tx.serialize()
            let RawT = '0x' + serializedTx.toString('hex')
            WEB3.eth.sendSignedTransaction(RawT,(err,txhash) => {
              if (err) {reject(err)} else resolve(txhash)
            })
          })
        })
      } catch (err) { reject(err) }
    })
  }

  async deployContract(net,Address,PrivKey,ABI,Bytecode,cargs) {
    // Access Contract by Bytecode & ABI
    if (net !== 'main') this.SwitchNetwork(net)
    let {accounts,Contract,sendSignedTransaction} = new web3(this.url).eth
    let contract = new Contract(ABI)
    let contractTx = contract.deploy({data:Bytecode,arguments:cargs})
    
    // Prepare Deployment Transaction
    let TX = await accounts.signTransaction({from:Address,gas:2000000,data:contractTx.encodeABI()},PrivKey)
  
    // Deploy Contract to Network
    let receipt = await sendSignedTransaction(TX.rawTransaction)
    console.log(`Contract Deployed at Address: ${receipt.contractAddress}`)
  }

  // To call a contract, again, a transaction is utilized, complete with
  // its own costs in gas and network fees
  callContract(net,SenderAddress,SenderPrivKey,contractInfo) {
    return new Promise((resolve,reject) => {
      try {
        // Switch Network if Necessary
        if (net !== 'main') {this.SwitchNetwork(net)} else {net = 'mainnet'}
        let WEB3 = new web3(this.url)

        // contractInfo is a collection of relevant information to the contract
        let {ContractABI,ContractAddress,method,params,funds} = contractInfo
        let contract = new WEB3.eth.Contract(ContractABI,ContractAddress)  // Accesses the Smart Contract
        let contractData = contract.methods[method](...params).encodeABI() // Accesses the Method, passing parameters automatically

        // Transaction Code
        WEB3.eth.getTransactionCount(SenderAddress,(err,txcount) => {
          if (err) reject(err)
          this.getGasPrices().then(gasPrices => {
            // Pt[1/3]: Prepare Transaction Object
            let TxObject = {
              nonce: WEB3.utils.toHex(txcount),
              gasLimit: WEB3.utils.toHex(8e5),
              gasPrice: WEB3.utils.toHex(WEB3.utils.toWei('10','gwei')),
              to: ContractAddress, // Accesses the Contract's Account
              data: contractData,  // Smart Contract Code as Hex
              value: funds         // Funds, in case of payable operation
            }

            // Pt[2/3]: Sign Transaction
            let tx = new Tx(TxObject,{'chain':net})
            let privKey = Buffer.from((SenderPrivKey.split('0x'))[1],'hex')
            tx.sign(privKey)

            // Pt[3/3]: Post Transaction
            let serializedTx = tx.serialize()
            let RawT = '0x' + serializedTx.toString('hex')
            WEB3.eth.sendSignedTransaction(RawT,(err,txhash) => {
              if (err) {reject(err)} else resolve(txhash)
            })
          })
        })
      } catch (err) { reject(err) }
    })
  }

  // Make Destination Accounts in accordance with the contract's needs
  madeDestAcc(net,amount,CJA) {
    let accNo = parseInt(amount/CJA)
    let accounts = []
    for (let i=0; i<accNo; i++) {accounts.push(this.NewWallet(net))}
    return Promise.all(accounts)
  }

  // ETH Coinshuffling Contract Calls
  joinShuffle(net,SenderAddress,SenderPrivKey,addrArray,funds) {
    if (net !== 'main') this.SwitchNetwork(net)
    let WEB3 = new web3(this.url)
    let ContractInfo = {
      ContractABI: ABI_SHUFFLER,
      ContractAddress: ShufflerAddr,
      method: 'storeAddresses',
      params: [addrArray],
      funds: WEB3.utils.toHex(WEB3.utils.toWei(`${funds}`,'ether'))
    }

    return this.callContract(net,SenderAddress,SenderPrivKey,ContractInfo)
  }

  // ETH-Side XCAS Contract Calls
  lockETH(net,SenderAddress,SenderPrivKey,funds,SwapperAddr) {
    if (net !== 'main') this.SwitchNetwork(net)
    let WEB3 = new web3(this.url)
    let ContractInfo = {
      ContractABI: ABI_SWAPPER,
      ContractAddress: SwapperAddr,
      method: 'fund', params: [],
      funds: WEB3.utils.toHex(WEB3.utils.toWei(`${funds}`,'ether'))
    }
    
    return this.callContract(net,SenderAddress,SenderPrivKey,ContractInfo)
  }

  claimETH(net,SenderAddress,SenderPrivKey,inpSecret,SwapperAddr) {
    if (net !== 'main') this.SwitchNetwork(net)
    let ContractInfo = {
      ContractABI: ABI_SWAPPER,
      ContractAddress: SwapperAddr,
      method: 'claim', params: [inpSecret]
    }
    
    return this.callContract(net,SenderAddress,SenderPrivKey,ContractInfo)
  }

  refundETH(net,SenderAddress,SenderPrivKey,SwapperAddr) {
    if (net !== 'main') this.SwitchNetwork(net)
    let ContractInfo = {
      ContractABI: ABI_SWAPPER,
      ContractAddress: SwapperAddr,
      method: 'refund', params: []
    }
    
    return this.callContract(net,SenderAddress,SenderPrivKey,ContractInfo)
  }
}

// Exports
module.exports = EthereumWallet