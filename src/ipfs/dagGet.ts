import { requestUrl } from 'obsidian'
import { CanvasNode } from 'src/utils/canvas-internal'
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
    const values: CanvasNode[] = Array.from(selection.values())
    const node: CanvasNode = values[0]
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
          console.log('nodeText', nodeText)
          console.log(`${this.settings.kuboRpc}/dag/get?arg=${nodeText}`)
            const res = await requestUrl({
                url: `${this.settings.kuboRpc}/dag/get?arg=${nodeText.trim()}`, 
                method: 'POST',
                headers: {
                    "Content-Type": "text/plain",
                },
                body: ''
            })
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
            console.log('ipfs fetch error: ', e, `\n is your kubo node on at ${this.settings.kuboRpc}`)
            created.setText(`error :( : ${e}`)
            return
        }
    }
}
