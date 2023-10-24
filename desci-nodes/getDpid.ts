import { requestUrl } from 'obsidian'
import { type CanvasNode } from '../utils/canvas-internal'
import type ObsidianDecsiPlugin from '../main'
import {
	createNode,
	placeholderNoteHeight,
	assistantColor,
	getNodeText
} from '../utils/canvas-util'
import { AllCanvasNodeData } from 'obsidian/canvas'




export const getDpid = async function () {
	console.log('this', this)
	if (this.unloaded) return
	this.logDebug("fetching dpid json from desci nodes")
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

		//const nodeData = node.getData()
		let nodeText = await getNodeText(node) || ''
		if (nodeText.length == 0) {
			console.log('no node text')
			this.logDebug('no node Text found')
			return
		}

		const created = createNode(canvas, node,
			{
				text: `fetching dpid:  ${nodeText}`,
				size: { height: placeholderNoteHeight }
			},
			{
				color: assistantColor,
				chat_role: 'assistant'
			}
		)
		try {
			const res = await requestUrl(`http://beta.dpid.org/${nodeText}?jsonld`)
			console.log('res.json', res.json)
			const metadataNode = createNode(canvas, created,
				{
					text: `${JSON.stringify(
						res.json['@graph'].find((leaf) => {
							return leaf['@id'] === 'ro-crate-metadata.json'
						})
					)}`,
					size: { height: placeholderNoteHeight }
				},
				{
					color: assistantColor,
					chat_role: 'assistant'
				},
				{ x: -400, y: 0 }
			)
			const rootNode = createNode(canvas, created,
				{
					text: `${JSON.stringify(
						res.json['@graph'].find((leaf) => {
							return leaf['@id'] === './root'
						})
					)}`,
					size: { height: placeholderNoteHeight }
				},
				{
					color: assistantColor,
					chat_role: 'assistant'
				},
				{ x: 400, y: 0 }
			)
			res.json['@graph'].forEach((leaf, i) => {
				if (leaf['@type'] === 'Person') {
					createNode(canvas, metadataNode,
						{
							text: `${JSON.stringify(leaf)}`,
							size: { height: placeholderNoteHeight }
						},
						{
							color: assistantColor,
							chat_role: 'assistant'
						},
						{ x: 0, y: -100 }
					)
				} else {
					if (leaf['@id'] === 'ro-crate-metadata.json' || leaf['@id'] === './root') {
					} else {
						createNode(canvas, rootNode,
							{
								text: `${JSON.stringify(leaf)}`,
								size: { height: placeholderNoteHeight }
							},
							{
								color: assistantColor,
								chat_role: 'assistant'
							},
							{ x: 0, y: -100 }
						)
					} 
				}
			})

		} catch (e) {
			created.setText(`error :( ${e}`)
			this.logDebug(`error :( : ${e}`)
			return
		}
	}
}