import { ItemView } from 'obsidian';
import { CanvasNode } from '../../utils/canvas-internal'
import {
    createNode,
    placeholderNoteHeight,
    assistantColor,
    getNodeText
} from '../../utils/canvas-util'
import { App } from 'obsidian'
import ObsidianDesci from '../../../main'
export const drawTextNode = async (
    {app, text}:
    {app: ObsidianDesci, text: string}
) => {

    app.logDebug("Running Cowsay")

    const canvas = app.getActiveCanvas()
    if (!canvas) {
        app.logDebug('No active canvas')
        return
    }
    if (!canvas) {
        return
    }
    const selection = canvas.selection
    if (selection?.size !== 1) return
    const values: CanvasNode[] = Array.from(selection.values())
    const node: CanvasNode = values[0]
    if (node) {
        console.log('node', node)
        await canvas.requestSave()
        await sleep(200)

        const nodeData = node.getData()
        let nodeText = await getNodeText(node) || ''
        if (nodeText.length == 0) {
            return
        }

        const created = createNode(canvas, node,
            {
                text: `${text}`,
                size: { height: placeholderNoteHeight }
            },
            'text',
            {
                color: assistantColor,
                chat_role: 'assistant'
            }
        )
    }
    
}