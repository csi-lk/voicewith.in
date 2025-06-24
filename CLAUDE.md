# VoiceWithin - Voice Note-Taking Menu Bar App

## Project Overview
VoiceWithin is a TypeScript-based menu bar application for macOS that enables voice note-taking functionality. The app uses Electron's menubar to provide quick access to voice recording and transcription features.

## Tech Stack
- **Language**: TypeScript
- **Runtime**: Node.js with Electron
- **Package Manager**: Bun
- **Menu Bar**: menubar (Electron-based)
- **Voice Recording**: node-record-lpcm16
- **AI Integration**: Ollama for transcription/processing
- **Notifications**: node-notifier
- **Keyboard Hooks**: iohook
- **Linting**: oxlint with unicorn ruleset

## Project Structure
```
voicewithin/
├── src/              # TypeScript source files
│   └── index.ts      # Main entry point
├── dist/             # Compiled JavaScript output
├── package.json      # Project dependencies and scripts
├── tsconfig.json     # TypeScript configuration
├── oxlintrc.json     # Linting configuration
└── .gitignore        # Git ignore rules
```

## Development Commands
- `bun install` - Install all dependencies
- `bun run dev` - Run in development mode with ts-node
- `bun run build` - Compile TypeScript to JavaScript
- `bun start` - Run the compiled application
- `bun run lint` - Run oxlint to check code quality

## Key Features (Planned)
1. Menu bar integration for quick access
2. Voice recording with hotkey activation
3. Real-time transcription using Ollama
4. System notifications for recording status
5. Keyboard shortcuts via iohook

## Development Guidelines
- Follow TypeScript strict mode conventions
- Use oxlint with unicorn ruleset for code quality
- Keep the menu bar UI simple and responsive
- Ensure proper error handling for audio devices
- Test on macOS for native menu bar compatibility

## Notes for Future Development
- The main entry point (src/index.ts) sets up the menubar instance
- Audio recording will need proper permissions on macOS
- Consider implementing a settings window for configuration
- Add proper error boundaries for Electron processes
- Implement secure storage for any user preferences