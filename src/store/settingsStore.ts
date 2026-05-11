import { create } from 'zustand'
import { AppSettings } from '../types'

interface SettingsStore extends AppSettings {
  isPlaying: boolean
  freesoundApiKey: string
  pixabayApiKey: string
  setMasterVol: (vol: number) => void
  setIsPlaying: (playing: boolean) => void
  setTimerMode: (mode: AppSettings['timerMode']) => void
  setTimerMinutes: (minutes: number) => void
  setTheme: (theme: AppSettings['theme']) => void
  setFreesoundApiKey: (key: string) => void
  setPixabayApiKey: (key: string) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  masterVol: 80,
  timerMode: 'off',
  timerMinutes: 25,
  theme: 'dark',
  isPlaying: false,
  freesoundApiKey: '',
  pixabayApiKey: '',
  setMasterVol: (vol) => set({ masterVol: vol }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setTimerMode: (mode) => set({ timerMode: mode }),
  setTimerMinutes: (minutes) => set({ timerMinutes: minutes }),
  setTheme: (theme) => set({ theme }),
  setFreesoundApiKey: (key) => set({ freesoundApiKey: key }),
  setPixabayApiKey: (key) => set({ pixabayApiKey: key }),
}))
