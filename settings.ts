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
	delegateKubo: boolean;
}

export const DEFAULT_SETTINGS: ObsidianDesciSettings = {
	privateKey: '',
	chain: {
		name: 'lilypad',
		rpcUrl: 'http://testnet.lilypadnetwork.org:8545',
		chainId: 1337
	},
	delegateKubo: false
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
			.setName('delegate with kubo')
			.setDesc('if you have a ipfs daemon running in another cli, you can speed up ipfs fetch with this')
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.delegateKubo).onChange(async (value) => {
					this.plugin.settings.delegateKubo = value
					await this.plugin.saveSettings();
					console.log('kubo is: ', this.plugin.settings.delegateKubo)
				})
			});
	}
}