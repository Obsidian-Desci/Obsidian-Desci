import { defineChain } from 'viem'
import { mainnet, optimism, localhost } from 'viem/chains'
import { publicProvider } from 'viem/providers'
import { configureChains } from 'wagmi'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { w3mProvider } from '@web3modal/ethereum'

export const lilypad = defineChain({
  id: 1337,
  name: 'Lilypad v2 Aurora testnet',
  network: 'lilypad',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://testnet.lilypad.tech:8545'],
    },
    public: {
      http: ['http://testnet.lilypad.tech:8545'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer.zora.energy' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 5882,
    },
  },
})


export const { chains, publicClient } = configureChains(
    [mainnet, optimism, lilypad, localhost],
     [
    w3mProvider({ projectId: 'ded360a934deb7668cafc3d5ae1928e4' }),
    jsonRpcProvider({
        rpc: (chains) => {
            switch (chains.id) {
                case 1337: 
                return {
                    http: 'http://testnet.lilypad.tech:8545',
                }
            }
        }
    }),
])