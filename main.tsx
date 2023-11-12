import { Notice, Plugin, ItemView } from 'obsidian';
import { 
	type CanvasView,
  } from './src/utils/canvas-util'
import { getDpid } from './src/desci-nodes/getDpid'
import { runSdxl } from './src/lilypad/runSdxl'
import { runCowsay } from 'src/lilypad/runCowsay';
import {dagGet} from './src/ipfs/dagGet'
import {cat} from './src/ipfs/cat'
import {add} from './src/ipfs/add'
import { ethers, Signer, Provider, JsonRpcProvider, Wallet } from 'ethers';
import ExampleClient from './artifacts/ExampleClient.json'
import { getMolecule} from './src/plex/getMolecule'
import { getProtein} from './src/plex/getProtein'
import { runEquibind } from './src/plex/runEquibind'
import { viewMolecule } from 'src/plex/viewMolecule';
import { 
	ObsidianDesciSettings,
	ObsidianDesciSettingTab,
	DEFAULT_SETTINGS
 } from './src/settings';


export default class ObsidianDesci extends Plugin {
	settings: ObsidianDesciSettings;
	unloaded = false
	provider: Provider
	wallet: Wallet
	signer: Signer
	exampleClient: ethers.Contract
	logDebug: (...args: unknown[]) => void = () => { }
	async onload() {
		await this.loadSettings();
		this.provider = new JsonRpcProvider(this.settings.chain.rpcUrl)
		if (this.settings.privateKey) {
			this.wallet = new Wallet(this.settings.privateKey, this.provider)
			this.signer = this.wallet.connect(this.provider)
			this.exampleClient = new ethers.Contract(ExampleClient.address, ExampleClient.abi, this.signer)
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

