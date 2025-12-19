import { Editor, Notice } from "obsidian";
import { translateLine } from "../apis/openai";
import { BilingualTranslateSettings } from "../settings";

interface LineToTranslate {
    originalLineNum: number;
    content: string;
}

export async function translateFile(
    editor: Editor,
    settings: BilingualTranslateSettings
): Promise<void> {
    const totalLines = editor.lineCount();
    let inCodeBlock = false;
    let inFrontmatter = false;

    // Collect all lines that need translation
    const linesToTranslate: LineToTranslate[] = [];

    for (let i = 0; i < totalLines; i++) {
        const line = editor.getLine(i);

        // Check for code block delimiters
        if (line.trim().startsWith("```")) {
            inCodeBlock = !inCodeBlock;
            continue;
        }

        // Check for frontmatter delimiters
        if (line.trim() === "---") {
            if (i === 0 || inFrontmatter) {
                inFrontmatter = !inFrontmatter;
            }
            continue;
        }

        // Skip lines that shouldn't be translated
        if (
            inCodeBlock ||
            inFrontmatter ||
            line.trim() === "" ||
            line.trim().startsWith("http://") ||
            line.trim().startsWith("https://") ||
            line.trim().startsWith("![") ||
            line.includes("|") // Skip markdown table rows
        ) {
            continue;
        }

        linesToTranslate.push({ originalLineNum: i, content: line });
    }

    if (linesToTranslate.length === 0) {
        new Notice("No lines to translate.");
        return;
    }

    new Notice(`Starting translation of ${linesToTranslate.length} lines...`);

    // Process in batches based on concurrency setting
    const concurrency = settings.concurrency;
    let linesInserted = 0;

    for (let i = 0; i < linesToTranslate.length; i += concurrency) {
        const batch = linesToTranslate.slice(i, i + concurrency);

        try {
            // Translate batch in parallel
            const translations = await Promise.all(
                batch.map((item) => translateLine(item.content, settings))
            );

            // Insert translations in order (must be sequential to maintain correct positions)
            for (let j = 0; j < batch.length; j++) {
                const item = batch[j];
                const translation = translations[j];
                const currentLineNum = item.originalLineNum + linesInserted;
                const lineContent = editor.getLine(currentLineNum);

                // Insert translation after current line
                const insertPos = { line: currentLineNum, ch: lineContent.length };
                editor.replaceRange("\n" + translation, insertPos);
                linesInserted++;
            }
        } catch (error) {
            new Notice(`Translation error: ${error.message}`);
            return;
        }
    }

    new Notice("Translation complete!");
}
