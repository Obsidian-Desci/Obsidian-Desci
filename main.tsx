import { createRoot } from 'react-dom/client';
import { Notice, Plugin, ItemView, FileSystemAdapter } from 'obsidian';
import {
	type CanvasView,
} from './src/utils/canvas-util'
import {
	ObsidianDesciSettings,
	ObsidianDesciSettingTab,
	DEFAULT_SETTINGS
} from './src/settings';

import { getDpid } from './src/desci-nodes/getDpid'
import { runSdxl } from './src/lilypad/runSdxl'
import { RunJobModal} from 'src/lilypad/RunJob/RunJobModal';

import { dagGet } from './src/ipfs/dagGet'
import { cat } from './src/ipfs/cat'
import { add } from './src/ipfs/add'

import { getMolecule } from './src/plex/getMolecule'
import { getProtein } from './src/plex/getProtein'
import { runEquibind } from './src/plex/runEquibind'
import { viewMolecule } from 'src/plex/viewMolecule';

import { HypercertModal } from 'src/Hypercerts/HypercertsCanvasNodeView';

import { ethers, Signer, Provider, JsonRpcProvider, Wallet } from 'ethers';
import { PrivateKeyAccount, createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts' // [!code focus]

import ExampleClient from './artifacts/ExampleClient.json'
import { WalletModal } from './src/Wallet/WalletView';
import { WalletStatusBarItem } from './src/Wallet/WalletStatusBarItem'

//import { testFlowNode } from './src/utils/canvas-util';
import {around} from 'monkey-around';

import {
	localhost,
	mainnet,
	optimism,
	arbitrum,
	evmosTestnet,
} from 'wagmi/chains';

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiConfig } from 'wagmi';

