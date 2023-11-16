
import { requestUrl } from 'obsidian'
import { CanvasNode } from 'src/utils/canvas-internal'
import {
    createNode,
    placeholderNoteHeight,
    assistantColor,
    getNodeText
} from '../utils/canvas-util'
import { HyperCertsCanvasNodeView } from './HypercertsCanvasNodeView'
import {ethers} from 'ethers'
import { createRoot } from 'react-dom/client';

export const createHypercertNode = async function () {
    if (this.unloaded) return

    this.logDebug("creating Hypercert")

    const canvas = this.getActiveCanvas()
    console.log('canvas', canvas)
    if (!canvas) {
        this.logDebug('No active canvas')
        return
    }
        await canvas.requestSave()
        await sleep(200)
        const reactNode = canvas.createTextNode({
            pos: canvas.pointer,
            position: 'left',
            size: { height: 250, width: 250},
            focus: true
        })
        const root = createRoot(reactNode.containerEl)
        root.render(<HyperCertsCanvasNodeView />)  
        canvas.addNode(
           reactNode 
        )

        try {
        } catch (e) {
            this.logDebug(`error :( : ${e}`)
            return
        }
}
