import { requestUrl } from 'obsidian'

import {
    createNode,
    placeholderNoteHeight,
    assistantColor,
    getNodeText
} from '../utils/canvas-util'

export const kuboFetch = async function () {

    if (this.unloaded) return

    this.logDebug("attempting to fetch from kubo node")

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
            const res = await requestUrl({
                url: `http://localhost:3000/gateway?cid=${nodeText}`,
                method: 'POST'
            })
            console.log('res', res)
            function _arrayBufferToBase64(buffer) {
                var binary = '';
                var bytes = new Uint8Array(buffer);
                var len = bytes.byteLength;
                for (var i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                return window.btoa(binary);
            }
            const cidNode = createNode(canvas, created,
                {
                    text: `<img src="data:image/png;base64,${_arrayBufferToBase64(res.arrayBuffer)}" />`,
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