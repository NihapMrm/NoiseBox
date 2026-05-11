import { create } from 'zustand'
import { Preset } from '../types'

interface PresetStore {
  presets: Preset[]
  activePresetId: string | null
  setPresets: (presets: Preset[]) => void
  addPreset: (preset: Preset) => void
  removePreset: (id: string) => void
  setActivePresetId: (id: string | null) => void
}

export const usePresetStore = create<PresetStore>((set) => ({
  presets: [],
  activePresetId: null,
  setPresets: (presets) => set({ presets }),
  addPreset: (preset) => set((s) => ({ presets: [...s.presets, preset] })),
  removePreset: (id) =>
    set((s) => ({ presets: s.presets.filter((p) => p.id !== id) })),
  setActivePresetId: (id) => set({ activePresetId: id }),
}))
