import { Editor, Notice } from "obsidian";
import { translateLine } from "../apis/openai";
import { BilingualTranslateSettings } from "../settings";

export async function translateFile(
    editor: Editor,
    settings: BilingualTranslateSettings
): Promise<void> {
    const content = editor.getValue();
    const lines = content.split("\n");
    const newLines: string[] = [];

    let inCodeBlock = false;
    let inFrontmatter = false;

    new Notice("Starting translation...");

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check for code block delimiters
        if (line.trim().startsWith("```")) {
            inCodeBlock = !inCodeBlock;
            newLines.push(line);
            continue;
        }

        // Check for frontmatter delimiters
        if (line.trim() === "---") {
            if (i === 0 || inFrontmatter) {
                inFrontmatter = !inFrontmatter;
            }
            newLines.push(line);
            continue;
        }

        // Skip lines that shouldn't be translated
        if (
            inCodeBlock ||
            inFrontmatter ||
            line.trim() === "" ||
            line.trim().startsWith("http://") ||
            line.trim().startsWith("https://") ||
            line.trim().startsWith("![")
        ) {
            newLines.push(line);
            continue;
        }

        // Add original line
        newLines.push(line);

        try {
            // Translate and add translation
            const translation = await translateLine(line, settings);
            newLines.push(translation);

            // Update editor in real-time for visual feedback
            editor.setValue(newLines.join("\n"));
        } catch (error) {
            new Notice(`Translation error: ${error.message}`);
            return;
        }
    }

    new Notice("Translation complete!");
}
