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
				const json = await requestUrl(`http://beta.dpid.org/${nodeText}?jsonld`)
				console.log('json: ', json)
				const ipfsFetchNode = createNode(canvas, created,
					{
						text: `${JSON.stringify(json)}`,
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