// OpenAI-compatible API for translation
import { requestUrl, RequestUrlParam } from 'obsidian';
import { KissTranslatorSettings, LANGUAGE_NAMES } from '../settings';

export interface TranslationResult {
    success: boolean;
    translation?: string;
    error?: string;
}

interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface OpenAIResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
    error?: {
        message: string;
    };
}

/**
 * Translate text using OpenAI-compatible API
 */
export async function translateText(
    text: string,
    settings: KissTranslatorSettings
): Promise<TranslationResult> {
    if (!text.trim()) {
        return { success: false, error: 'Empty text' };
    }

    if (!settings.apiKey) {
        return { success: false, error: 'API key not configured. Please set your API key in plugin settings.' };
    }

    const toLangName = LANGUAGE_NAMES[settings.toLang] || settings.toLang;
    const fromLangName = settings.fromLang === 'auto'
        ? 'the source language (auto-detect)'
        : (LANGUAGE_NAMES[settings.fromLang] || settings.fromLang);

    const systemPrompt = settings.systemPrompt
        .replace(/\{\{toLang\}\}/g, toLangName)
        .replace(/\{\{fromLang\}\}/g, fromLangName);

    const messages: OpenAIMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
    ];

    const requestBody = {
        model: settings.model,
        messages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
    };

    const requestParams: RequestUrlParam = {
        url: settings.apiUrl,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify(requestBody),
    };

    try {
        const response = await requestUrl(requestParams);
        const data = response.json as OpenAIResponse;

        if (data.error) {
            return { success: false, error: data.error.message };
        }

        if (data.choices && data.choices.length > 0) {
            const translation = data.choices[0].message.content.trim();
            return { success: true, translation };
        }

        return { success: false, error: 'No translation received from API' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `API request failed: ${errorMessage}` };
    }
}

/**
 * Translate text line by line, preserving structure
 * Returns bilingual format: original line followed by translated line
 */
export async function translateLines(
    lines: string[],
    settings: KissTranslatorSettings,
    onProgress?: (current: number, total: number) => void
): Promise<TranslationResult> {
    const results: string[] = [];
    const nonEmptyLines: { index: number; text: string }[] = [];

    // Identify non-empty, translatable lines
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip empty lines and certain markdown elements
        if (!trimmed || isNonTranslatableLine(trimmed)) {
            results[i] = line; // Keep original
        } else {
            nonEmptyLines.push({ index: i, text: line });
        }
    }

    // Batch translate for efficiency (send all at once with structure)
    if (nonEmptyLines.length > 0) {
        // Create a structured prompt for batch translation
        const batchText = nonEmptyLines
            .map((item, idx) => `[${idx}] ${item.text}`)
            .join('\n');

        const batchPrompt = `Translate each numbered line below to ${LANGUAGE_NAMES[settings.toLang] || settings.toLang}.
Keep the [number] prefix in your response.
Preserve any markdown formatting within each line.
Only output the translated lines with their numbers, nothing else.

${batchText}`;

        const batchSettings = {
            ...settings,
            systemPrompt: 'You are a translator. Translate the text following the given format exactly.'
        };

        const result = await translateText(batchPrompt, batchSettings);

        if (!result.success || !result.translation) {
            return result;
        }

        // Parse the batch response
        const translatedLines = parseBatchResponse(result.translation, nonEmptyLines.length);

        // Build bilingual output
        const bilingualResults: string[] = [];
        let translationIndex = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            if (!trimmed) {
                bilingualResults.push(line); // Keep empty lines
            } else if (isNonTranslatableLine(trimmed)) {
                bilingualResults.push(line); // Keep non-translatable lines
            } else {
                // Add original line
                bilingualResults.push(line);
                // Add translated line
                if (translationIndex < translatedLines.length) {
                    bilingualResults.push(translatedLines[translationIndex]);
                    translationIndex++;
                }
            }
        }

        return { success: true, translation: bilingualResults.join('\n') };
    }

    return { success: true, translation: lines.join('\n') };
}

/**
 * Check if a line should not be translated
 */
function isNonTranslatableLine(line: string): boolean {
    // Code blocks
    if (line.startsWith('```')) return true;

    // Horizontal rules
    if (/^[-*_]{3,}$/.test(line)) return true;

    // Pure URLs
    if (/^https?:\/\/\S+$/.test(line)) return true;

    // Image/link only lines that are just references
    if (/^!\[.*\]\(.*\)$/.test(line) && !line.includes(' ')) return true;

    // YAML frontmatter delimiters
    if (line === '---') return true;

    return false;
}

/**
 * Parse batch translation response
 */
function parseBatchResponse(response: string, expectedCount: number): string[] {
    const lines = response.split('\n');
    const results: string[] = [];

    for (const line of lines) {
        // Match lines starting with [number]
        const match = line.match(/^\[(\d+)\]\s*(.*)$/);
        if (match) {
            results[parseInt(match[1])] = match[2];
        }
    }

    // Fill in any missing translations
    const finalResults: string[] = [];
    for (let i = 0; i < expectedCount; i++) {
        finalResults.push(results[i] || '');
    }

    return finalResults;
}

/**
 * Test API connection
 */
export async function testConnection(settings: KissTranslatorSettings): Promise<TranslationResult> {
    const testText = 'Hello, world!';
    return translateText(testText, settings);
}
