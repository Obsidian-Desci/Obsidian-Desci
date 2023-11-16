import { requestUrl } from 'obsidian'
import { CanvasNode } from 'src/utils/canvas-internal'
import {
    createNode,
    placeholderNoteHeight,
    assistantColor,
    getNodeText
} from '../utils/canvas-util'

import {ethers} from 'ethers'
export const runCowsay = async function () {
    if (this.unloaded) return

    this.logDebug("Running Cowsay")

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
                text: `Calling Lilpad Cowsay with ${nodeText}`,
                size: { height: placeholderNoteHeight }
            },
            'text',
            {
                color: assistantColor,
                chat_role: 'assistant'
            }
        )
        try {
            const tx = await this.exampleClient.runCowsay(
                nodeText, {
                value: ethers.parseUnits('2', 'ether')
            }
            )

            created.setText(`success! tx hash: ${tx.hash}, fetching ipfs.io cid`)

            const res = await this.exampleClient.fetchAllResults()
            const ipfsio = res[res.length - 1][2]
            const cid = res[res.length - 1][1]
            created.setText(`job complete see on ${ipfsio}`)
            const ipfsFetchNode = createNode(canvas, created,
                {
                    text: `${cid}`,
                    size: { height: placeholderNoteHeight }
                },
                'text',
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
