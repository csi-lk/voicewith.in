import { menubar } from "menubar"
import * as path from "node:path"
import * as fs from "node:fs"
import * as os from "node:os"
import { app, globalShortcut, Notification } from "electron"
import * as record from "node-record-lpcm16"
import type { Recording } from "node-record-lpcm16"
import { Ollama } from "ollama"
import whisper from "whisper-node"

console.log("VoiceWithin - Voice Note-Taking Menu Bar App")

// Initialize Ollama client
const ollama = new Ollama({ host: "http://localhost:11434" })

// Recording state
let isRecording = false
let currentRecording: Recording | null = null
let recordingStartTime: number | null = null
let audioFilePath: string | null = null
let isProcessing = false

// Create temp directory for audio files
const tempDir = path.join(os.tmpdir(), "voicewithin")
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

// Helper function to generate unique audio file path
function generateAudioFilePath(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  return path.join(tempDir, `recording-${timestamp}.wav`)
}

// Show notification
function showNotification(title: string, body: string) {
  new Notification({ title, body }).show()
}

// Transcribe audio using Whisper
async function transcribeAudio(audioPath: string): Promise<string | null> {
  try {
    console.log("Starting transcription with Whisper...")

    // Initialize whisper with the base model
    const options = {
      modelName: "base.en",
      modelPath: null, // Use default model path
      whisperOptions: {
        language: "en",
        task: "transcribe" as const,
      },
    }

    const transcript = await whisper(audioPath, options)
    console.log("Transcription complete:", transcript)
    return transcript
  } catch (error) {
    console.error("Transcription failed:", error)
    showNotification(
      "Transcription Error",
      "Failed to transcribe audio. Check console for details."
    )
    return null
  }
}

// Process transcription with Ollama
async function processWithOllama(transcription: string): Promise<string | null> {
  try {
    console.log("Processing transcription with Ollama...")

    const response = await ollama.chat({
      model: "llama3.1:8b",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that converts voice transcriptions into concise bullet point notes.",
        },
        {
          role: "user",
          content: `Convert this transcription into concise bullet points for notes. Be direct and short. Remove filler words and organize thoughts clearly:\n\n${transcription}`,
        },
      ],
    })

    const processedText = response.message.content
    console.log("Ollama processing complete:", processedText)
    return processedText
  } catch (error) {
    console.error("Ollama processing failed:", error)

    // Check if it's a connection error
    if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
      showNotification(
        "Ollama Connection Error",
        "Cannot connect to Ollama. Make sure 'ollama serve' is running."
      )
    } else {
      showNotification(
        "Processing Error",
        "Failed to process with Ollama. Check console for details."
      )
    }

    return null
  }
}

// Save processed notes
function saveNotes(content: string) {
  const date = new Date()
  const year = date.getFullYear()
  const dateStr = date.toISOString().split("T")[0]

  // Create notes directory structure
  const notesDir = path.join(os.homedir(), "dev", "voicewithin", "daily", year.toString())
  if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir, { recursive: true })
  }

  const notesPath = path.join(notesDir, `${dateStr}.md`)

  // Append to daily notes file
  const timestamp = date.toLocaleTimeString()
  const noteEntry = `\n## ${timestamp}\n\n${content}\n`

  fs.appendFileSync(notesPath, noteEntry)
  console.log(`Notes saved to: ${notesPath}`)
  showNotification("Notes Saved", `Added to today's notes: ${dateStr}.md`)
}

// Clean up audio file
function cleanupAudioFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`Cleaned up audio file: ${filePath}`)
    }
  } catch (error) {
    console.error("Failed to clean up audio file:", error)
  }
}

// Process the recording
async function processRecording(audioPath: string) {
  if (isProcessing) {
    console.warn("Already processing a recording")
    return
  }

  isProcessing = true
  showNotification("Processing", "Transcribing your voice note...")

  try {
    // Step 1: Transcribe audio
    const transcription = await transcribeAudio(audioPath)
    if (!transcription) {
      throw new Error("Transcription failed")
    }

    // Step 2: Process with Ollama
    const processedNotes = await processWithOllama(transcription)
    if (!processedNotes) {
      // If Ollama fails, save raw transcription
      console.log("Saving raw transcription as fallback")
      saveNotes(`**Raw Transcription:**\n${transcription}`)
    } else {
      // Save processed notes
      saveNotes(processedNotes)
    }

    // Step 3: Clean up audio file
    cleanupAudioFile(audioPath)
  } catch (error) {
    console.error("Processing failed:", error)
    showNotification("Processing Error", "Failed to process voice note. Audio file preserved.")
  } finally {
    isProcessing = false
  }
}

