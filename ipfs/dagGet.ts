import { requestUrl } from 'obsidian'

import {
    createNode,
    placeholderNoteHeight,
    assistantColor,
    getNodeText
} from '../utils/canvas-util'
export const dagGet = async function () {
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
            res.json.Links.forEach((link: any) => {
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