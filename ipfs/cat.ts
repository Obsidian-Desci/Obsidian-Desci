import { requestUrl } from 'obsidian'

import {
    createNode,
    placeholderNoteHeight,
    assistantColor,
    getNodeText
} from '../utils/canvas-util'


export const cat = async function () {

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