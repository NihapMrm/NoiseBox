export interface SoundDefinition {
  id: string
  name: string
  icon: string
  color: string
  iconColor: string
  tag: 'weather' | 'nature' | 'indoor' | 'travel' | 'custom'
  freesoundId?: number
  pixabayQuery?: string
  bundled?: boolean   // ships with app in public/sounds/
}

export interface ActiveSound extends SoundDefinition {
  src: string        // local convertFileSrc URL or /sounds/ path
  vol: number
  active: boolean
  x: number
  y: number
}

export interface Preset {
  id: string
  name: string
  createdAt: string
  sounds: ActiveSound[]
  masterVol: number
}

export interface AppSettings {
  masterVol: number
  timerMode: 'off' | 'sleep' | 'pomodoro'
  timerMinutes: number
  theme: 'dark' | 'light'
}

export type DownloadStatus = 'idle' | 'downloading' | 'ready' | 'error'
