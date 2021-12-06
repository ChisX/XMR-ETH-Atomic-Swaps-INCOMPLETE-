// Imports
let {alias} = require('react-app-rewire-alias')

// Settings
module.exports = function override(config) {
  alias({
    '@comps': 'src/components',
    '@resrc': 'src/resources',
    '@xmr': 'src/modules/monero',
    '@eth': 'src/modules/ethereum',
  })(config)

  return config
}