import { create } from 'zustand'
import { AppSettings } from '../types'

interface SettingsStore extends AppSettings {
  isPlaying: boolean
  freesoundApiKey: string
  pixabayApiKey: string
  playgroundMode: 'classic' | 'orbit'
  spatialAudio: boolean
  setMasterVol: (vol: number) => void
  setIsPlaying: (playing: boolean) => void
  setTimerMode: (mode: AppSettings['timerMode']) => void
  setTimerMinutes: (minutes: number) => void
  setTheme: (theme: AppSettings['theme']) => void
  setFreesoundApiKey: (key: string) => void
  setPixabayApiKey: (key: string) => void
  setPlaygroundMode: (mode: 'classic' | 'orbit') => void
  setSpatialAudio: (on: boolean) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  masterVol: 80,
  timerMode: 'off',
  timerMinutes: 25,
  theme: 'dark',
  isPlaying: false,
  freesoundApiKey: '',
  pixabayApiKey: '',
  playgroundMode: 'classic',
  spatialAudio: true,
  setMasterVol: (vol) => set({ masterVol: vol }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setTimerMode: (mode) => set({ timerMode: mode }),
  setTimerMinutes: (minutes) => set({ timerMinutes: minutes }),
  setTheme: (theme) => set({ theme }),
  setFreesoundApiKey: (key) => set({ freesoundApiKey: key }),
  setPixabayApiKey: (key) => set({ pixabayApiKey: key }),
  setPlaygroundMode: (mode) => set({ playgroundMode: mode }),
  setSpatialAudio: (on) => set({ spatialAudio: on }),
}))
