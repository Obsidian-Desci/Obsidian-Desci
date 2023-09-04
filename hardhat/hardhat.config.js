require('dotenv').config()
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  //defaultNetwork: 'lilypad',
  networks: {
    hardhat: {
      forking: {
        url: "http://testnet.lilypadnetwork.org:8545"
      },
      accounts: {
        mnemonic: process.env.MNEMONIC
      }
    },
    lilypad: {
      url: "http://testnet.lilypadnetwork.org:8545",
      accounts: {
        mnemonic: process.env.MNEMONIC
      }
    }
  },
};
