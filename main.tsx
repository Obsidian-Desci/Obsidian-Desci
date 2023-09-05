import { App, TFile, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, ItemView, WorkspaceLeaf } from 'obsidian';
import { AllCanvasNodeData } from 'obsidian/canvas'
import { CanvasView, addEdge } from './utils/canvas-util'

import { Canvas, CanvasNode, CreateNodeOptions } from './utils/canvas-internal'
import { ReactView } from './components/views/ReactView'
import { createContext, StrictMode, useContext } from "react";
import { createRoot, Root } from 'react-dom/client'
import { AppContext } from 'components/context/context';
const VIEW_TYPE_EXAMPLE = "example-view";

import { ethers, Signer, Provider, JsonRpcProvider, Wallet } from 'ethers';
import ExampleClient from './artifacts/ExampleClient.json'

import { Helia, createHelia } from 'helia'
import { unixfs, UnixFS } from '@helia/unixfs'
import { CID } from 'multiformats'

interface ChainConfig {
	name: string;
	rpcUrl: string;
	chainId: number;
}

// Remember to rename these classes and interfaces!

interface ObsidianLilypadSettings {
	privateKey: string;
	chain: ChainConfig
}

const DEFAULT_SETTINGS: ObsidianLilypadSettings = {
	privateKey: '',
	chain: {
		name: 'lilypad',
		rpcUrl: 'http://testnet.lilypadnetwork.org:8545',
		chainId: 1337
	}
}

