import { requestUrl, App, TFile, Editor, MarkdownView, Modal, Notice, Plugin, ItemView, WorkspaceLeaf } from 'obsidian';
import { type CanvasNode  } from './utils/canvas-internal'
import { 
	type CanvasView,
	createNode,
	placeholderNoteHeight,
	assistantColor,
	getNodeText
  } from './utils/canvas-util'
import { getDpid} from './desci-nodes/getDpid'
import { runSdxl} from './lilypad/runSdxl'
import {dagGet} from './ipfs/dagGet'
import {kuboFetch} from './ipfs/kuboFetch'
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
			callback: () => {
				this.runCowsay()
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
			callback: () => {
				this.cat()
			}
		});
		this.addCommand({
			id: 'ipfsDagGet',
			name: 'ipfsDagGet - fetch json behind a persistent identifer',
			callback: dagGet.bind(this)
		});
		this.addCommand({
			id: 'ipfsAdd',
			name: 'ipfsAdd - Add Json objects referenced by CID',
			callback: () => {
				this.ipfsAdd()
			}
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

	async cat() {
		if (this.unloaded) return

		this.logDebug("attempting to fetch from ipfs")

		const canvas = this.getActiveCanvas()
		if (!canvas) {
			this.logDebug('No active canvas')
			return
		}
		const selection = canvas.selection
		if (selection?.size !== 1) return
		const values = Array.from(selection.values())
		const node = values[0]
		if (node) {
			await canvas.requestSave()
			await sleep(200)

			const settings = this.settings

			const nodeData = node.getData()
			let nodeText = await getNodeText(node) || ''
			if (nodeText.length == 0) {
				this.logDebug('no node Text found')
				return
			}

			const created = createNode(canvas, node,
				{
					text: `attempting to fetch ${nodeText} from ipfs`,
					size: { height: placeholderNoteHeight }
				},
				{
					color: assistantColor,
					chat_role: 'assistant'
				}
			)

			try {
				const res = await requestUrl(`http://localhost:3000/?cid=${nodeText}`)
				console.log('res', res)
				
				const cidNode = createNode(canvas, created,
					{
						text: `${res.text}`,
						size: { height: placeholderNoteHeight }
					},
					{
						color: assistantColor,
						chat_role: 'assistant'
					}
				)

			} catch (e) {
				const cideNodeError = createNode(canvas, created,
					{
						text: `error at ${e}`,
						size: { height: placeholderNoteHeight }
					},
					{
						color: assistantColor,
						chat_role: 'assistant'
					}
				)

			}
		}
	}

	async ipfsAdd() {
		if (this.unloaded) return

		this.logDebug("attempting to fetch from ipfs")

		const canvas = this.getActiveCanvas()
		if (!canvas) {
			this.logDebug('No active canvas')
			return
		}
		const selection = canvas.selection
		if (selection?.size !== 1) return
		const values = Array.from(selection.values())
		const node = values[0]
		if (node) {
			await canvas.requestSave()
			await sleep(200)
			let climb = true
			while (climb) {
				const siblings = canvas.getEdgesForNode(node)
				siblings.forEach((n) => {
					
				})
			}


			const settings = this.settings

			const nodeData = node.getData()
			let nodeText = await getNodeText(node) || ''
			if (nodeText.length == 0) {
				this.logDebug('no node Text found')
				return
			}

			const created = createNode(canvas, node,
				{
					text: `attempting to convert tree to dag`,
					size: { height: placeholderNoteHeight }
				},
				{
					color: assistantColor,
					chat_role: 'assistant'
				}
			)

			try {
				/*
				const dag = {}
				const cid = await requestUrl({
					url: `http://localhost:3000/add`,
					method: 'POST',
					body: JSON.stringify({
						
					})

				})
				const cid = await this.dagJsonInstance.add({
					text: nodeText
				})
				const cidNode = createNode(canvas, created,
					{
						text: `added at ${cid.toString()}`,
						size: { height: placeholderNoteHeight }
					},
					{
						color: assistantColor,
						chat_role: 'assistant'
					}
				)
				*/
			} catch (e) {
				const cideNodeError = createNode(canvas, created,
					{
						text: `error at ${e}`,
						size: { height: placeholderNoteHeight }
					},
					{
						color: assistantColor,
						chat_role: 'assistant'
					}
				)

			}
		}
	}
	async ipfsDagGet() {
		if (this.unloaded) return

		const canvas = this.getActiveCanvas()
		if (!canvas) {
			this.logDebug('No active canvas')
			return
		}
		const selection = canvas.selection
		if (selection?.size !== 1) return
		const values = Array.from(selection.values())
		const node = values[0]
		if (node) {
			await canvas.requestSave()
			await sleep(200)

			const settings = this.settings

			const nodeData = node.getData()
			let nodeText = await getNodeText(node) || ''
			if (nodeText.length == 0) {
				this.logDebug('no node Text found')
				return
			}

			const created = createNode(canvas, node,
				{
					text: `attempting to fetch ${nodeText} from ipfs`,
					size: { height: placeholderNoteHeight }
				},
				{
					color: assistantColor,
					chat_role: 'assistant'
				}
			)
			try {
				console.log('waiting for ipfs. . .')
				let res = await requestUrl(`http://localhost:3000/dag?cid=${nodeText}`)
				console.log('res', res)
				res.json.Links.forEach((link:any) => {
					const name = createNode(canvas, created,
						{
							text: `${link.Name}`,
							size: { height: placeholderNoteHeight }
						},
						{
							color: assistantColor,
							chat_role: 'assistant'
						}
					)
					createNode(canvas, name,
						{
							text: `${link.Hash['/']}`,
							size: { height: placeholderNoteHeight }
						},
						{
							color: assistantColor,
							chat_role: 'assistant'
						}
					)
				})
				created.setText('success~')
			} catch (e) {
				this.logDebug(e)
				console.log('ipfs fetch error: ', e)
				created.setText(`error :( : ${e}`)
				return
			}
		}
	}
	async runCowsay() {
		console.log('unloaded status: ', this.unloaded)
		if (this.unloaded) return

		this.logDebug("Running Cowsay")

		const canvas = this.getActiveCanvas()
		if (!canvas) {
			this.logDebug('No active canvas')
			return
		}
		const selection = canvas.selection
		if (selection?.size !== 1) return
		const values = Array.from(selection.values())
		const node = values[0]
		if (node) {
			await canvas.requestSave()
			await sleep(200)

			const settings = this.settings

			const nodeData = node.getData()
			let nodeText = await getNodeText(node) || ''
			if (nodeText.length == 0) {
				console.log('no node text')
				this.logDebug('no node Text found')
				return
			}

			const created = createNode(canvas, node,
				{
					text: `Calling Lilpad Cowsay with ${nodeText}`,
					size: { height: placeholderNoteHeight }
				},
				{
					color: assistantColor,
					chat_role: 'assistant'
				}
			)
			try {
				console.log('waiting for cowsay run')
				const tx = await this.exampleClient.runCowsay(
					nodeText, {
					value: ethers.parseUnits('2', 'ether')
				}
				)

				console.log('tx', tx)
				created.setText(`success! tx hash: ${tx.hash}, fetching ipfs.io cid`)

				const res = await this.exampleClient.fetchAllResults()
				const ipfsio = res[res.length - 1][2]
				const cid = res[res.length - 1][1]
				created.setText(`job complete see on ${ipfsio}`)
				console.log('hmmmmmm')
				const ipfsFetchNode = createNode(canvas, created,
					{
						text: `${cid}`,
						size: { height: placeholderNoteHeight }
					},
					{
						color: assistantColor,
						chat_role: 'assistant'
					}
				)

			} catch (e) {
				created.setText(`error :( ${e}`)
				this.logDebug(`error :( : ${e}`)
				return
			}
		}
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

