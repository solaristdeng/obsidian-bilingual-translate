import { Plugin } from "obsidian";
import { BilingualTranslateSettings, DEFAULT_SETTINGS } from "./settings";
import { BilingualTranslateSettingTab } from "./ui/SettingsTab";
import { translateFile } from "./commands/translateFile";

export default class BilingualTranslatePlugin extends Plugin {
    settings: BilingualTranslateSettings;

    async onload() {
        await this.loadSettings();

        this.addCommand({
            id: "translate-current-file",
            name: "Translate current file",
            editorCallback: (editor) => {
                translateFile(editor, this.settings);
            },
        });

        this.addSettingTab(new BilingualTranslateSettingTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
