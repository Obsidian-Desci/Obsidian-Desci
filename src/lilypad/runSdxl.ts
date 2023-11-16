import {
    createNode,
    placeholderNoteHeight,
    assistantColor,
    getNodeText
} from '../utils/canvas-util'
import { CanvasNode } from 'src/utils/canvas-internal'
import { ethers } from 'ethers'
export const runSdxl = async function () {
    if (this.unloaded) return

    this.logDebug("Running sdxl")

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

        //const nodeData = node.getData()
        let nodeText = await getNodeText(node) || ''
        if (nodeText.length == 0) {
            this.logDebug('no node Text found')
            return
        }

        const created = createNode(canvas, node,
            {
                text: `Calling Lilpad sdxl with ${nodeText}`,
                size: { height: placeholderNoteHeight }
            },
            'text',
            {
                color: assistantColor,
                chat_role: 'assistant'
            }
        )
        try {
            const tx = await this.exampleClient.runSDXL(
                nodeText, {
                value: ethers.parseUnits('4', 'ether')
            }
            )
            const receipt = await tx.wait()

            created.setText(`success! tx hash: ${tx.hash}, listening for job completion`)
            this.exampleClient.on("ReceivedJobResults", (jobId:string, cid:string) => {
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

            })
            /*
            */
        } catch (e) {
            created.setText(`error :( ${e}`)
            this.logDebug(`error :( : ${e}`)
            return
        }
    }
}