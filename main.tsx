import { requestUrl, App, TFile, Editor, MarkdownView, Modal, Notice, Plugin, ItemView, WorkspaceLeaf } from 'obsidian';
import { 
	type CanvasView,
  } from './utils/canvas-util'
import { getDpid } from './desci-nodes/getDpid'
import { runSdxl } from './lilypad/runSdxl'
import { runCowsay } from 'lilypad/runCowsay';
import {dagGet} from './ipfs/dagGet'
import {kuboFetch} from './ipfs/kuboFetch'
import {cat} from './ipfs/cat'
import {add} from './ipfs/add'
import { ethers, Signer, Provider, JsonRpcProvider, Wallet } from 'ethers';
import ExampleClient from './artifacts/ExampleClient.json'

import { 
	ObsidianDesciSettings,
	ObsidianDesciSettingTab,
	DEFAULT_SETTINGS
 } from 'settings';
// Remember to rename these classes and interfaces!


export default class ObsidianDesci extends Plugin {
	settings: ObsidianDesciSettings;
	unloaded = false
	provider: Provider
	wallet: Wallet
	signer: Signer
	exampleClient: ethers.Contract
	logDebug: (...args: unknown[]) => void = () => { }
	decoder: TextDecoder
	async onload() {
		await this.loadSettings();
		this.provider = new JsonRpcProvider(this.settings.chain.rpcUrl)
		if (this.settings.privateKey) {
			this.wallet = new Wallet(this.settings.privateKey, this.provider)
			this.signer = this.wallet.connect(this.provider)
			console.log('clientadd', ExampleClient.address)
			this.exampleClient = new ethers.Contract(ExampleClient.address, ExampleClient.abi, this.signer)
		} else {
			console.log('no private key detected, web3 not enabled')
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
			id: 'ipfsKuboFetch',
			name: 'ipfsKuboFetch - fetch a Cid from a Kubo node  ',
			callback: kuboFetch.bind(this)
		});

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Obsidian Lilypad', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere

		// This adds a complex command that can check whether the current state of the app allows execution of the command

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ObsidianDesciSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
		console.log('end of onload')
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