export default class ObsidianLilypad extends Plugin {
	settings: ObsidianLilypadSettings;
	unloaded = false
	provider: Provider
	wallet: Wallet
	signer: Signer
	exampleClient: ethers.Contract
	logDebug: (...args: unknown[]) => void = () => { }
	helia: Helia
	fs: UnixFS
	decoder: TextDecoder
	async onload() {
		await this.loadSettings();
		this.provider = new JsonRpcProvider(this.settings.chain.rpcUrl)
		if (this.settings.privateKey) {
			this.wallet = new Wallet(this.settings.privateKey, this.provider)
			this.signer = this.wallet.connect(this.provider)
			this.exampleClient = new ethers.Contract(ExampleClient.address, ExampleClient.abi, this.signer)
		} else {
			console.log('no private key detected, web3 not enabled')
		}
		this.addCommand({
			id: 'runCowsay',
			name: 'execute the cowsay program through a smart contract',
			callback: () => {
				this.runCowsay()
			}
		});
		try {
			this.helia = await createHelia()
			this.fs = unixfs(this.helia)
			this.decoder = new TextDecoder()
		} catch (e) {
			this.logDebug(`helia init error: ${e}`)
		}
		console.log('passed helia')

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
		this.addCommand({
			id: 'ipfsCat',
			name: 'attempt to fetch a cid from ipfs',
			callback: (checking: boolean) => {
				this.cat()
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ObsidianLilypadSettingTab(this.app, this));

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
			let content:string = ''
			try {
				console.log('waiting for ipfs. . .')
				let Cid = CID.parse(String(nodeText))
				console.log('Cid', Cid)
				console.log('Cid', Cid.toString())
				for await (const buf of this.fs.cat(CID.parse(String(nodeText)))) {
					console.info(buf)
					content += this.decoder.decode(buf, {
						stream: true
					})
				  }
				created.setText(content)
			} catch (e) {
				this.logDebug(e)
				console.log('ipfs fetch error: ', e)
				created.setText(`error :( : ${e}`)
				return
			}
			created.setText(content)

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
				const ipfsio = res[res.length -1][2]
				const cid = res[res.length - 1][1]
				created.setText(`job complete see on ${ipfsio}`)
				console.log('hmmmmmm')
				const ipfsFetchNode = createNode(canvas, created,
					{
						text: `${cid}`,
						size: {height: placeholderNoteHeight}
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

async function getNodeText(node: CanvasNode) {
	const nodeData = node.getData()
	switch (nodeData.type) {
		case 'text':
			return nodeData.text
		case 'file':
			return readFile(nodeData.file)
	}
}

async function readFile(path: string) {
	const file = this.app.vault.getAbstractFileByPath(path)
	if (file instanceof TFile) {
		const body = await app.vault.read(file)
		return `## ${file.basename}\n${body}`
	}
}
const calcHeight = (options: { parentHeight: number, text: string }) => {
	const calcTextHeight = Math.round(textPaddingHeight + pxPerLine * options.text.length / (minWidth / pxPerChar))
	return Math.max(options.parentHeight, calcTextHeight)
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah! hot reload');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class ObsidianLilypadSettingTab extends PluginSettingTab {
	plugin: ObsidianLilypad;

	constructor(app: App, plugin: ObsidianLilypad) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Private Key')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your Ethereum Private Key')
				.setValue(this.plugin.settings.privateKey)
				.onChange(async (value) => {
					this.plugin.settings.privateKey = value;
					await this.plugin.saveSettings();
				}));
	}
}


class ExampleView extends ItemView {
	root: Root | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_EXAMPLE;
	}

	getDisplayText() {
		return "Example view";
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<StrictMode>
				<AppContext.Provider value={this.app}>
					<ReactView />,
				</AppContext.Provider>
			</StrictMode>,
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}
const minWidth = 360

/**
 * Assumed pixel width per character
 */
const pxPerChar = 5

/** 
 * Assumed pixel height per line
 */
const pxPerLine = 28

/**
 * Assumed height of top + bottom text area padding
 */
const textPaddingHeight = 12

/**
 * Color for assistant notes: 6 == purple
 */
const assistantColor = "6"

/**
 * Margin between new notes
 */
const newNoteMargin = 60

/** 
 * Min height of new notes
 */
const minHeight = 60

/**
 * Height to use for new empty note
 */
const emptyNoteHeight = 100

/**
 * Height to use for placeholder note
 */
const placeholderNoteHeight = 60

const randomHexString = (len: number) => {
	const t = []
	for (let n = 0; n < len; n++) {
		t.push((16 * Math.random() | 0).toString(16))
	}
	return t.join("")
}
const createNode = (
	canvas: Canvas,
	parentNode: CanvasNode,
	nodeOptions: CreateNodeOptions,
	nodeData?: Partial<AllCanvasNodeData>
) => {
	if (!canvas) {
		throw new Error('Invalid arguments')
	}

	const { text } = nodeOptions
	const width = nodeOptions?.size?.width || Math.max(minWidth, parentNode?.width)
	const height = nodeOptions?.size?.height
		|| Math.max(minHeight, (parentNode && calcHeight({ text, parentHeight: parentNode.height })))

	const siblings = parent && canvas.getEdgesForNode(parentNode)
		.filter(n => n.from.node.id == parentNode.id)
		.map(e => e.to.node)
	const siblingsRight = siblings && siblings.reduce((right, sib) => Math.max(right, sib.x + sib.width), 0)
	const priorSibling = siblings[siblings.length - 1]

	// Position left at right of prior sibling, otherwise aligned with parent
	const x = siblingsRight ? siblingsRight + newNoteMargin : parentNode.x

	// Position top at prior sibling top, otherwise offset below parent
	const y = (priorSibling
		? priorSibling.y
		: (parentNode.y + parentNode.height + newNoteMargin))
		// Using position=left, y value is treated as vertical center
		+ height * 0.5

	const newNode = canvas.createTextNode(
		{
			pos: { x, y },
			position: 'left',
			size: { height, width },
			text,
			focus: false
		}
	)

	if (nodeData) {
		newNode.setData(nodeData)
	}

	canvas.deselectAll()
	canvas.addNode(newNode)

	addEdge(canvas, randomHexString(16), {
		fromOrTo: "from",
		side: "bottom",
		node: parentNode,
	}, {
		fromOrTo: "to",
		side: "top",
		node: newNode,
	})

	return newNode
}