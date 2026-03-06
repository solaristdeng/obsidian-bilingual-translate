import { App } from "obsidian";
import { BilingualTranslateSettings } from "../settings";
import { translateLineOpenAI } from "./openai";
import { translateLineGemini } from "./gemini";

export async function translateLine(
    line: string,
    settings: BilingualTranslateSettings,
    app: App
): Promise<string> {
    switch (settings.apiProvider) {
        case "gemini":
            return translateLineGemini(line, settings, app);
        case "openai":
        default:
            return translateLineOpenAI(line, settings, app);
    }
}