export default class ObsidianDesci extends Plugin {
	settings: ObsidianDesciSettings;
	unloaded = false
	provider: Provider
	wallet: Wallet
	signer: Signer
	account: PrivateKeyAccount
	exampleClient: ethers.Contract
	wagmiConfig: object
	observer: MutationObserver
	logDebug: (...args: unknown[]) => void = () => { }
	async onload() {
		await this.loadSettings();

		const projectId = 'ded360a934deb7668cafc3d5ae1928e4'
		const chainsModal = [mainnet, optimism, arbitrum, localhost]
		const metadata = {
			name: 'Obsidian DeSci',
			description: 'Obsidian DeSci',
			url: 'https://web3modal.com',
			icons: ['https://avatars.githubusercontent.com/u/37784886']
		}

		const wagmiConfig = defaultWagmiConfig({
			chains: chainsModal,
			projectId,
			metadata,
		})
		this.wagmiConfig = wagmiConfig
		createWeb3Modal({ wagmiConfig, projectId, chains: chainsModal })
		const walletTab = this.addRibbonIcon("wallet", "Open Wallet", () => {
			new WalletModal(this.app, wagmiConfig).open();
		})

		const walletStatus = this.addStatusBarItem()
		const rootElement = walletStatus.createEl("span")
		const root = createRoot(rootElement)
		root.render(
			<WagmiConfig config={wagmiConfig}>
				<WalletStatusBarItem />
			</WagmiConfig>
		)

		this.provider = new JsonRpcProvider(this.settings.chain.rpcUrl)
		if (this.settings.privateKey) {
			console.log(this.settings.privateKey)
			this.account = privateKeyToAccount('0x' + this.settings.privateKey)
			this.wallet = new Wallet(this.settings.privateKey, this.provider)
			this.signer = this.wallet.connect(this.provider)
			this.exampleClient = new ethers.Contract(ExampleClient.address, ExampleClient.abi, this.signer)
		} else {
		}
		this.addCommand({
			id: 'runJob',
			name: 'runJob - execute and edge compute job through lilypad',
			callback: () => {
				new RunJobModal(this.app, wagmiConfig).open();
			}
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
		this.addCommand({
			id: 'createHypercert',
			name: 'createHypercert - create a hypercert',
			callback: () => {
				new HypercertModal(this.app, wagmiConfig, this.settings.nftStorageApiKey, this.settings.web3StorageApiKey).open();
			}
		})
		/*
		this.addCommand({
			id: 'testFlowNode',
			name: 'testFlowNode - test flow node',
			callback: testFlowNode.bind(this, {
				name: 'test',
				inputs: ['a', 'b'], 
				parameters: ['c'],
				outputs: ['sum'],
				fn: (a:string, b:string) => Number(a) + Number(b),
				size: { height: 261, width: 261*2 }
			})
		})
		*/
		this.addSettingTab(new ObsidianDesciSettingTab(this.app, this));


		this.registerExtensions(["sdf"], "markdown");
		this.registerExtensions(["pdb"], "markdown");
		/*
		this.register(around(this.app.internalPlugins.plugins.canvas.constructor.prototype, {
			saveData(oldMethod) {
				console.log('hi')	
				console.log('old', oldMethod)
				return function(...args) {
					console.log('there')
					const result = oldMethod && oldMethod.apply(this, args)
					console.log('newsave', result)
					return result
				}
			},
			handleConfigFileChange(oldMethod) {
				console.log('config file change')
				console.log('oldMethod', oldMethod)
				return function (...args) {
					const result = oldMethod && oldMethod.apply(this, args)
					console.log('config filechange', result)
					return result
				}
			}
		}))
		console.log(this.app.internalPlugins.plugins.canvas)
		/*	
		console.log('app.internalPlugins...', this.app.internalPlugins.plugins.canvas.constructor.prototype.saveData)
		console.log(this.app.vault.writeConfigJson)
		// Monkey patching the saveData method
		this.app.internalPlugins.plugins.canvas.constructor.prototype.saveData = ((oldSaveData) => {
		    return function(...args) {
		        // Perform your operations here
		        // For example, add additional data
		        const additionalData = {
		            extra: "Data"
		        };
				console.log('saving', args)
		        // Merge the additional data
		        const result = {...oldSaveData.apply(this, args), ...additionalData};
		        console.log('newsave', result)
		        return result;
		    }
		})(this.app.internalPlugins.plugins.canvas.constructor.prototype.saveData);

		this.app.workspace.on('layout-change', (evt) => {
			console.log('evt', evt)
			const canvas = this.getActiveCanvas()
			if (canvas) {
				if(typeof canvas.flowNodes === 'undefined') {
					canvas.flowNodes = []
				}
				canvas.requestSave()
				const inputRef = document.querySelector('.canvas-edges')
				const config = { attributes: true, childList: true, subtree: true };
				const callback = (mutationList, observer) => {
					console.log('flow nodes',canvas.flowNodes)
					console.log('canvas', canvas)

					canvas.flowNodes.forEach((nodeId,i) => {
						console.log('nodeId', nodeId);
						const node = canvas.nodes.get(nodeId)
						const inputVals = []
						console.log('node', node)
						node.flowData.inputNodes.forEach((input, i) => {
							const edge = canvas.getEdgesForNode(canvas.nodes.get(input))
							if (edge.length === 1) {
								inputVals.push(edge[0].from.node.text)
							}
						})
						console.log('inputvals', inputVals)
						console.log('inputNodes', node.flowData.inputNodes.length)
						if (inputVals.length === node.flowData.inputNodes.length) {
							const outputNode = canvas.nodes.get(node.flowData.outputNodes[0])
							const outputEdge = canvas.getEdgesForNode(outputNode)
							console.log(outputEdge)
							if (outputEdge.length === 1) {
								const output = node.flowData.fn(...inputVals)
								console.log('output', output)
								outputEdge[0].to.node.setData({
									text: `${output}` // output
								})
							}
						}

						console.log('node', node)
					})
					for (const mutation of mutationList) {
						if (mutation.type === 'childList') {
							console.log('mutation', mutation)
						} else if (mutation.type === 'attributes') {
							console.log('mutation attribute  name', mutation.attributeName)
						}
					}
				}

				this.observer = new MutationObserver(callback)
				this.observer.observe(inputRef, config)
			} else {
				if (this.observer) {
					this.observer.disconnect()
				}
			}
		})
*/
	}

	onunload() {
		console.log('unloading')
		/*
		this.app.workspace.off('layout-change', (evt) => {
			console.log('off loading layout change')
		})	
		*/
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

