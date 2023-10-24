import { requestUrl} from 'obsidian'
import type ObsidianDecsiPlugin from '../main'
import {
    createNode,
    placeholderNoteHeight,
    assistantColor,
    getNodeText
 } from '../utils/canvas-util'




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
				console.log(res.json)
				const metadata = res.json['@graph'].filter((leaf:any) => {
					if (leaf['@id'] === './') {
						return true
					}
					if (leaf['@id'] === 'ro-crate-metadata.json') {
						return true
					}
					if (leaf['@type'] === 'person') {
						return true
					}
				})
				const metadataNode =createNode(canvas, created,
					{
						text: `${JSON.stringify(
							res.json['@graph'].find((leaf:any)=> {
								return leaf['@id'] === 'ro-crate-metadata.json'
							})
						)}`,
						size: { height: placeholderNoteHeight }
					},
					{
						color: assistantColor,
						chat_role: 'assistant'
					},	
					{x: -400, y:0}
				)
				const homeNode =createNode(canvas, created,
					{
						text: `${JSON.stringify(
							res.json['@graph'].find((leaf:any)=> {
								return leaf['@id'] === './'
							})
						)}`,
						size: { height: placeholderNoteHeight }
					},
					{
						color: assistantColor,
						chat_role: 'assistant'
					},	
				)
				const rootNode =createNode(canvas, created,
					{
						text: `${JSON.stringify(
							res.json['@graph'].find((leaf:any)=> {
								return leaf['@id'] === './root'
							})
						)}`,
						size: { height: placeholderNoteHeight }
					},
					{
						color: assistantColor,
						chat_role: 'assistant'
					},	
					{x: 400, y:0}
				)

				res.json['@graph'].filter((leaf:any) => {
					return leaf['@type'] === 'Person'
				}).forEach((leaf:any, i) => {
					const ipfsFetchNode = createNode(canvas, homeNode,
						{
							text: `${JSON.stringify(leaf)}`,
							size: { height: placeholderNoteHeight }
						},
						{
							color: assistantColor,
							chat_role: 'assistant'
						},
						{x: 0, y:-100}
					)
				})
				res.json['@graph'].filter((leaf:any) => {
					if (leaf['@id'] === './root') return false
					switch (leaf['@type']) {
						case 'CreativeWork':
							return true
						case 'Dataset':
							return true
						case 'WebSite':
							return true
						default:
							return false
					}
				}).forEach((leaf:any, i) => {
					const ipfsFetchNode = createNode(canvas, rootNode,
						{
							text: `${JSON.stringify(leaf)}`,
							size: { height: placeholderNoteHeight }
						},
						{
							color: assistantColor,
							chat_role: 'assistant'
						},
						{x: 0, y:-100}
					)
				})
					

			} catch (e) {
				created.setText(`error :( ${e}`)
				this.logDebug(`error :( : ${e}`)
				return
			}
		}
}