import { App, Notice, PluginSettingTab, SecretComponent, Setting } from "obsidian";
import type BilingualTranslatePlugin from "../main";
import { type ApiProvider, PROVIDER_DEFAULTS } from "../settings";
import { translateLine } from "../apis/translate";

export class BilingualTranslateSettingTab extends PluginSettingTab {
    plugin: BilingualTranslatePlugin;

    constructor(app: App, plugin: BilingualTranslatePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        const provider = this.plugin.settings.apiProvider;
        const defaults = PROVIDER_DEFAULTS[provider];

        new Setting(containerEl)
            .setName("API provider")
            .setDesc("Select the translation API provider")
            .addDropdown((dropdown) =>
                dropdown
                    .addOptions({
                        openai: "OpenAI-compatible",
                        gemini: "Google Gemini",
                    })
                    .setValue(this.plugin.settings.apiProvider)
                    .onChange(async (value) => {
                        const newProvider = value as ApiProvider;
                        this.plugin.settings.apiProvider = newProvider;
                        const newDefaults = PROVIDER_DEFAULTS[newProvider];
                        this.plugin.settings.apiUrl = newDefaults.apiUrl;
                        this.plugin.settings.model = newDefaults.model;
                        await this.plugin.saveSettings();
                        this.display(); // refresh UI with new defaults
                    })
            );

        new Setting(containerEl)
            .setName("API URL")
            .setDesc("API endpoint")
            .addText((text) =>
                text
                    .setPlaceholder(defaults.apiUrl)
                    .setValue(this.plugin.settings.apiUrl)
                    .onChange(async (value) => {
                        this.plugin.settings.apiUrl = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("API key")
            .setDesc("Select a secret from SecretStorage")
            .addComponent((el) =>
                new SecretComponent(this.app, el)
                    .setValue(this.plugin.settings.apiKeySecretName)
                    .onChange((value) => {
                        this.plugin.settings.apiKeySecretName = value;
                        this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Model")
            .setDesc("Model name")
            .addText((text) =>
                text
                    .setPlaceholder(defaults.model)
                    .setValue(this.plugin.settings.model)
                    .onChange(async (value) => {
                        this.plugin.settings.model = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Test connection")
            .setDesc("Test the API connection with current settings")
            .addButton((button) =>
                button
                    .setButtonText("Test")
                    .onClick(async () => {
                        button.setButtonText("Testing...");
                        button.setDisabled(true);
                        try {
                            const result = await translateLine(
                                "Hello",
                                this.plugin.settings,
                                this.app
                            );
                            new Notice(`✅ Connection successful!\nResult: ${result}`);
                        } catch (error) {
                            new Notice(`❌ Connection failed: ${error.message}`);
                        } finally {
                            button.setButtonText("Test");
                            button.setDisabled(false);
                        }
                    })
            );

        new Setting(containerEl)
            .setName("Temperature")
            .setDesc("Controls randomness (0 = deterministic, 2 = very creative). Lower values (0.3) recommended for translation.")
            .addSlider((slider) =>
                slider
                    .setLimits(0, 2, 0.1)
                    .setValue(this.plugin.settings.temperature)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        this.plugin.settings.temperature = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Concurrency")
            .setDesc("Number of parallel translation requests. Higher = faster but may hit rate limits.")
            .addText((text) =>
                text
                    .setPlaceholder("3")
                    .setValue(String(this.plugin.settings.concurrency))
                    .onChange(async (value) => {
                        const num = parseInt(value, 10);
                        if (!isNaN(num) && num >= 1) {
                            this.plugin.settings.concurrency = num;
                            await this.plugin.saveSettings();
                        }
                    })
            );

        new Setting(containerEl)
            .setName("Source language")
            .setDesc("Language of original text (or auto-detect)")
            .addText((text) =>
                text
                    .setPlaceholder("auto")
                    .setValue(this.plugin.settings.sourceLanguage)
                    .onChange(async (value) => {
                        this.plugin.settings.sourceLanguage = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Target language")
            .setDesc("Language to translate to")
            .addText((text) =>
                text
                    .setPlaceholder("Chinese")
                    .setValue(this.plugin.settings.targetLanguage)
                    .onChange(async (value) => {
                        this.plugin.settings.targetLanguage = value;
                        await this.plugin.saveSettings();
                    })
            );
    }
}
