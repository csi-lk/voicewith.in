import { menubar } from "menubar"
import * as path from "node:path"
import * as fs from "node:fs"
import * as os from "node:os"
import { app, globalShortcut } from "electron"
import * as record from "node-record-lpcm16"
import type { Recording } from "node-record-lpcm16"

console.log("VoiceWithin - Voice Note-Taking Menu Bar App")

// Recording state
let isRecording = false
let currentRecording: Recording | null = null
let recordingStartTime: number | null = null
let audioFilePath: string | null = null

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
  } catch (error) {
    console.error("Failed to start recording:", error)
    isRecording = false
    currentRecording = null
    audioFilePath = null
  }
}

// Stop recording function
function stopRecording() {
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
    }

    // Reset state
    isRecording = false
    currentRecording = null
    recordingStartTime = null
  } catch (error) {
    console.error("Failed to stop recording:", error)
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
