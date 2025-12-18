// Kiss Translator Plugin Settings

export interface KissTranslatorSettings {
	// API Configuration
	apiUrl: string;
	apiKey: string;
	model: string;
	
	// Translation Settings
	fromLang: string;
	toLang: string;
	
	// Advanced
	temperature: number;
	maxTokens: number;
	systemPrompt: string;
}

export const DEFAULT_SETTINGS: KissTranslatorSettings = {
	apiUrl: 'https://api.openai.com/v1/chat/completions',
	apiKey: '',
	model: 'gpt-4o-mini',
	fromLang: 'auto',
	toLang: 'zh-CN',
	temperature: 0.3,
	maxTokens: 4096,
	systemPrompt: `You are a professional translator. Translate the following text to {{toLang}}.
Keep the original formatting, including markdown syntax.
Only output the translation, no explanations.`
};

// Language options
export const LANGUAGES = [
	['auto', 'Auto-detect'],
	['en', 'English'],
	['zh-CN', 'Simplified Chinese - 简体中文'],
	['zh-TW', 'Traditional Chinese - 繁體中文'],
	['ja', 'Japanese - 日本語'],
	['ko', 'Korean - 한국어'],
	['fr', 'French - Français'],
	['de', 'German - Deutsch'],
	['es', 'Spanish - Español'],
	['it', 'Italian - Italiano'],
	['pt', 'Portuguese - Português'],
	['ru', 'Russian - Русский'],
	['ar', 'Arabic - العربية'],
	['hi', 'Hindi - हिन्दी'],
	['th', 'Thai - ไทย'],
	['vi', 'Vietnamese - Tiếng Việt'],
] as const;

export const LANGUAGE_NAMES: Record<string, string> = {
	'auto': 'the target language',
	'en': 'English',
	'zh-CN': 'Simplified Chinese',
	'zh-TW': 'Traditional Chinese',
	'ja': 'Japanese',
	'ko': 'Korean',
	'fr': 'French',
	'de': 'German',
	'es': 'Spanish',
	'it': 'Italian',
	'pt': 'Portuguese',
	'ru': 'Russian',
	'ar': 'Arabic',
	'hi': 'Hindi',
	'th': 'Thai',
	'vi': 'Vietnamese',
};
