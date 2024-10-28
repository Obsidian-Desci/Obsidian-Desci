import { createRoot } from 'react-dom/client';
import { WalletStatusBarItem} from './src/components/WalletStatusBarItem'
import { Notice, Plugin, ItemView } from 'obsidian';
import {
	type CanvasView,
} from './src/utils/canvas-util'
import { getDpid } from './src/desci-nodes/getDpid'
import { runSdxl } from './src/lilypad/runSdxl'
import { runCowsay } from 'src/lilypad/runCowsay';
import { dagGet } from './src/ipfs/dagGet'
import { cat } from './src/ipfs/cat'
import { add } from './src/ipfs/add'
import { createWalletClient, createPublicClient, http, getContract  } from 'viem'
import { privateKeyToAccount, type Account } from 'viem/accounts'
import { type WalletClient, type PublicClient } from 'viem'
import ExampleClient from './artifacts/LilypadClient.json'
import LilypadToken from './artifacts/LilypadToken.json'
import { getMolecule } from './src/plex/getMolecule'
import { getProtein } from './src/plex/getProtein'
import { runEquibind } from './src/plex/runEquibind'
import { viewMolecule } from 'src/plex/viewMolecule';
import {
	ObsidianDesciSettings,
	ObsidianDesciSettingTab,
	DEFAULT_SETTINGS
} from './src/settings';

import { WalletModal } from './src/views/WalletView';
import {
  localhost, arbitrumSepolia
} from 'viem/chains';
/*
import {
	localhost,
	mainnet,
	optimism,
	arbitrum,
	evmosTestnet,
} from 'wagmi/chains';

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi';
*/


export default class ObsidianDesci extends Plugin {
	settings: ObsidianDesciSettings;
	unloaded = false
  account: Account
  walletClient: WalletClient
  publicClient: PublicClient
  lilypadToken: any
  exampleClient: any
	logDebug: (...args: unknown[]) => void = () => { }
	async onload() {
		await this.loadSettings();
    /*
		const projectId =  'ded360a934deb7668cafc3d5ae1928e4'
		const chainsModal = [arbitrumSepolia, localhost]
		  const metadata = {
			name: 'Obsidian Desci',
			description: 'Web3 x Obsidian.md x DeSci',
			url: 'https://web3modal.com',
			icons: ['https://avatars.githubusercontent.com/u/37784886']
		}
		  
		const wagmiConfig = defaultWagmiConfig({
			chains: chainsModal,
			projectId,
			metadata,
		})
		createWeb3Modal({ wagmiConfig, projectId, chains: chainsModal })
		const walletTab = this.addRibbonIcon("wallet", "Open Wallet", () => {
			new WalletModal(this.app, wagmiConfig).open();
		})


		const walletStatus = this.addStatusBarItem()
		const rootElement = walletStatus.createEl("span")
		const root = createRoot(rootElement)
		root.render(
			<WagmiConfig config={wagmiConfig}>
		<WalletStatusBarItem/>
			</WagmiConfig>
		)
     */


		if (this.settings.privateKey) {
      // walletClient from privateKey
      const account = privateKeyToAccount('0x' + this.settings.privateKey as `0x${string}`)
      this.account = account
			this.walletClient = createWalletClient({
        account: this.account,
        chain: arbitrumSepolia,
        transport: http(this.settings.chain.rpcUrl)
			})
      this.publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http(this.settings.chain.rpcUrl)
      })

      this.lilypadToken = getContract({
        address: LilypadToken.address as `0x${string}`,
        abi: LilypadToken.abi,
        client: {
          public: this.publicClient,
          wallet: this.walletClient
        }
      })

      this.exampleClient = getContract({
        address: ExampleClient.address as `0x${string}`,
        abi: ExampleClient.abi,
        client: {
          public: this.publicClient,
          wallet: this.walletClient
        }
      })
		} else {
		}
		this.addCommand({
			id: 'runCowsay',
			name: 'runCowsay - execute the cowsay program through a smart contract',
			callback: runCowsay.bind(this)
		});
		this.addCommand({
			id: 'runSDXL',
			name: 'runSDXL - execute stable diffusion on a text node',
			callback: runSdxl.bind(this)
		});
		this.addCommand({
			id: 'getDpid',
			name: 'getDpid - retreive the json of a desci nodes research object',
			callback: getDpid.bind(this)
		});
		this.addCommand({
			id: 'ipfsCat',
			name: 'ipfsCat - attempt to fetch a cid from ipfs',
			callback: cat.bind(this)
		});
		this.addCommand({
			id: 'ipfsDagGet',
			name: 'ipfsDagGet - fetch json behind a persistent identifer',
			callback: dagGet.bind(this)
		});
		this.addCommand({
			id: 'ipfsAdd',
			name: 'ipfsAdd - Add Json objects referenced by CID',
			callback: add.bind(this)
		});
		this.addCommand({
			id: 'getMolecule',
			name: 'getMolecule -fetch an .spf file for plex',
			callback: getMolecule.bind(this)
		}),
			this.addCommand({
				id: 'getProtein',
				name: 'getProtein - fetch a .pdb file for plex',
				callback: getProtein.bind(this)
			})
		this.addCommand({
			id: 'runEquibind',
			name: 'runEquibind - run equibind on a molecule and protein node',
			callback: runEquibind.bind(this)
		})
		this.addCommand({
			id: 'viewMolecule',
			name: 'viewMolecule - view a molecule',
			callback: viewMolecule.bind(this)
		})
		this.addSettingTab(new ObsidianDesciSettingTab(this.app, this));


		this.registerExtensions(["sdf"], "markdown");
		this.registerExtensions(["pdb"], "markdown");
	}

	onunload() {
	}



	getActiveCanvas() {
		const maybeCanvasView = this.app.workspace.getActiveViewOfType(ItemView) as CanvasView | null
		return maybeCanvasView ? maybeCanvasView['canvas'] : null
	}


	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

