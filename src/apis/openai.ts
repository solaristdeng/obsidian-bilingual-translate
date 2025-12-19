import { BilingualTranslateSettings } from "../settings";

export async function translateLine(
    line: string,
    settings: BilingualTranslateSettings
): Promise<string> {
    const response = await fetch(settings.apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
            model: settings.model,
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

    if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}
