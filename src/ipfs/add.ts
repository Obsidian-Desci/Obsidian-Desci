import { NFTStorage, File } from 'nft.storage'
import mime from 'mime'
import fs from 'fs'
import path from 'path'


import { requestUrl } from 'obsidian'
import { CanvasNode } from 'src/utils/canvas-internal'
import {
    createNode,
    placeholderNoteHeight,
    assistantColor,
    getNodeText
} from '../utils/canvas-util'

export const add = async function () {
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
        let climb = true
        while (climb) {
            const siblings = canvas.getEdgesForNode(node)
            siblings.forEach((n:any) => {

            })
        }


        const settings = this.settings

        const nodeData = node.getData()
        let nodeText = await getNodeText(node) || ''
        if (nodeText.length == 0) {
            this.logDebug('no node Text found')
            return
        }

        const created = createNode(canvas, node,
            {
                text: `attempting to convert tree to dag`,
                size: { height: placeholderNoteHeight }
            },
            'text',
            {
                color: assistantColor,
                chat_role: 'assistant'
            }
        )

        try {
            const nftstorage = new NFTStorage({})
            /*
            const dag = {}
            const cid = await requestUrl({
                url: `http://localhost:3000/add`,
                method: 'POST',
                body: JSON.stringify({
                	
                })

            })
            const cid = await this.dagJsonInstance.add({
                text: nodeText
            })
            const cidNode = createNode(canvas, created,
                {
                    text: `added at ${cid.toString()}`,
                    size: { height: placeholderNoteHeight }
                },
                {
                    color: assistantColor,
                    chat_role: 'assistant'
                }
            )
            */
        } catch (e) {
            const cideNodeError = createNode(canvas, created,
                {
                    text: `error at ${e}`,
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
}