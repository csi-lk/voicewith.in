declare module "node-record-lpcm16" {
  import { Readable } from "node:stream"

  export interface RecordingOptions {
    sampleRate?: number
    channels?: number
    compress?: boolean
    threshold?: number
    thresholdStart?: number | null
    thresholdEnd?: number | null
    silence?: string
    recorder?: "sox" | "rec" | "arecord"
    endOnSilence?: boolean
    audioType?: string
    device?: string | null
  }

  export interface Recording {
    stop(): void
    pause(): void
    resume(): void
    isPaused(): boolean
    stream(): Readable
  }

  export function record(options?: RecordingOptions): Recording
  export function start(options?: RecordingOptions): Recording
  export function stop(): void
}
