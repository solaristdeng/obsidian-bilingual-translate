import { App, requestUrl } from "obsidian";
import { BilingualTranslateSettings } from "../settings";

export async function translateLineOpenAI(
    line: string,
    settings: BilingualTranslateSettings,
    app: App
): Promise<string> {
    const apiKey = app.secretStorage.getSecret(settings.apiKeySecretName);
    if (!apiKey) {
        throw new Error("API key not found in SecretStorage. Please configure it in settings.");
    }

    const response = await requestUrl({
        url: settings.apiUrl,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
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
