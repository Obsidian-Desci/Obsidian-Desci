
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

export const viewMolecule = async function () {
    if (this.unloaded) return

    const canvas = this.getActiveCanvas()
    if (!canvas) {
        this.logDebug('No active canvas')
        return
    }
    const selection = canvas.selection
    if (selection?.size > 2) return
    const values: CanvasNode[] = Array.from(selection.values())
    const node: CanvasNode = values[0]
    const node2: CanvasNode | null = values[1] ? values[1] : null
    if (node) {
        await canvas.requestSave()
        await sleep(200)

        const settings = this.settings

        const nodeData = node.getData()
        console.log('nodeData', nodeData)
        if (!node.file) {
            this.logDebug('no node Text found')
            return
        }

        const displayNode = createNode(canvas, node,
            {
                text: "loading model",
                size: {
                    width: 1000,
                    height: 1000
                }
            },
            {
                color: assistantColor,
                chat_role: 'assistant'
            }
        )


        try {
            import("3dmol/build/3Dmol.js").then(async ($3Dmol) => {

                await sleep(200)
                console.log('displayNode', displayNode)

                const path = `${this.app.vault.adapter.basePath}/${nodeData.file}`
                console.log('path', path)
                const el = displayNode.contentEl.createEl("div", {
                    cls: "molecule-viewer",
                })
                let config = { backgroundColor: 'rgb(30,30,30)' };
                let viewer = $3Dmol.createViewer(el, config);
                let m = viewer.addModel()

                const pdb = /pdb/
                const fileType = pdb.test(nodeData.file) ? 'pdb' : 'sdf'
                console.log('fileType', fileType)
                m.addMolData(
                    fs.readFileSync(`${this.app.vault.adapter.basePath}/${nodeData.file}`, 'utf-8'),
                    fileType
                )
                if (fileType === 'pdb') {
                    m.setStyle({ 'model': 0 }, { 'cartoon': { 'color': 'spectrum' } })
                } else {
                    m.setStyle({ 'model': 1 }, { 'stick': {} })
                }
                if (node2) {
                    const node2Data = node2.getData()
                    console.log('node2Data', node2Data)
                    const path2 = `${this.app.vault.adapter.basePath}/${node2Data.file}`
                    console.log('path2', path2)
                    const fileType2 = pdb.test(node2Data.file) ? 'pdb' : 'sdf'
                    m.addMolData(
                        fs.readFileSync(`${this.app.vault.adapter.basePath}/${node2Data.file}`, 'utf-8'),
                        fileType2
                    )
                    console.log(viewer, 'viewer')
                    console.log(m, 'm')
                    m.setStyle({ 'model': 1 }, { 'stick': {} })
                }

                viewer.zoomTo();
                viewer.render();
                viewer.zoom(0.8, 2000);
                displayNode.setText("")

            });

        } catch (e) {
            const cideNodeError = createNode(canvas, node,
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