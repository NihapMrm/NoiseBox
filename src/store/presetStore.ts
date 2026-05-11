import { create } from 'zustand'
import { Preset, ActiveSound } from '../types'

interface PresetStore {
  presets: Preset[]
  activePresetId: string | null
  savedSnapshot: ActiveSound[] | null
  setPresets: (presets: Preset[]) => void
  addPreset: (preset: Preset) => void
  removePreset: (id: string) => void
  updatePreset: (preset: Preset) => void
  setActivePresetId: (id: string | null) => void
  setSnapshot: (sounds: ActiveSound[] | null) => void
}

export const usePresetStore = create<PresetStore>((set) => ({
  presets: [],
  activePresetId: null,
  savedSnapshot: null,
  setPresets: (presets) => set({ presets }),
  addPreset: (preset) => set((s) => ({ presets: [...s.presets, preset] })),
  removePreset: (id) =>
    set((s) => ({ presets: s.presets.filter((p) => p.id !== id) })),
  updatePreset: (preset) =>
    set((s) => ({ presets: s.presets.map((p) => (p.id === preset.id ? preset : p)) })),
  setActivePresetId: (id) => set({ activePresetId: id }),
  setSnapshot: (sounds) => set({ savedSnapshot: sounds }),
}))
