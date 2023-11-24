import { requestUrl } from 'obsidian'
import { App, Modal } from "obsidian";
import { CanvasNode } from 'src/utils/canvas-internal'
import {
    createNode,
    placeholderNoteHeight,
    assistantColor,
    getNodeText
} from '../utils/canvas-util'

import { useState, useCallback, useEffect } from 'react'
import { Root, createRoot } from "react-dom/client";
import { getContract, parseEther, zeroAddress } from 'viem'
import { 
    useAccount,
    usePublicClient,
    useWalletClient,
    WagmiConfig
} from 'wagmi'
import { useForm, Resolver, FieldErrors } from "react-hook-form"
import { AppContext } from 'src/context/AppContext'
import { useApp } from 'src/hooks/useApp'
import { NetworkParams, WalletModal } from 'src/Wallet/WalletView';
import { RunJobForm } from './RunJob/RunJobForm'
import {address as clientAddress, abi as clientAbi} from 'artifacts/LilypadClient.json'
const drawResult = (app:App, result: any) => {
    
}
export class RunJobModal extends WalletModal {
	constructor(app: App, wagmiConfig: any ) {
		super(app, wagmiConfig);
	}
	/*	
	getViewType() {
		return VIEW_TYPE_EXAMPLE;
	}

	getDisplayText() {
		return "Wallet View";
	}
*/

	async onOpen() {
		let { contentEl } = this;
		//contentEl.setText("Look at me, I'm a modal! 👀");
		this.root = createRoot(contentEl);
		this.root.render(
			<AppContext.Provider value={this.app}>
				<WagmiConfig config={this.wagmiConfig}>
                    <NetworkParams />
                    <RunJobForm handleCloseModal={() => this.close()} />
				</WagmiConfig>
			</AppContext.Provider>,
		);
	}

	async onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
/*
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
*/
