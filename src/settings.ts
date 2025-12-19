export interface BilingualTranslateSettings {
	apiUrl: string;
	apiKey: string;
	model: string;
	sourceLanguage: string;
	targetLanguage: string;
}

export const DEFAULT_SETTINGS: BilingualTranslateSettings = {
	apiUrl: "https://api.openai.com/v1/chat/completions",
	apiKey: "",
	model: "gpt-4o-mini",
	sourceLanguage: "auto",
	targetLanguage: "Chinese",
};
