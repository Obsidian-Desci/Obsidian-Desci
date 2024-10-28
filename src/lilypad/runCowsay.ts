import { parseEther } from 'viem'
import { requestUrl } from 'obsidian'
import { CanvasNode } from 'src/utils/canvas-internal'
import {
  createNode,
  placeholderNoteHeight,
  assistantColor,
  getNodeText
} from '../utils/canvas-util'

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

      const created = createNode(
        canvas,
        node,
        {
          text: `Calling Lilpad Cowsay with ${nodeText}`,
          size: { height: placeholderNoteHeight }
        },
        {
          color: assistantColor,
          chat_role: 'assistant'
        }
      )
      try {
        const approveHash = await this.lilypadToken.write.approve([
          '0x4a83270045FB4BCd1bdFe1bD6B00762A9D8bbF4E',
          parseEther('100'),
        ])

        const approveReceipt = await this.publicClient.waitForTransactionReceipt({
          hash: approveHash
        })
        console.log('approved')

        const unwatch = this.exampleClient.watchEvent.JobCompleted({}, {
          onLogs: (logs:any) => {
           console.log('logs', logs) 
          }
        })
        const logs  = await this.exampleClient.getEvents.JobCreated()
        console.log('logs', logs)
        const hash = await this.exampleClient.write.runCowsay([
          nodeText
        ])

        created.setText(`success! tx hash: ${hash}, waiting for receipt...`)
        const receipt = await this.publicClient.waitForTransactionReceipt({ hash })
        created.setText(`transaction confirmed, awaiting results... ` + receipt.logs[1].topics[1])

        console.log('receipt', receipt)
        /*
           const res = await this.exampleClient.getJobResult(receipt.log[0].data)
           const ipfsio = res[res.length - 1][2]
           const cid = res[res.length - 1][1]
           created.setText(`job complete see on ${ipfsio}`)
         */

      } catch (e) {
        created.setText(`error ${e}`)
        this.logDebug(`error:  ${e}`)
        return
      }
    }
}
