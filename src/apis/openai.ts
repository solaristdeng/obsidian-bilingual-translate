import { requestUrl } from "obsidian";
import { BilingualTranslateSettings } from "../settings";

export async function translateLine(
    line: string,
    settings: BilingualTranslateSettings
): Promise<string> {
    const response = await requestUrl({
        url: settings.apiUrl,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
            model: settings.model,
            temperature: settings.temperature,
            messages: [
                {
                    role: "system",
                    content: `You are a professional translator. Translate the following text from ${settings.sourceLanguage} to ${settings.targetLanguage}. Only return the translation, nothing else.`,
                },
                {
                    role: "user",
                    content: line,
                },
            ],
        }),
    });

    if (response.status !== 200) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json.choices[0].message.content.trim();
}
