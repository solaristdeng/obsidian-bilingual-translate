import { App, requestUrl } from "obsidian";
import { BilingualTranslateSettings } from "../settings";

export async function translateLineGemini(
    line: string,
    settings: BilingualTranslateSettings,
    app: App
): Promise<string> {
    const apiKey = app.secretStorage.getSecret(settings.apiKeySecretName);
    if (!apiKey) {
        throw new Error("API key not found in SecretStorage. Please configure it in settings.");
    }

    const url = `${settings.apiUrl}/models/${settings.model}:generateContent`;

    const response = await requestUrl({
        url: `${url}?key=${apiKey}`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            systemInstruction: {
                parts: [
                    {
                        text: `You are a professional translator. Translate the following text from ${settings.sourceLanguage} to ${settings.targetLanguage}. Only return the translation, nothing else.`,
                    },
                ],
            },
            contents: [
                {
                    role: "user",
                    parts: [{ text: line }],
                },
            ],
            generationConfig: {
                temperature: settings.temperature,
            },
        }),
    });

    if (response.status !== 200) {
        throw new Error(`Gemini API request failed: ${response.status}`);
    }

    return response.json.candidates[0].content.parts[0].text.trim();
}
