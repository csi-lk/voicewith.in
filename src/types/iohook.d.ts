declare module "iohook" {
  export interface KeyboardEvent {
    shiftKey: boolean
    altKey: boolean
    ctrlKey: boolean
    metaKey: boolean
    keycode: number
    rawcode: number
    type: "keydown" | "keyup"
  }

  export interface MouseEvent {
    x: number
    y: number
    button: number
    clicks: number
    type: "mousedown" | "mouseup" | "mousemove" | "click" | "mousewheel" | "mousedrag"
  }

  export interface WheelEvent extends MouseEvent {
    amount: number
    direction: number
    rotation: number
  }

  export function on(event: "keydown" | "keyup", callback: (event: KeyboardEvent) => void): void
  export function on(
    event: "mousedown" | "mouseup" | "mousemove" | "click" | "mousedrag",
    callback: (event: MouseEvent) => void
  ): void
  export function on(event: "mousewheel", callback: (event: WheelEvent) => void): void

  export function off(event: "keydown" | "keyup", callback: (event: KeyboardEvent) => void): void
  export function off(
    event: "mousedown" | "mouseup" | "mousemove" | "click" | "mousedrag",
    callback: (event: MouseEvent) => void
  ): void
  export function off(event: "mousewheel", callback: (event: WheelEvent) => void): void

  export function start(): void
  export function stop(): void
  export function unload(): void
  export function isActive(): boolean

  export function registerShortcut(
    keys: number[],
    callback: () => void,
    releaseCallback?: () => void
  ): number
  export function unregisterShortcut(shortcutId: number): void
  export function unregisterAllShortcuts(): void

  export function enableClickPropagation(): void
  export function disableClickPropagation(): void
}
