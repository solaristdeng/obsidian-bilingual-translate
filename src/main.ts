import { Plugin } from 'obsidian';
import { KissTranslatorSettings, DEFAULT_SETTINGS } from './settings';
import { KissTranslatorSettingTab } from './ui/SettingsTab';
import { translateCurrentFile } from './commands/translateFile';

export default class KissTranslatorPlugin extends Plugin {
    settings: KissTranslatorSettings;

    async onload() {
        await this.loadSettings();

        // Add translate command
        this.addCommand({
            id: 'translate-current-file',
            name: 'Translate current file',
            callback: () => translateCurrentFile(this)
        });

        // Add settings tab
        this.addSettingTab(new KissTranslatorSettingTab(this.app, this));

        console.log('Kiss Translator plugin loaded');
    }

    onunload() {
        console.log('Kiss Translator plugin unloaded');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
