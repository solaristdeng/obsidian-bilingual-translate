export type ApiProvider = "openai" | "gemini";

export interface BilingualTranslateSettings {
	apiProvider: ApiProvider;
	apiUrl: string;
	apiKeySecretName: string;
	model: string;
	temperature: number;
	concurrency: number;
	sourceLanguage: string;
	targetLanguage: string;
}

export const DEFAULT_SETTINGS: BilingualTranslateSettings = {
	apiProvider: "openai",
	apiUrl: "https://api.openai.com/v1/chat/completions",
	apiKeySecretName: "",
	model: "gpt-4o-mini",
	temperature: 0.3,
	concurrency: 3,
	sourceLanguage: "auto",
	targetLanguage: "Chinese",
};

export const PROVIDER_DEFAULTS: Record<ApiProvider, { apiUrl: string; model: string }> = {
	openai: {
		apiUrl: "https://api.openai.com/v1/chat/completions",
		model: "gpt-4o-mini",
	},
	gemini: {
		apiUrl: "https://generativelanguage.googleapis.com/v1beta",
		model: "gemini-2.0-flash",
	},
};
