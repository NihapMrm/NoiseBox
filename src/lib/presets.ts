import { LazyStore } from '@tauri-apps/plugin-store'
import { Preset } from '../types'

const store = new LazyStore('presets.json')

export async function loadAllPresets(): Promise<Preset[]> {
  return (await store.get<Preset[]>('presets')) ?? []
}

export async function savePreset(preset: Preset): Promise<void> {
  const all = await loadAllPresets()
  const existing = all.findIndex((p) => p.id === preset.id)
  if (existing >= 0) {
    all[existing] = preset
  } else {
    all.push(preset)
  }
  await store.set('presets', all)
  await store.save()
}

export async function deletePreset(id: string): Promise<void> {
  const all = await loadAllPresets()
  await store.set('presets', all.filter((p) => p.id !== id))
  await store.save()
}
