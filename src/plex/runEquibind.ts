import { requestUrl, Vault } from 'obsidian'
import { CanvasNode } from 'src/utils/canvas-internal'
import * as fs from 'fs'
import * as $3Dmol from '3dmol/build/3Dmol.js';

import {
    createNode,
    addEdge,
    placeholderNoteHeight,
    assistantColor,
    getNodeText,
    randomHexString
} from '../utils/canvas-util'
import { exec } from 'child_process'
import { CID } from 'multiformats/cid'

export const runEquibind = async function () {
    if (this.unloaded) return

    const canvas = this.getActiveCanvas()
    if (!canvas) {
        this.logDebug('No active canvas')
        return
    }
    const selection = canvas.selection
    if (selection?.size !== 2) return
    const values: CanvasNode[] = Array.from(selection.values())
    const node: CanvasNode = values[0]
    const node2: CanvasNode = values[1]
    console.log('values', values)
    if (node && node2) {
        await canvas.requestSave()
        await sleep(200)

        const settings = this.settings

        if (!node2.filePath && !node2.filePath) {
            this.logDebug('no files on path')
            return
        }
        let proteinPath: string | undefined;
        let moleculePath: string | undefined;
        let pdb = /pdb/
        let sdf = /sdf/
        if (pdb.test(node.filePath)) {
            proteinPath = node.filePath;
        } else if (pdb.test(node2.filePath)) {
            proteinPath = node2.filePath;
        }

        if (sdf.test(node.filePath)) {
            moleculePath = node.filePath;
        } else if (sdf.test(node2.filePath)) {
            moleculePath = node2.filePath;
        }
        console.log('moleculePath', moleculePath)
        console.log('proteinPath', proteinPath)
        

        const created = createNode(canvas, node,
            {
                text: `attempting equibind on ${moleculePath} and ${proteinPath}`,
                size: { height: placeholderNoteHeight }
            },
            {
                color: assistantColor,
                chat_role: 'assistant'
            }
        )
        addEdge(canvas, randomHexString(16), {
                fromOrTo: "from",
                side: "bottom",
                node: node2,
            }, {
                fromOrTo: "to",
                side: "top",
                node: created,
        })

        try {
            const command = `${this.app.vault.adapter.basePath}/${this.app.vault.configDir}/plugins/obsidian-desci/src/plex/equibind.py`
            const equibind = exec(`python3 ${command} ${this.app.vault.adapter.basePath} ${proteinPath} ${moleculePath} ${this.settings.publicKey}`)
            equibind.stdout?.on('data', (data) => {
               console.log('stdout:data:', data)
               const outputDirRegex = /Created working directory: (.*)\n/;
               const outputFileRegex = /[^\/]+(?=\/$|$)/
               const outputDir = data.match(outputDirRegex)[1]
               const outputFile = outputDir.match(outputFileRegex)[0]
               console.log('outputfile', outputFile)
           
               const cidRegex = /Completed IO JSON CID: (.*)\n/;
               const cid = data.match(cidRegex)[1]

                const cideNode = createNode(canvas, created,
                    {
                        text: `${cid}`,
                        size: { height: placeholderNoteHeight }
                    },
                    {
                        color: assistantColor,
                        chat_role: 'assistant'
                    }
                )
                const outputFileNode = createNode(canvas, created,
                    {
                        text: `Output folder at: ${outputFile}`,
                        size: { height: placeholderNoteHeight }
                    },
                    {
                        color: assistantColor,
                        chat_role: 'assistant'

                    },
                    { x:-400, y:0}
                )

            })
            equibind.stderr?.on('data', (data) => {
                console.log('stderr:data:', data)
            })
            equibind.on('close', (code) => {
               console.log('equibind exited with code:', code) 
            })
            /*
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
            */

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