// Start recording function
function startRecording() {
  if (isRecording) {
    console.warn("Already recording, ignoring start request")
    return
  }

  try {
    audioFilePath = generateAudioFilePath()
    console.log(`Starting recording to: ${audioFilePath}`)

    const fileStream = fs.createWriteStream(audioFilePath)

    currentRecording = record.record({
      sampleRate: 16000,
      channels: 1,
      audioType: "wav",
      // Use default recorder which should work without sox
    })

    currentRecording.stream().pipe(fileStream)

    isRecording = true
    recordingStartTime = Date.now()
    console.log("Recording started successfully")
    showNotification("Recording", "Voice recording started...")
  } catch (error) {
    console.error("Failed to start recording:", error)
    isRecording = false
    currentRecording = null
    audioFilePath = null
    showNotification("Recording Error", "Failed to start recording. Check microphone permissions.")
  }
}

// Stop recording function
async function stopRecording() {
  if (!isRecording || !currentRecording) {
    console.warn("No active recording to stop")
    return
  }

  try {
    currentRecording.stop()

    const duration = recordingStartTime ? (Date.now() - recordingStartTime) / 1000 : 0
    console.log(`Recording stopped. Duration: ${duration.toFixed(2)}s`)
    console.log(`Audio file saved to: ${audioFilePath}`)

    // Verify file exists and log size
    if (audioFilePath && fs.existsSync(audioFilePath)) {
      const stats = fs.statSync(audioFilePath)
      console.log(`File size: ${(stats.size / 1024).toFixed(2)} KB`)

      // Process the recording
      await processRecording(audioFilePath)
    }

    // Reset state
    isRecording = false
    currentRecording = null
    recordingStartTime = null
    audioFilePath = null
  } catch (error) {
    console.error("Failed to stop recording:", error)
    showNotification("Recording Error", "Failed to stop recording properly.")
  }
}

// Set up global hotkey handling
function setupHotkeyHandlers() {
  // Register CMD+I for press and release
  try {
    // For hold-to-record functionality, we'll use a simpler approach
    // Register the shortcut to toggle recording
    const registered = globalShortcut.register("CommandOrControl+I", () => {
      if (!isRecording) {
        console.log("CMD+I pressed - starting recording")
        startRecording()
      } else {
        console.log("CMD+I pressed again - stopping recording")
        stopRecording()
      }
    })

    if (!registered) {
      console.error("Failed to register global shortcut CMD+I")
    } else {
      console.log("Global shortcut CMD+I registered successfully")
    }
  } catch (error) {
    console.error("Failed to set up global shortcuts:", error)
  }
}

const mb = menubar({
  index: `file://${path.join(__dirname, "..", "index.html")}`,
  // Icon is optional - comment out if causing issues
  // icon: path.join(__dirname, "..", "assets", "icon.png"),
  tooltip: "VoiceWithin - Voice Notes",
  browserWindow: {
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  },
})

mb.on("ready", () => {
  console.log("VoiceWithin is ready!")
  setupHotkeyHandlers()

  // Check Ollama connection on startup
  ollama
    .list()
    .then(() => {
      console.log("Ollama connection successful")
    })
    .catch((error) => {
      console.error("Ollama connection failed:", error)
      showNotification(
        "Ollama Not Running",
        "Please start Ollama with 'ollama serve' for AI processing"
      )
    })
})

mb.on("after-create-window", () => {
  if (process.env.NODE_ENV === "development") {
    mb.window?.webContents.openDevTools()
  }
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

// Clean up on app quit
app.on("will-quit", () => {
  try {
    globalShortcut.unregisterAll()
    console.log("Cleaned up global shortcuts")
  } catch (error) {
    console.error("Error cleaning up shortcuts:", error)
  }
})
