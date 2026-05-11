import { create } from 'zustand'
import { ActiveSound } from '../types'

interface SoundStore {
  sounds: ActiveSound[]
  addSound: (sound: ActiveSound) => void
  removeSound: (id: string) => void
  toggleSound: (id: string) => void
  setVolume: (id: string, vol: number) => void
  updatePosition: (id: string, x: number, y: number) => void
  updateSoundSrc: (id: string, src: string) => void
  loadSounds: (sounds: ActiveSound[]) => void
  clearSounds: () => void
}

export const useSoundStore = create<SoundStore>((set) => ({
  sounds: [],
  addSound: (sound) =>
    set((s) => ({ sounds: [...s.sounds, sound] })),
  removeSound: (id) =>
    set((s) => ({ sounds: s.sounds.filter((snd) => snd.id !== id) })),
  toggleSound: (id) =>
    set((s) => ({
      sounds: s.sounds.map((snd) =>
        snd.id === id ? { ...snd, active: !snd.active } : snd
      ),
    })),
  setVolume: (id, vol) =>
    set((s) => ({
      sounds: s.sounds.map((snd) => (snd.id === id ? { ...snd, vol } : snd)),
    })),
  updatePosition: (id, x, y) =>
    set((s) => ({
      sounds: s.sounds.map((snd) => (snd.id === id ? { ...snd, x, y } : snd)),
    })),
  updateSoundSrc: (id, src) =>
    set((s) => ({
      sounds: s.sounds.map((snd) => (snd.id === id ? { ...snd, src } : snd)),
    })),
  loadSounds: (sounds) => set({ sounds }),
  clearSounds: () => set({ sounds: [] }),
}))
