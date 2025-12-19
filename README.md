# Bilingual Translate for Obsidian

A simple Obsidian plugin that translates markdown files using OpenAI-compatible APIs. Creates bilingual output with original text followed by translation, line by line.

## Features

- **Real-time translation**: Watch translations appear as each line is processed
- **Bilingual output**: Original line followed by translated line
- **OpenAI-compatible**: Works with OpenAI, Ollama, OpenRouter, Azure, and any OpenAI-compatible API
- **Smart parsing**: Automatically skips code blocks, frontmatter, URLs, and images
- **Preserves formatting**: Keeps markdown syntax intact

## Installation

### Manual Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the releases
2. Create folder: `<YourVault>/.obsidian/plugins/obsidian-bilingual-translate/`
3. Copy the files into that folder
4. Restart Obsidian
5. Enable the plugin in Settings → Community plugins

### Build from Source

```bash
git clone https://github.com/solaristdeng/obsidian-bilingual-translate.git
cd obsidian-bilingual-translate
npm install
npm run build
```

## Configuration

Go to **Settings → Bilingual Translate** to configure:

| Setting | Description |
|---------|-------------|
| API URL | Your OpenAI-compatible endpoint |
| API Key | Your API key |
| Model | Model name (e.g., `gpt-4o-mini`, `llama3.1`) |
| Temperature | Controls randomness (0-2). Lower values (0.3) recommended for translation. |
| Concurrency | Number of parallel translation requests. |
| Source Language | Language of original text (or auto-detect) |
| Target Language | Language to translate to |

### Example API URLs

| Provider | URL |
|----------|-----|
| OpenAI | `https://api.openai.com/v1/chat/completions` |
| Ollama (local) | `http://localhost:11434/v1/chat/completions` |
| OpenRouter | `https://openrouter.ai/api/v1/chat/completions` |
| Azure OpenAI | `https://<resource>.openai.azure.com/openai/deployments/<deployment>/chat/completions?api-version=2024-02-01` |

## Usage

1. Open any markdown file
2. Open Command Palette (`Ctrl/Cmd + P`)
3. Run **"Bilingual Translate: Translate current file"**
4. Watch as translations appear line by line

You can also set a hotkey for the command in Settings → Hotkeys.

## Example

**Before:**
```markdown
# Hello World

This is a test document.
It demonstrates the translation feature.
```

**After (translated to Chinese):**
```markdown
# Hello World
# 你好世界

This is a test document.
这是一个测试文档。
It demonstrates the translation feature.
它演示了翻译功能。
```

## What Gets Translated

✅ Regular text paragraphs  
✅ Headings  
✅ List items  
✅ Blockquotes  

❌ Code blocks (``` ... ```)  
❌ Frontmatter (--- ... ---)  
❌ URLs  
❌ Image references  
❌ Empty lines  

## Credits

This plugin was inspired by and built with reference to [Kiss Translator](https://github.com/fishjar/kiss-translator), a browser extension for translating web pages. Special thanks to the Kiss Translator project for the translation approach and design inspiration.

## License

MIT
