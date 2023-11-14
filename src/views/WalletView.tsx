import { StrictMode } from "react";
import { App, Modal } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import { AppContext } from "src/components/context/context";
import { useApp } from "src/components/hooks/useApp";
export const Wallet = () => {
	//const { vault } = useApp();
	//console.log('wallet vault', vault)
    return (<h4>Hello, React!</h4>);
  };

  const VIEW_TYPE_EXAMPLE = "example-view";

export class WalletModal extends Modal {
	root: Root | null = null;

	constructor(app: App) {
		super(app);
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
				<Wallet />,
			</AppContext.Provider>,
		);
	}

	async onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}