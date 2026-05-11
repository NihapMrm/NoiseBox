import { create } from 'zustand'
import { DownloadStatus } from '../types'

interface DownloadEntry {
  status: DownloadStatus
  error?: string
}

interface DownloadStore {
  states: Record<string, DownloadEntry>
  setStatus: (id: string, status: DownloadStatus, error?: string) => void
  getStatus: (id: string) => DownloadStatus
}

export const useDownloadStore = create<DownloadStore>((set, get) => ({
  states: {},
  setStatus: (id, status, error) =>
    set((s) => ({ states: { ...s.states, [id]: { status, error } } })),
  getStatus: (id) => get().states[id]?.status ?? 'idle',
}))
