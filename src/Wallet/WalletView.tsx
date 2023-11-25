import { StrictMode, useEffect, useState } from "react";
import { App, Modal } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { AppContext } from "src/context/AppContext";
import { PluginContext } from "src/context/PluginContext";
import { useApp } from "src/hooks/useApp";
import { usePlugin } from "src/hooks/usePlugin";
import { WagmiConfig } from "wagmi";
import { useAccount as useWagmiAccount, useBalance as useWagmiBalance, useDisconnect as useWagmiDisconnect } from 'wagmi'
import { useInjected, useInjectedPublicClient, useInjectedWalletClient, useInjectedDisconnect, useInjectedBalance } from "./useInjected";
import { useWeb3Modal } from '@web3modal/wagmi/react'
import ObsidianDesci  from 'main'


export const useAccount = (isInjected: boolean) => {
	if (isInjected) {
		return useInjected()
	} else {
		return useWagmiAccount()
	}
}

export const useDisconnect = (isInjected: boolean) => {
	if (isInjected) {
		return useInjectedDisconnect()
	} else {
		return useWagmiDisconnect()
	}
}

export const useBalance = (isInjected: boolean, params: any) => {
	if (isInjected) {
		return useInjectedBalance(params)
	} else {
		return useWagmiBalance(params)
	}
}




export const NetworkParams = () => {
	const [isInjected, setIsInjected] = useState(false);
	const { address, isConnected } = useAccount(isInjected)
	const { open } = useWeb3Modal()
	const { disconnect } = useDisconnect(isInjected)
	const { data: balance, isError, isLoading:isBalanceLoading, refetch } = useBalance(isInjected, {address})
   
	return (<>
		<h4>Wallet</h4>
		{isInjected && <button onClick={() => setIsInjected(old => !old)}>Use Wallet Connect</button>}
		{!isInjected && <button onClick={() => setIsInjected(old => !old)}>Use Injected</button>}
		{isInjected ? (<>
			{isConnected ? (<>{address}</>) : (<>Not connected</>)}
			{isBalanceLoading ? (<p>Loading balance</p>): (<p>Balance: {balance?.formatted} {balance?.symbol}</p>)}
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
	plugin: ObsidianDesci
	wagmiConfig: any;
	constructor(plugin: ObsidianDesci, wagmiConfig: any ) {
		super(plugin.app);
		this.plugin = plugin
		console.log('plugin', plugin)
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
			<PluginContext.Provider value={this.plugin}>
				<WagmiConfig config={this.wagmiConfig}>
					<NetworkParams />
				</WagmiConfig>
			</PluginContext.Provider>,
		);
	}

	async onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}