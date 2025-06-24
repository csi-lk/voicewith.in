# VoiceWithin

A privacy-first voice note-taking app for macOS that runs entirely locally. Capture your thoughts with a simple hotkey, and let AI transform them into organized notes.

## Features

- **Instant Voice Capture**: Hold `CMD+I` to record, release to process
- **Local Processing**: Everything runs on your machine - no cloud, no tracking
- **AI-Powered Notes**: Automatically converts speech to clean, organized bullet points
- **Daily Notes**: Saves to organized daily markdown files in Obsidian-compatible format
- **Menu Bar Integration**: Runs quietly in your menu bar, always ready
- **Enterprise Safe**: Perfect for sensitive work environments

## How It Works

1. Hold `CMD+I` and speak your thoughts
2. Release the key when done
3. VoiceWithin transcribes your speech using local Whisper
4. AI processes the transcription into concise bullet points
5. Notes are automatically saved to your daily markdown file

## Requirements

- macOS (Apple Silicon or Intel)
- [Ollama](https://ollama.ai) installed with a language model
- Node.js 18+

## Installation

1. Install Ollama and pull a model:

   ```bash
   brew install ollama
   ollama pull llama3.1:8b
   ollama serve
   ```

2. Clone and install VoiceWithin:

   ```bash
   git clone https://github.com/yourusername/voicewithin
   cd voicewithin
   npm install
   npm run build
   npm start
   ```

3. Grant microphone permissions when prompted

## File Organization

Notes are saved to:

```
~/dev/voicewithin/daily/YYYY/YYYY-MM-DD.md
```

Example: `~/dev/voicewithin/daily/2025/2025-06-24.md`

## Privacy

- All processing happens locally on your machine
- No data is sent to external servers
- Audio recordings are automatically deleted after processing
- Perfect for confidential work environments

## Menu Bar Controls

- **VoiceWithin - Listening for CMD+I**: Status indicator
- **Last note: [timestamp]**: Shows when last note was captured
- **Open Today's Notes**: Quick access to today's markdown file
- **Quit VoiceWithin**: Exit the application

## Contributing

Built for developers who value privacy and local-first tools. Contributions welcome!

## License

The Unlicense - https://unlicense.org
