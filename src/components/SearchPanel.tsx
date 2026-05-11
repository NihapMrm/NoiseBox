import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Check, Loader, AlertCircle, Key,
  Play, Square, CloudRain, Zap, Feather, Wind, Flame,
  Coffee, Waves, Trees, Fan, Users, Droplets, Train, Keyboard, Moon, X,
} from 'lucide-react'
import { BUILT_IN_SOUNDS } from '../audio/sounds'
import { useSoundStore } from '../store/soundStore'
import { useSettingsStore } from '../store/settingsStore'
import { useDownloadStore } from '../store/downloadStore'
import { ensureSoundCached } from '../lib/audioDownloader'
import { usePreview } from '../hooks/usePreview'
import { ActiveSound, SoundDefinition } from '../types'
import { ApiKeysModal } from './ApiKeysModal'
import { invoke } from '@tauri-apps/api/core'

const ICON_MAP: Record<string, React.ElementType> = {
  CloudRain, Zap, Feather, Wind, Flame, Coffee, Waves, Trees,
  Fan, Users, Droplets, Train, Keyboard, Moon,
}

interface FreesoundHit {
  id: number
  name: string
  duration: number
  previews: { 'preview-hq-mp3': string; 'preview-hq-ogg'?: string }
}

interface SearchPanelProps {
  open: boolean
  onClose: () => void
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function hitToSoundDef(hit: FreesoundHit): SoundDefinition {
  return {
    id: `fs_${hit.id}`,
    name: hit.name.replace(/\.(wav|mp3|ogg|flac|aiff?)$/i, '').slice(0, 40),
    icon: 'Waves',
    color: '#1a2535',
    iconColor: '#7c6af7',
    tag: 'custom',
    freesoundId: hit.id,
    bundled: false,
  }
}

export function SearchPanel({ open, onClose }: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [apiKeysOpen, setApiKeysOpen] = useState(false)
  const [results, setResults] = useState<FreesoundHit[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  const sounds = useSoundStore((s) => s.sounds)
  const addSound = useSoundStore((s) => s.addSound)
  const updateSoundSrc = useSoundStore((s) => s.updateSoundSrc)
  const freesoundApiKey = useSettingsStore((s) => s.freesoundApiKey)
  const pixabayApiKey = useSettingsStore((s) => s.pixabayApiKey)
  const { setStatus, getStatus } = useDownloadStore()
  const { playingId, loadingId, toggle: togglePreview, stop: stopPreview } = usePreview()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeIds = new Set(sounds.map((s) => s.id))
  const noKeys = !freesoundApiKey && !pixabayApiKey
  const isSearchMode = query.trim().length >= 2

  // Auto-focus input when opened
  useEffect(() => {
    if (open) { setQuery(''); setResults([]); setSearchError(''); setTimeout(() => inputRef.current?.focus(), 60) }
    else { stopPreview() }
  }, [open, stopPreview])

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { stopPreview(); onClose() } }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, stopPreview])

  // Live Freesound search
  const runSearch = useCallback(async (q: string) => {
    if (!freesoundApiKey) {
      setSearchError('Add a Freesound API key to search')
      setResults([])
      return
    }
    setSearching(true)
    setSearchError('')
    try {
      const url = `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(q)}&token=${freesoundApiKey}&fields=id,name,duration,previews&filter=duration:[5+TO+600]&page_size=15`
      const raw = await invoke<string>('fetch_text', { url })
      const data = JSON.parse(raw)
      const hits: FreesoundHit[] = data.results ?? []
      setResults(hits)
      if (hits.length === 0) setSearchError('No results — try different keywords')
    } catch {
      setSearchError('Search failed — check your API key')
      setResults([])
    }
    setSearching(false)
  }, [freesoundApiKey])

  useEffect(() => {
    if (!isSearchMode) { setResults([]); setSearchError(''); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(query.trim()), 450)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, isSearchMode, runSearch])

  // ── Add built-in ───────────────────────────────────────────────────────────

  async function handleAddBuiltIn(soundDef: (typeof BUILT_IN_SOUNDS)[0]) {
    if (activeIds.has(soundDef.id)) return
    stopPreview()
    let initialSrc = ''
    if (soundDef.bundled) {
      for (const ext of ['ogg', 'mp3']) {
        try {
          const res = await fetch(`/sounds/${soundDef.id}.${ext}`, { method: 'HEAD' })
          if (res.ok) { initialSrc = `/sounds/${soundDef.id}.${ext}`; break }
        } catch { /* ignore */ }
      }
    }
    const newSound: ActiveSound = { ...soundDef, src: initialSrc, vol: 75, active: false, x: 80 + Math.random() * 180, y: 80 + Math.random() * 120 }
    addSound(newSound)
    if (initialSrc) { setStatus(soundDef.id, 'ready'); useSoundStore.getState().toggleSound(soundDef.id); return }
    setStatus(soundDef.id, 'downloading')
    try {
      const src = await ensureSoundCached(soundDef, freesoundApiKey, pixabayApiKey)
      updateSoundSrc(soundDef.id, src)
      setStatus(soundDef.id, 'ready')
      useSoundStore.getState().toggleSound(soundDef.id)
    } catch { setStatus(soundDef.id, 'error') }
  }

  // ── Add search result ──────────────────────────────────────────────────────

  async function handleAddResult(hit: FreesoundHit) {
    const soundDef = hitToSoundDef(hit)
    if (activeIds.has(soundDef.id)) return
    stopPreview()
    const newSound: ActiveSound = { ...soundDef, src: '', vol: 75, active: false, x: 80 + Math.random() * 180, y: 80 + Math.random() * 120 }
    addSound(newSound)
    setStatus(soundDef.id, 'downloading')
    try {
      const src = await ensureSoundCached(soundDef, freesoundApiKey, pixabayApiKey)
      updateSoundSrc(soundDef.id, src)
      setStatus(soundDef.id, 'ready')
      useSoundStore.getState().toggleSound(soundDef.id)
    } catch { setStatus(soundDef.id, 'error') }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => { stopPreview(); onClose() }}
              style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 200 }}
            />

            {/* Centered panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: '18%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '520px',
                maxWidth: 'calc(100% - 48px)',
                zIndex: 201,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Search input box */}
              <div
                style={{
                  backgroundColor: '#1e1e1e',
                  border: '0.5px solid #444',
                  borderRadius: results.length > 0 || isSearchMode ? '12px 12px 0 0' : '12px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
                  gap: '12px',
                  height: '56px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
              >
                {searching
                  ? <Loader size={18} color="#555" style={{ flexShrink: 0, animation: 'spin 0.8s linear infinite' }} />
                  : <Search size={18} color="#555" style={{ flexShrink: 0 }} />
                }
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Freesound… or browse below"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#e0e0e0',
                    fontSize: '15px',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {noKeys && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setApiKeysOpen(true) }}
                      title="Add API keys"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e24b4a', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '4px 6px', borderRadius: '6px', backgroundColor: '#2a1515' }}
                    >
                      <AlertCircle size={12} /> Keys missing
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); setApiKeysOpen(true) }}
                    title="API keys"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex' }}
                  >
                    <Key size={14} />
                  </button>
                  <button
                    onClick={() => { stopPreview(); onClose() }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Results / built-in list */}
              <AnimatePresence>
                {(isSearchMode || !isSearchMode) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      backgroundColor: '#1e1e1e',
                      border: '0.5px solid #444',
                      borderTop: '0.5px solid #2a2a2a',
                      borderRadius: '0 0 12px 12px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    }}
                  >
                    {/* Section label */}
                    <div style={{ padding: '7px 16px', borderBottom: '0.5px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: '#444', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        {isSearchMode ? `Freesound results${results.length ? ` (${results.length})` : ''}` : 'Built-in sounds'}
                      </span>
                      {isSearchMode && searching && (
                        <span style={{ fontSize: '11px', color: '#555' }}>Searching…</span>
                      )}
                    </div>

                    <div style={{ maxHeight: '340px', overflowY: 'auto' }}>

                      {/* Error / empty */}
                      {isSearchMode && searchError && !searching && (
                        <div style={{ padding: '20px 16px', textAlign: 'center', fontSize: '13px', color: '#555' }}>
                          {searchError}
                        </div>
                      )}

                      {/* ── Freesound results ── */}
                      {isSearchMode && results.map((hit) => {
                        const sid = `fs_${hit.id}`
                        const added = activeIds.has(sid)
                        const isDownloading = getStatus(sid) === 'downloading'
                        const previewUrl = hit.previews?.['preview-hq-mp3']
                        const isPlaying = playingId === sid
                        const isLoading = loadingId === sid

                        return (
                          <div
                            key={hit.id}
                            style={{ padding: '9px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '0.5px solid #222', transition: 'background 0.1s' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#252525' }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent' }}
                          >
                            {/* Preview */}
                            <button
                              onClick={() => previewUrl && togglePreview(sid, previewUrl)}
                              style={{
                                width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
                                border: `0.5px solid ${isPlaying ? '#7c6af7' : '#333'}`,
                                backgroundColor: isPlaying ? '#2d2540' : 'transparent',
                                color: isPlaying ? '#7c6af7' : '#555',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                              }}
                            >
                              {isLoading
                                ? <Loader size={12} style={{ animation: 'spin 0.8s linear infinite' }} />
                                : isPlaying ? <Square size={12} /> : <Play size={12} />
                              }
                            </button>

                            {/* Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', color: added ? '#555' : '#d0d0d0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {hit.name.replace(/\.(wav|mp3|ogg|flac|aiff?)$/i, '')}
                              </div>
                              <div style={{ fontSize: '11px', color: '#444', marginTop: '1px' }}>{fmt(hit.duration)}</div>
                            </div>

                            {/* Add */}
                            <button
                              onClick={() => handleAddResult(hit)}
                              disabled={added || isDownloading}
                              style={{
                                width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
                                border: added ? '0.5px solid #2a2a2a' : '0.5px solid #7c6af7',
                                backgroundColor: 'transparent',
                                color: added ? '#444' : '#7c6af7',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: added || isDownloading ? 'default' : 'pointer',
                                transition: 'all 0.12s',
                              }}
                              onMouseEnter={(e) => {
                                if (!added && !isDownloading) {
                                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#7c6af7'
                                  ;(e.currentTarget as HTMLButtonElement).style.color = '#fff'
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!added && !isDownloading) {
                                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                                  ;(e.currentTarget as HTMLButtonElement).style.color = '#7c6af7'
                                }
                              }}
                            >
                              {isDownloading
                                ? <Loader size={12} style={{ animation: 'spin 0.8s linear infinite' }} />
                                : added ? <Check size={12} /> : <Plus size={12} />
                              }
                            </button>
                          </div>
                        )
                      })}

                      {/* ── Built-in list (default) ── */}
                      {!isSearchMode && BUILT_IN_SOUNDS.map((sound) => {
                        const Icon = ICON_MAP[sound.icon] ?? Waves
                        const added = activeIds.has(sound.id)
                        const dlStatus = getStatus(sound.id)
                        const isDownloading = dlStatus === 'downloading'
                        const isError = dlStatus === 'error'

                        return (
                          <div
                            key={sound.id}
                            style={{ padding: '9px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '0.5px solid #222', transition: 'background 0.1s' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = '#252525' }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent' }}
                          >
                            <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: sound.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Icon size={14} color={sound.iconColor} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', color: added ? '#555' : '#d0d0d0' }}>{sound.name}</div>
                              <div style={{ fontSize: '11px', color: isError ? '#e24b4a' : '#444', marginTop: '1px' }}>
                                {isError ? 'Download failed' : isDownloading ? 'Downloading…' : sound.tag + (sound.bundled ? ' · bundled' : '')}
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddBuiltIn(sound)}
                              disabled={added || isDownloading}
                              style={{
                                width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
                                border: added ? '0.5px solid #2a2a2a' : isError ? '0.5px solid #e24b4a' : '0.5px solid #7c6af7',
                                backgroundColor: 'transparent',
                                color: added ? '#444' : isError ? '#e24b4a' : '#7c6af7',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: added || isDownloading ? 'default' : 'pointer',
                                transition: 'all 0.12s',
                              }}
                              onMouseEnter={(e) => {
                                if (!added && !isDownloading && !isError) {
                                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#7c6af7'
                                  ;(e.currentTarget as HTMLButtonElement).style.color = '#fff'
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!added && !isDownloading && !isError) {
                                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                                  ;(e.currentTarget as HTMLButtonElement).style.color = '#7c6af7'
                                }
                              }}
                            >
                              {isDownloading
                                ? <Loader size={12} style={{ animation: 'spin 0.8s linear infinite' }} />
                                : added ? <Check size={12} /> : <Plus size={12} />
                              }
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ApiKeysModal open={apiKeysOpen} onClose={() => setApiKeysOpen(false)} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
