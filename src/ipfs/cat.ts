import { requestUrl, Vault } from 'obsidian'
import { CanvasNode } from 'src/utils/canvas-internal'
import * as fs from 'fs'
import {
    createNode,
    placeholderNoteHeight,
    assistantColor,
    getNodeText
} from '../utils/canvas-util'

import { CID } from 'multiformats/cid'

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
          console.log(`${this.settings.kuboRpc}/cat?arg=${nodeText.trim()}`)
            const res = await requestUrl({
                url: `${this.settings.kuboRpc}/cat?arg=${nodeText.trim()}`,
                method: 'POST',
                headers: {
                    "Content-Type": "text/plain",
                }
            })
            console.log('res', res.text)
            if (res.text.startsWith('�PNG')) {

                const buffer = Buffer.from(res.arrayBuffer);
                fs.writeFile(`${this.app.vault.adapter.basePath}/${nodeText}.png`, buffer, 'base64', (error) => {
                    if (error) {
                        console.error('Error saving image:', error);
                    } else {
                        const file = this.app.vault.getAbstractFileByPath(`${nodeText}.png`)
                        const cidNode = createNode(canvas, created,
                            {
                                file,
                                size: { height: placeholderNoteHeight }
                            },
                            {
                                color: assistantColor,
                                chat_role: 'assistant'
                            }
                        )
                    }
                });
            } else {
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
            }


        } catch (e) {
          console.log('e', e.message)
            const cideNodeError = createNode(canvas, created,
                {
                    text: `error at ${e.message}\n is your kubo node on at ${this.settings.kuboRpc}?, if this is a dag node try again with dagGet`,
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
