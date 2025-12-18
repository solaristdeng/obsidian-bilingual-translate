// Translate File Command - Real-time Line by Line
import { MarkdownView, Notice, Editor } from 'obsidian';
import type KissTranslatorPlugin from '../main';
import { translateText } from '../apis/openai';
import { LANGUAGE_NAMES } from '../settings';

/**
 * Translate the current file - REAL-TIME line by line
 * Each translation is inserted immediately after the line is translated
 */
export async function translateCurrentFile(plugin: KissTranslatorPlugin): Promise<void> {
    const activeView = plugin.app.workspace.getActiveViewOfType(MarkdownView);

    if (!activeView) {
        new Notice('No active markdown file');
        return;
    }

    const editor = activeView.editor;

    if (!editor.getValue().trim()) {
        new Notice('File is empty');
        return;
    }

    // Check API configuration
    if (!plugin.settings.apiKey) {
        new Notice('Please configure your API key in settings');
        return;
    }

    const toLangName = LANGUAGE_NAMES[plugin.settings.toLang] || plugin.settings.toLang;
    new Notice(`Translating to ${toLangName}...`);

    try {
        await translateFileRealtime(editor, plugin);
        new Notice('Translation complete!');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        new Notice(`Translation error: ${errorMessage}`);
        console.error('Translation error:', error);
    }
}

/**
 * Translate file with real-time updates
 * Inserts each translation immediately after completion
 */
async function translateFileRealtime(
    editor: Editor,
    plugin: KissTranslatorPlugin
): Promise<void> {
    // Track context
    let inCodeBlock = false;
    let inFrontmatter = false;
    let frontmatterCount = 0;

    // We need to track line offset as we insert new lines
    let lineOffset = 0;

    // Get initial line count (this will change as we add translations)
    const originalLineCount = editor.lineCount();

    // Process each original line
    for (let originalLineNum = 0; originalLineNum < originalLineCount; originalLineNum++) {
        // Current actual line number in editor (accounting for inserted lines)
        const currentLineNum = originalLineNum + lineOffset;

        // Get the line content
        const line = editor.getLine(currentLineNum);
        const trimmed = line.trim();

        // Handle frontmatter
        if (originalLineNum === 0 && trimmed === '---') {
            inFrontmatter = true;
            frontmatterCount = 1;
            continue;
        }

        if (inFrontmatter) {
            if (trimmed === '---') {
                frontmatterCount++;
                if (frontmatterCount >= 2) {
                    inFrontmatter = false;
                }
            }
            continue;
        }

        // Handle code blocks
        if (trimmed.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
        }

        if (inCodeBlock) {
            continue;
        }

        // Check if this line should be translated
        if (!shouldTranslateLine(trimmed)) {
            continue;
        }

        // Translate THIS SINGLE LINE
        const translation = await translateSingleLine(trimmed, plugin);

        if (translation) {
            // Get indentation from original line
            const indent = line.match(/^(\s*)/)?.[1] || '';
            const translatedLine = indent + translation;

            // Insert translation IMMEDIATELY after the current line
            const insertLineNum = currentLineNum + 1;

            // Get the end of current line
            const lineLength = editor.getLine(currentLineNum).length;

            // Insert new line with translation
            editor.replaceRange(
                '\n' + translatedLine,
                { line: currentLineNum, ch: lineLength }
            );

            // Increment offset since we added a line
            lineOffset++;
        }
    }
}

/**
 * Translate a single line of text
 */
async function translateSingleLine(
    text: string,
    plugin: KissTranslatorPlugin
): Promise<string | null> {
    if (!text.trim()) return null;

    const toLangName = LANGUAGE_NAMES[plugin.settings.toLang] || plugin.settings.toLang;

    // Simple prompt for single line translation
    const prompt = `Translate to ${toLangName}. Keep markdown formatting. Output only the translation:

${text}`;

    const settings = {
        ...plugin.settings,
        systemPrompt: 'You are a translator. Output only the translated text.',
        maxTokens: 1024,
    };

    const result = await translateText(prompt, settings);

    if (result.success && result.translation) {
        let translation = result.translation.trim();
        // Remove surrounding quotes if LLM added them
        if ((translation.startsWith('"') && translation.endsWith('"')) ||
            (translation.startsWith("'") && translation.endsWith("'"))) {
            translation = translation.slice(1, -1);
        }
        return translation;
    }

    console.error('Translation failed:', result.error);
    return null;
}

/**
 * Determine if a line should be translated
 */
function shouldTranslateLine(trimmed: string): boolean {
    if (!trimmed) return false;
    if (/^[-*_]{3,}$/.test(trimmed)) return false;
    if (/^https?:\/\/\S+$/.test(trimmed)) return false;
    if (/^!\[.*\]\(.*\)$/.test(trimmed)) return false;
    if (/^\[.*\]:\s*\S+/.test(trimmed)) return false;
    if (/^<!--.*-->$/.test(trimmed)) return false;
    if (trimmed.length < 2) return false;
    if (/^[\d\s\.,;:!?\-_=+*#\[\](){}|\\/<>@&%$^~`'"]+$/.test(trimmed)) return false;
    return true;
}
