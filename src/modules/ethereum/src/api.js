// Imports
let axios = require('axios').default

// Settings
let Wei = 10**18    // Wei in 1 ETH

// Maincode
class EthWalletAPI {
  constructor() {
    this.url = 'https://api.blockcypher.com/v1/eth/main'
  }

  EthNetInfo() {
    return new Promise((resolve,reject) => {
      try {
        axios.get(this.url).then(({data}) => resolve({
          chainheight: data.height,
          lasthash: data.hash,
          lastupdate: data.time,
        }))
      } catch (err) { reject(err) }
    })
  }

  BlockInfo(id) {
    return new Promise((resolve,reject) => {
      try {
        // Numerical Data is in Wei, so to get in Ether, divide by 10**18
        let url = this.url + `/blocks/${id}`
        axios.get(url).then(({data}) => resolve({
          bhash: data.hash,
          bheight: data.height,
          chain: data.chain,
          amount: data.total/Wei,
          bfees: data.fees/Wei,
          bsize: data.size,
          creation_time: data.time,
          txnum: data.n_tx,
          prevhash: data.prev_block,
          transactions: data.txids
        }))
      } catch (err) { reject(err) }
    })
  }

  TxInfo(txhash) {
    return new Promise((resolve,reject) => {
      try {
        let url = this.url + `/txs/${txhash}`
        axios.get(url).then(({data}) => resolve({
          bheight: data.block_height,
          bindex: data.block_index,
          addresses: data.addresses,
          amount: data.total/Wei,
          txfees: data.fees/Wei,
          txsize: data.size,
          txgas: data.gas_used,
          txprice: data.gas_price,
          numin: data.vin_sz,
          numout: data.vout_sz,
          confirmcount: data.confirmations,
          txparent: data.parent_tx,
          timeconf: data.confirmed,
          gaslimit: data.gas_limit
        }))
      } catch (err) { reject(err) }
    })
  }

  // To test if a tx is executed by a contract
  ByContract(txhash) {
    return new Promise(async (resolve,reject) => {
      try {
        let {txparent: data} = await this.TxInfo(txhash)
        resolve(data ? data : false)
      } catch (err) { reject(err) }
    })
  }

  IsConfirmed(txhash) {
    return new Promise(async (resolve,reject) => {
      try {
        let {confirmcount: data} = await this.TxInfo(txhash)
        resolve(data ? data : false)
      } catch (err) { reject(err) }
    })
  }

  AccountTxs(address,limit=10) {
    let url = this.url + `/addrs/${address}`
    return new Promise((resolve,reject) => {
      try {
        axios.get(url).then(({data}) => resolve({
          txsummary: data.txrefs.slice(0,limit-1),
          txnum: data.n_tx
        }))
      } catch (err) { reject(err) }
    })
  }
}

// Exports
module.exports = EthWalletAPI