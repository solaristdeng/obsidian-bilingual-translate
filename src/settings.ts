export interface BilingualTranslateSettings {
	apiUrl: string;
	apiKey: string;
	model: string;
	temperature: number;
	concurrency: number;
	sourceLanguage: string;
	targetLanguage: string;
}

export const DEFAULT_SETTINGS: BilingualTranslateSettings = {
	apiUrl: "https://api.openai.com/v1/chat/completions",
	apiKey: "",
	model: "gpt-4o-mini",
	temperature: 0.3,
	concurrency: 3,
	sourceLanguage: "auto",
	targetLanguage: "Chinese",
};
