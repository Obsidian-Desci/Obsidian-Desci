import { requestUrl, Vault } from 'obsidian';
import { CanvasNode } from 'src/utils/canvas-internal';

import * as fs from 'fs'
import {
    createNode,
    placeholderNoteHeight,
    assistantColor,
    getNodeText
} from '../utils/canvas-util'

import { CID } from 'multiformats/cid'

export const getProtein = async function () {
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
                text: `attempting to fetch ${nodeText}`,
                size: { height: placeholderNoteHeight }
            },
            {
                color: assistantColor,
                chat_role: 'assistant'
            }
        )
        const displayNode = createNode(canvas, created,
            {
                text: "test",
                size: { height: placeholderNoteHeight*3 }
            },
            {
                color: assistantColor,
                chat_role: 'assistant'
            }
        )
        displayNode.setText("")


        try {
            const res = await requestUrl({
                url: nodeText,
                method: 'GET',
                headers: {
                    //"Content-Type": "text/plain",
                }
            })
            console.log('res', res.arrayBuffer)
            const regex = /\/([^/]+)$/;
            const matches = nodeText.match(regex);
            const filename = matches ? matches[1] : "";
            const buffer = Buffer.from(res.arrayBuffer);
            fs.writeFile(`${this.app.vault.adapter.basePath}/${filename}`, buffer, 'base64', (error) => {
                if (error) {
                    console.error('Error saving image:', error);
                } else {
                    const file = this.app.vault.getAbstractFileByPath(`${filename}`)
                    import("3dmol/build/3Dmol.js").then(async ($3Dmol) => {

                        console.log('displayNode', displayNode)
                        const el = displayNode.containerEl
                        console.log($3Dmol);
                        console.log('el', el)
                        console.log('canvas', canvas)
                        await sleep(200)
                        let config = { backgroundColor: 'rgb(30,30,30)' };
                        let viewer = $3Dmol.createViewer(el, config);
                        let m = viewer.addModel()
                        m.addMolData(fs.readFileSync(`${this.app.vault.adapter.basePath}/${filename}`, 'utf-8'), 'pdb')

                        viewer.zoomTo();
                        viewer.render();
                        console.log('viewer', viewer)
                        viewer.zoom(0.8, 2000);
                    });
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


        } catch (e) {
            const cideNodeError = createNode(canvas, created,
                {
                    text: `error: ${e}`,
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