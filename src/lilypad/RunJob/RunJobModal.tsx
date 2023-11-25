import React from 'react'
import ObsidianDesci from 'main'
import { App, Modal } from "obsidian";
import { CanvasNode } from '../../utils/canvas-internal'
import {
    createNode,
    placeholderNoteHeight,
    assistantColor,
    getNodeText
} from '../../utils/canvas-util'

import { createRoot } from "react-dom/client";
import { 
    WagmiConfig
} from 'wagmi'
import { AppContext } from '../../context/AppContext'
import { PluginContext } from '../../context/PluginContext'
import { NetworkParams, WalletModal } from '../../Wallet/WalletView';
import { RunJobForm } from './RunJobForm'

const drawResult = (app:App, result: any) => {
    
}
export class RunJobModal extends WalletModal {

	plugin: ObsidianDesci
	constructor(plugin: ObsidianDesci, wagmiConfig: any ) {
		super(plugin.app, wagmiConfig);
		this.plugin = plugin
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
			<PluginContext.Provider value={this.plugin}>
				<AppContext.Provider value={this.app}>
				<WagmiConfig config={this.wagmiConfig}>
                    <NetworkParams />
                    <RunJobForm
                        handleCloseModal={() => this.close()} />
				</WagmiConfig>
			</AppContext.Provider>
			</PluginContext.Provider>
		);
	}

	async onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}