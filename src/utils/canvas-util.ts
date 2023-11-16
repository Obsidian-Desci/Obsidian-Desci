import { ItemView, TFile } from 'obsidian'
import { Canvas, CanvasNode, CreateNodeOptions } from './canvas-internal'
import { AllCanvasNodeData } from 'obsidian/canvas'

interface CanvasEdge {
	fromOrTo: string
	side: string,
	node: CanvasElement,
}

interface CanvasElement {
	id: string
}

export type CanvasView = ItemView & { 
	canvas: Canvas
}

const calcHeight = (options: { parentHeight: number, text: string }) => {
	const calcTextHeight = Math.round(textPaddingHeight + pxPerLine * options.text.length / (minWidth / pxPerChar))
	return Math.max(options.parentHeight, calcTextHeight)
}
/**
 * Add edge entry to canvas.
 */
export const addEdge = (canvas: Canvas, edgeID: string, fromEdge: CanvasEdge, toEdge: CanvasEdge) => {
	if (!canvas) return

	const data = canvas.getData()

	if (!data) return

	canvas.importData({
		"edges": [
			...data.edges,
			{ "id": edgeID, "fromNode": fromEdge.node.id, "fromSide": fromEdge.side, "toNode": toEdge.node.id, "toSide": toEdge.side }
		],
		"nodes": data.nodes,
	})

	canvas.requestFrame()
}

/**
 * Trap exception and write to console.error.
 */
export function trapError<T>(fn: (...params: unknown[]) => T) {
	return (...params: unknown[]) => {
		try {
			return fn(...params)
		} catch (e) {
			console.error(e)
		}
	}
}



export const minWidth = 360

/**
 * Assumed pixel width per character
 */
export const pxPerChar = 5

/** 
 * Assumed pixel height per line
 */
export const pxPerLine = 28

/**
 * Assumed height of top + bottom text area padding
 */
export const textPaddingHeight = 12

/**
 * Color for assistant notes: 6 == purple
 */
export const assistantColor = "6"

/**
 * Margin between new notes
 */
export const newNoteMargin = 60

/** 
 * Min height of new notes
 */
export const minHeight = 60

/**
 * Height to use for new empty note
 */
export const emptyNoteHeight = 100

/**
 * Height to use for placeholder note
 */
export const placeholderNoteHeight = 60

export const randomHexString = (len: number) => {
	const t = []
	for (let n = 0; n < len; n++) {
		t.push((16 * Math.random() | 0).toString(16))
	}
	return t.join("")
}
export const createNode = (
	canvas: Canvas,
	parentNode: CanvasNode,
	nodeOptions: CreateNodeOptions,
	nodeType: 'file' | 'text' | 'link' | 'group' | 'react',
	nodeData?: Partial<AllCanvasNodeData>,
	offset?: {x: number, y: number}
) => {

	offset = offset ? offset : {x:0, y:0}
	if (!canvas) {
		throw new Error('Invalid arguments')
	}

	const width = nodeOptions?.size?.width || Math.max(minWidth, parentNode?.width)
	const height = nodeOptions?.size?.height
		|| Math.max(minHeight, (parentNode && calcHeight({ text, parentHeight: parentNode.height })))

	const siblings = parent && canvas.getEdgesForNode(parentNode)
		.filter(n => n.from.node.id == parentNode.id)
		.map(e => e.to.node)
	const siblingsRight = siblings && siblings.reduce((right, sib) => Math.max(right, sib.x + sib.width), 0)
	const priorSibling = siblings[siblings.length - 1]

	// Position left at right of prior sibling, otherwise aligned with parent
	const x = siblingsRight ? siblingsRight + newNoteMargin : parentNode.x + offset.x

	// Position top at prior sibling top, otherwise offset below parent
	const y = (priorSibling
		? priorSibling.y
		: (parentNode.y + parentNode.height + newNoteMargin))
		// Using position=left, y value is treated as vertical center
		+ height * 0.5 - offset.y

	let newNode: CanvasNode;

	switch (nodeType) {
		case 'link':
			break;
		case 'group':
			break;
		case 'file':
			newNode = canvas.createFileNode(
				{
					pos: { x, y },
					position: 'left',
					size: { height, width },
					file: nodeOptions.file,
					//nodeOptions.subpath,
					focus: false
				}
			)
			newNode.setData(nodeData)
			break;
		case 'text':
			const text = nodeOptions.text
			newNode = canvas.createTextNode(
				{
					pos: { x, y },
					position: 'left',
					size: { height, width },
					text,
					focus: false
				}
			)
			newNode.setData(nodeData)
			break;

		case 'react':
			newNode = canvas.createTextNode(
				{
					pos: { x, y },
					position: 'left',
					size: { height, width },
					focus: false
				}
			)
			const root = createRoot(newNode.containerEl)
			root.render(nodeOptions.component)
			
			newNode.setData(nodeData)
			break;
		default:
			break
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

async function readFile(path: string) {
	const file = this.app.vault.getAbstractFileByPath(path)
	if (file instanceof TFile) {
		const body = await app.vault.read(file)
		return `## ${file.basename}\n${body}`
	}
}
export async function getNodeText(node: CanvasNode) {
	const nodeData = node.getData()
	switch (nodeData.type) {
		case 'text':
			return nodeData.text
		case 'file':
			return readFile(nodeData.file)
	}
}
