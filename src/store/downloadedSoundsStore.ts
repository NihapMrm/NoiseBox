import { create } from 'zustand'
import { SoundDefinition } from '../types'

export interface DownloadedSound extends SoundDefinition {
  src: string
  downloadedAt: string
}

interface DownloadedSoundsStore {
  downloaded: DownloadedSound[]
  add: (sound: DownloadedSound) => void
  setAll: (sounds: DownloadedSound[]) => void
}

export const useDownloadedSoundsStore = create<DownloadedSoundsStore>((set) => ({
  downloaded: [],
  add: (sound) =>
    set((s) => {
      const exists = s.downloaded.some((d) => d.id === sound.id)
      if (exists) return s
      return { downloaded: [...s.downloaded, sound] }
    }),
  setAll: (sounds) => set({ downloaded: sounds }),
}))
