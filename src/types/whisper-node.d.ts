declare module "whisper-node" {
  export interface WhisperOptions {
    modelName?: string
    modelPath?: string | null
    whisperOptions?: {
      language?: string
      task?: "transcribe" | "translate"
      temperature?: number
      maxLen?: number
      wordTimestamps?: boolean
    }
  }

  function whisper(filePath: string, options?: WhisperOptions): Promise<string>

  export default whisper
}
