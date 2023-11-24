import { StrictMode, useEffect, useState } from "react";
import { App, Modal } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { AppContext } from "src/context/AppContext";
import { useApp } from "src/hooks/useApp";
import { WagmiConfig } from "wagmi";
import { useAccount, useBalance, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
export const NetworkParams = () => {
	const [pkImport, setPkImport] = useState(false);
	const { address, isConnected } = useAccount()
	const { open } = useWeb3Modal()
	const { disconnect } = useDisconnect()
	const { data: balance, isError, isLoading:isBalanceLoading, refetch } = useBalance({address})
   
	return (<>
		<h4>Wallet</h4>
		{pkImport && <button onClick={() => setPkImport(old => !old)}>Use Wallet Connect</button>}
		{!pkImport && <button onClick={() => setPkImport(old => !old)}>Use Injected</button>}
		{pkImport ? (<>
			
		</>) : (<>
			{isConnected ? (<>
				<div>Connected to {address}</div>
				<button onClick={() => disconnect()}>Disconnect</button>
				<button onClick={() => open({ view: 'Networks' })}>Open Network Modal</button>
			</>) : (<>
				<button onClick={() => open()}>Open Connect Modal</button>
			</>)}
			{ isBalanceLoading ? (<p>Loading balance</p>): (<p>Balance: {balance?.formatted} {balance?.symbol}</p>)}
			</>)
		}


	</>);
};

export class WalletModal extends Modal {
	root: Root | null = null;
	wagmiConfig: any;
	constructor(app: App, wagmiConfig: any ) {
		super(app);
		this.wagmiConfig = wagmiConfig
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
				</WagmiConfig>
			</AppContext.Provider>,
		);
	}

	async onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}