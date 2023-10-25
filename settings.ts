import type ObsidianDesci from './main'
import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface ChainConfig {
	name: string;
	rpcUrl: string;
	chainId: number;
}

export interface ObsidianDesciSettings {
	privateKey: string;
	chain: ChainConfig;
	useEngine: boolean;
	kuboRpc: string;
}

export const DEFAULT_SETTINGS: ObsidianDesciSettings = {
	privateKey: '',
	chain: {
		name: 'lilypad',
		rpcUrl: 'http://testnet.lilypadnetwork.org:8545',
		chainId: 1337
	},
	useEngine: false,
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
			.setName('Private Key')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your Ethereum Private Key')
				.setValue(this.plugin.settings.privateKey)
				.onChange(async (value) => {
					this.plugin.settings.privateKey = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Kubo Rpc Url')
			.setDesc('If you turn on a Kubo node we can use IPFS in obsidian')
			.addText(text => text
				.setPlaceholder('Enter your Kubo RPC endpoint')
				.setValue(this.plugin.settings.kuboRpc)
				.onChange(async (value) => {
					this.plugin.settings.kuboRpc = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Use Engine')
			.setDesc('If you have the Engine running on your computer you can gain enhanced functionality')
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.useEngine).onChange(async (value) => {
					this.plugin.settings.useEngine = value
					await this.plugin.saveSettings();
				})
			});
	}
}