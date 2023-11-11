import type ObsidianDesci from '../main'
import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import {ethers} from 'ethers'
interface ChainConfig {
	name: string;
	rpcUrl: string;
	chainId: number;
}

export interface ObsidianDesciSettings {
	privateKey: string;
	publicKey: string;
	chain: ChainConfig;
	kuboRpc: string;
}

export const DEFAULT_SETTINGS: ObsidianDesciSettings = {
	privateKey: '',
	publicKey: '',
	chain: {
		name: 'lilypad',
		rpcUrl: 'http://testnet.lilypadnetwork.org:8545',
		chainId: 1337
	},
	kuboRpc: 'http:/127.0.0.1:5001/api/v0'
}

export class ObsidianDesciSettingTab extends PluginSettingTab {
	plugin: ObsidianDesci;

	constructor(app: App, plugin: ObsidianDesci) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Private key')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your Ethereum Private Key')
				.setValue(this.plugin.settings.privateKey)
				.onChange(async (value) => {
					this.plugin.settings.privateKey = value;
					this.plugin.settings.publicKey = new ethers.Wallet(value).address,
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Kubo rpc url')
			.setDesc('If you turn on a Kubo node we can use IPFS in obsidian')
			.addText(text => text
				.setPlaceholder('Enter your Kubo RPC endpoint')
				.setValue(this.plugin.settings.kuboRpc)
				.onChange(async (value) => {
					this.plugin.settings.kuboRpc = value;
					await this.plugin.saveSettings();
				}));
	}
}