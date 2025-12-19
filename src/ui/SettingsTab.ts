import { App, PluginSettingTab, Setting } from "obsidian";
import type BilingualTranslatePlugin from "../main";

export class BilingualTranslateSettingTab extends PluginSettingTab {
    plugin: BilingualTranslatePlugin;

    constructor(app: App, plugin: BilingualTranslatePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("API url")
            .setDesc("OpenAI-compatible API endpoint")
            .addText((text) =>
                text
                    .setPlaceholder("https://api.openai.com/v1/chat/completions")
                    .setValue(this.plugin.settings.apiUrl)
                    .onChange(async (value) => {
                        this.plugin.settings.apiUrl = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("API key")
            .setDesc("Your API key")
            .addText((text) =>
                text
                    .setPlaceholder("sk-...")
                    .setValue(this.plugin.settings.apiKey)
                    .onChange(async (value) => {
                        this.plugin.settings.apiKey = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Model")
            .setDesc("Model name (e.g., gpt-4o-mini, llama3.1)")
            .addText((text) =>
                text
                    .setPlaceholder("gpt-4o-mini")
                    .setValue(this.plugin.settings.model)
                    .onChange(async (value) => {
                        this.plugin.settings.model = value;
                        await this.plugin.saveSettings();
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
