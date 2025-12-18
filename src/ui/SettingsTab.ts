// Settings Tab UI for Kiss Translator
import { App, PluginSettingTab, Setting } from 'obsidian';
import type KissTranslatorPlugin from '../main';
import { LANGUAGES, DEFAULT_SETTINGS } from '../settings';
import { testConnection } from '../apis/openai';

export class KissTranslatorSettingTab extends PluginSettingTab {
    plugin: KissTranslatorPlugin;

    constructor(app: App, plugin: KissTranslatorPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h1', { text: 'Kiss Translator Settings' });

        // API Configuration Section
        containerEl.createEl('h2', { text: 'API Configuration' });

        new Setting(containerEl)
            .setName('API URL')
            .setDesc('OpenAI-compatible API endpoint (e.g., OpenAI, Ollama, OpenRouter)')
            .addText(text => text
                .setPlaceholder('https://api.openai.com/v1/chat/completions')
                .setValue(this.plugin.settings.apiUrl)
                .onChange(async (value) => {
                    this.plugin.settings.apiUrl = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('API Key')
            .setDesc('Your API key (stored locally)')
            .addText(text => {
                text
                    .setPlaceholder('sk-...')
                    .setValue(this.plugin.settings.apiKey)
                    .onChange(async (value) => {
                        this.plugin.settings.apiKey = value;
                        await this.plugin.saveSettings();
                    });
                text.inputEl.type = 'password';
            });

        new Setting(containerEl)
            .setName('Model')
            .setDesc('Model name to use for translation')
            .addText(text => text
                .setPlaceholder('gpt-4o-mini')
                .setValue(this.plugin.settings.model)
                .onChange(async (value) => {
                    this.plugin.settings.model = value;
                    await this.plugin.saveSettings();
                }));

        // Test connection button
        new Setting(containerEl)
            .setName('Test Connection')
            .setDesc('Test the API connection with current settings')
            .addButton(button => button
                .setButtonText('Test')
                .onClick(async () => {
                    button.setButtonText('Testing...');
                    button.setDisabled(true);

                    const result = await testConnection(this.plugin.settings);

                    if (result.success) {
                        button.setButtonText('✓ Success!');
                        setTimeout(() => {
                            button.setButtonText('Test');
                            button.setDisabled(false);
                        }, 2000);
                    } else {
                        button.setButtonText('✗ Failed');
                        console.error('Connection test failed:', result.error);
                        setTimeout(() => {
                            button.setButtonText('Test');
                            button.setDisabled(false);
                        }, 2000);
                    }
                }));

        // Translation Settings Section
        containerEl.createEl('h2', { text: 'Translation Settings' });

        new Setting(containerEl)
            .setName('Source Language')
            .setDesc('Language of the original text')
            .addDropdown(dropdown => {
                for (const [code, name] of LANGUAGES) {
                    dropdown.addOption(code, name);
                }
                dropdown.setValue(this.plugin.settings.fromLang);
                dropdown.onChange(async (value) => {
                    this.plugin.settings.fromLang = value;
                    await this.plugin.saveSettings();
                });
            });

        new Setting(containerEl)
            .setName('Target Language')
            .setDesc('Language to translate to')
            .addDropdown(dropdown => {
                for (const [code, name] of LANGUAGES) {
                    if (code !== 'auto') {
                        dropdown.addOption(code, name);
                    }
                }
                dropdown.setValue(this.plugin.settings.toLang);
                dropdown.onChange(async (value) => {
                    this.plugin.settings.toLang = value;
                    await this.plugin.saveSettings();
                });
            });

        // Advanced Settings Section
        containerEl.createEl('h2', { text: 'Advanced Settings' });

        new Setting(containerEl)
            .setName('Temperature')
            .setDesc('Controls randomness (0 = deterministic, 1 = creative)')
            .addSlider(slider => slider
                .setLimits(0, 1, 0.1)
                .setValue(this.plugin.settings.temperature)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.temperature = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Max Tokens')
            .setDesc('Maximum tokens for API response')
            .addText(text => text
                .setPlaceholder('4096')
                .setValue(String(this.plugin.settings.maxTokens))
                .onChange(async (value) => {
                    const num = parseInt(value);
                    if (!isNaN(num) && num > 0) {
                        this.plugin.settings.maxTokens = num;
                        await this.plugin.saveSettings();
                    }
                }));

        new Setting(containerEl)
            .setName('System Prompt')
            .setDesc('Custom system prompt for translation. Use {{toLang}} and {{fromLang}} as placeholders.')
            .addTextArea(text => {
                text
                    .setPlaceholder(DEFAULT_SETTINGS.systemPrompt)
                    .setValue(this.plugin.settings.systemPrompt)
                    .onChange(async (value) => {
                        this.plugin.settings.systemPrompt = value;
                        await this.plugin.saveSettings();
                    });
                text.inputEl.rows = 6;
                text.inputEl.cols = 50;
            });

        // Reset button
        new Setting(containerEl)
            .setName('Reset to Defaults')
            .setDesc('Reset all settings to their default values')
            .addButton(button => button
                .setButtonText('Reset')
                .setWarning()
                .onClick(async () => {
                    this.plugin.settings = { ...DEFAULT_SETTINGS };
                    await this.plugin.saveSettings();
                    this.display(); // Refresh the settings page
                }));

        // Usage hint
        containerEl.createEl('h2', { text: 'Usage' });
        const usageDiv = containerEl.createDiv();
        usageDiv.createEl('p', {
            text: 'Use the command "Kiss Translator: Translate current file" or set a hotkey to translate the active note.'
        });
        usageDiv.createEl('p', {
            text: 'The translation will be inserted below each line in the original document.'
        });
    }
}
