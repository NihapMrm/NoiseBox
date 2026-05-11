import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Radio, Clock, Play, Pause, Key, MoreHorizontal, Plus, Circle, Grid3X3 } from 'lucide-react'
import { usePresetStore } from '../store/presetStore'
import { useSettingsStore } from '../store/settingsStore'
import { useSoundStore } from '../store/soundStore'
import { PresetModal } from './PresetModal'
import { TimerModal } from './TimerModal'
import { ApiKeysModal } from './ApiKeysModal'
import { Preset, ActiveSound } from '../types'
import { savePreset } from '../lib/presets'

const GLASS: React.CSSProperties = {
  position: 'absolute',
  top: '16px',
  left: '10%',
  width: '80%',
  height: '48px',
  backgroundColor: 'rgba(14, 14, 18, 0.55)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '0.5px solid rgba(255, 255, 255, 0.11)',
  borderRadius: '14px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
  display: 'flex',
  alignItems: 'center',
  padding: '0 16px',
  gap: '12px',
  zIndex: 100,
}

const VISIBLE_COUNT = 4

function isDirtyCheck(current: ActiveSound[], snapshot: ActiveSound[]): boolean {
  if (current.length !== snapshot.length) return true
  const snapMap = new Map(snapshot.map((s) => [s.id, s]))
  for (const s of current) {
    const snap = snapMap.get(s.id)
    if (!snap) return true
    if (snap.vol !== s.vol || snap.x !== s.x || snap.y !== s.y || snap.active !== s.active) return true
  }
  return false
}

export function TopBar() {
  const [presetModalOpen, setPresetModalOpen] = useState(false)
  const [presetModalView, setPresetModalView] = useState<'save' | 'manage'>('save')
  const [timerModalOpen, setTimerModalOpen] = useState(false)
  const [apiKeysOpen, setApiKeysOpen] = useState(false)
  const [overflowOpen, setOverflowOpen] = useState(false)
  const overflowRef = useRef<HTMLDivElement>(null)

  const presets = usePresetStore((s) => s.presets)
  const activePresetId = usePresetStore((s) => s.activePresetId)
  const savedSnapshot = usePresetStore((s) => s.savedSnapshot)
  const setActivePresetId = usePresetStore((s) => s.setActivePresetId)
  const setSnapshot = usePresetStore((s) => s.setSnapshot)
  const updatePreset = usePresetStore((s) => s.updatePreset)

  const sounds = useSoundStore((s) => s.sounds)
  const loadSounds = useSoundStore((s) => s.loadSounds)
  const clearSounds = useSoundStore((s) => s.clearSounds)

  const masterVol = useSettingsStore((s) => s.masterVol)
  const isPlaying = useSettingsStore((s) => s.isPlaying)
  const setIsPlaying = useSettingsStore((s) => s.setIsPlaying)
  const timerMode = useSettingsStore((s) => s.timerMode)
  const freesoundApiKey = useSettingsStore((s) => s.freesoundApiKey)
  const pixabayApiKey = useSettingsStore((s) => s.pixabayApiKey)
  const playgroundMode = useSettingsStore((s) => s.playgroundMode)
  const setPlaygroundMode = useSettingsStore((s) => s.setPlaygroundMode)
  const noKeys = !freesoundApiKey && !pixabayApiKey

  const visiblePresets = presets.slice(0, VISIBLE_COUNT)
  const overflowPresets = presets.slice(VISIBLE_COUNT)

  const isDirty = useMemo(() => {
    if (!activePresetId || !savedSnapshot) return false
    return isDirtyCheck(sounds, savedSnapshot)
  }, [sounds, savedSnapshot, activePresetId])

  // Active preset is in overflow — dot on the "..." button
  const activeIsOverflow = overflowPresets.some((p) => p.id === activePresetId)

  // Close overflow on outside click
  useEffect(() => {
    if (!overflowOpen) return
    const handler = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setOverflowOpen(false)
      }
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [overflowOpen])

  function switchToPreset(preset: Preset) {
    loadSounds(preset.sounds)
    setActivePresetId(preset.id)
    setSnapshot([...preset.sounds])
    setOverflowOpen(false)
  }

  function handleNewPreset() {
    clearSounds()
    setActivePresetId(null)
    setSnapshot(null)
  }

  const handleSave = useCallback(async () => {
    if (!activePresetId) {
      setPresetModalView('save')
      setPresetModalOpen(true)
      return
    }
    if (!isDirty) return
    const preset = presets.find((p) => p.id === activePresetId)
    if (!preset) return
    const updated: Preset = { ...preset, sounds: [...sounds], masterVol }
    await savePreset(updated)
    updatePreset(updated)
    setSnapshot([...sounds])
  }, [activePresetId, isDirty, presets, sounds, masterVol, updatePreset, setSnapshot])

  // Ctrl+S / Cmd+S
  const handleSaveRef = useRef(handleSave)
  handleSaveRef.current = handleSave
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSaveRef.current()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const PILL: React.CSSProperties = {
    position: 'relative',
    padding: '3px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  }

  return (
    <>
      <div style={GLASS}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
          <Radio size={18} color="#7c6af7" />
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#e0e0e0' }}>Noisebox</span>
        </div>

        <div style={{ width: '0.5px', height: '20px', backgroundColor: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* Preset area */}
        <div style={{ display: 'flex', gap: '6px', flex: 1, minWidth: 0, alignItems: 'center' }}>

          {/* Visible preset pills (first 4) */}
          {visiblePresets.map((preset) => {
            const isActive = preset.id === activePresetId
            const showDot = isActive && isDirty
            return (
              <button
                key={preset.id}
                onClick={() => switchToPreset(preset)}
                style={{
                  ...PILL,
                  border: `0.5px solid ${isActive ? '#7c6af7' : 'rgba(255,255,255,0.08)'}`,
                  backgroundColor: isActive ? '#2d2540' : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#c4b8ff' : '#888',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#7c6af7'
                    ;(e.currentTarget as HTMLButtonElement).style.color = '#bbb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = '#888'
                  }
                }}
              >
                {preset.name}
                {showDot && (
                  <span style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#7c6af7',
                    border: '1.5px solid rgba(14,14,18,0.8)',
                    display: 'block',
                  }} />
                )}
              </button>
            )
          })}

          {/* Overflow "..." button */}
          {overflowPresets.length > 0 && (
            <div ref={overflowRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => setOverflowOpen((v) => !v)}
                style={{
                  ...PILL,
                  padding: '3px 7px',
                  border: `0.5px solid ${overflowOpen || (activeIsOverflow && isDirty) ? '#7c6af7' : 'rgba(255,255,255,0.08)'}`,
                  backgroundColor: overflowOpen ? '#2d2540' : 'rgba(255,255,255,0.04)',
                  color: overflowOpen ? '#c4b8ff' : '#777',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <MoreHorizontal size={13} />
                {/* dot when active preset is hidden in overflow */}
                {activeIsOverflow && isDirty && (
                  <span style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#7c6af7',
                    border: '1.5px solid rgba(14,14,18,0.8)',
                    display: 'block',
                  }} />
                )}
              </button>

              {overflowOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  backgroundColor: '#1a1a1a',
                  border: '0.5px solid #333',
                  borderRadius: '10px',
                  padding: '4px 0',
                  minWidth: '160px',
                  zIndex: 300,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                }}>
                  {overflowPresets.map((preset) => {
                    const isActive = preset.id === activePresetId
                    const showDot = isActive && isDirty
                    return (
                      <button
                        key={preset.id}
                        onClick={() => switchToPreset(preset)}
                        style={{
                          width: '100%',
                          padding: '7px 12px 7px 10px',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          color: isActive ? '#c4b8ff' : '#bbb',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px',
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#242424' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
                      >
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: showDot ? '#7c6af7' : 'transparent',
                          flexShrink: 0,
                          display: 'inline-block',
                        }} />
                        {preset.name}
                      </button>
                    )
                  })}
                  <div style={{ height: '0.5px', backgroundColor: '#2a2a2a', margin: '4px 0' }} />
                  <button
                    onClick={() => { setOverflowOpen(false); setPresetModalView('manage'); setPresetModalOpen(true) }}
                    style={{
                      width: '100%',
                      padding: '7px 12px',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      color: '#555',
                      fontSize: '11px',
                      cursor: 'pointer',
                      letterSpacing: '0.02em',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#888' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#555' }}
                  >
                    Manage presets…
                  </button>
                </div>
              )}
            </div>
          )}

          {/* New empty preset */}
          <button
            onClick={handleNewPreset}
            title="New empty preset (clears canvas)"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              border: '0.5px solid rgba(255,255,255,0.07)',
              backgroundColor: 'transparent',
              color: '#555',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#7c6af7'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#7c6af7'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#555'
            }}
          >
            <Plus size={12} />
          </button>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* Playground mode toggle */}
          <button
            onClick={() => setPlaygroundMode(playgroundMode === 'classic' ? 'orbit' : 'classic')}
            title={playgroundMode === 'classic' ? 'Switch to Orbit playground' : 'Switch to Classic playground'}
            style={{
              width: '30px', height: '30px', borderRadius: '8px',
              border: `0.5px solid ${playgroundMode === 'orbit' ? '#7c6af7' : 'rgba(255,255,255,0.08)'}`,
              backgroundColor: playgroundMode === 'orbit' ? '#2d2540' : 'transparent',
              color: playgroundMode === 'orbit' ? '#c4b5fd' : '#555',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {playgroundMode === 'orbit' ? <Grid3X3 size={13} /> : <Circle size={13} />}
          </button>

          <button
            onClick={() => setApiKeysOpen(true)}
            title="API Keys"
            style={{
              width: '30px', height: '30px', borderRadius: '8px',
              border: `0.5px solid ${noKeys ? 'rgba(226,75,74,0.4)' : 'rgba(255,255,255,0.08)'}`,
              backgroundColor: 'transparent',
              color: noKeys ? '#e24b4a' : '#555',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative',
            }}
          >
            <Key size={13} />
            {noKeys && (
              <div style={{ position: 'absolute', top: '5px', right: '5px', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#e24b4a' }} />
            )}
          </button>

          <button
            onClick={() => setTimerModalOpen(true)}
            style={{
              width: '30px', height: '30px', borderRadius: '8px',
              border: `0.5px solid ${timerMode !== 'off' ? '#7c6af7' : 'rgba(255,255,255,0.08)'}`,
              backgroundColor: timerMode !== 'off' ? '#2d2540' : 'transparent',
              color: timerMode !== 'off' ? '#7c6af7' : '#555',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Clock size={15} />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              width: '30px', height: '30px', borderRadius: '8px',
              backgroundColor: '#7c6af7',
              border: 'none',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#6a58e0' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#7c6af7' }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>
      </div>

      <PresetModal
        open={presetModalOpen}
        onClose={() => setPresetModalOpen(false)}
        initialView={presetModalView}
      />
      <TimerModal open={timerModalOpen} onClose={() => setTimerModalOpen(false)} />
      <ApiKeysModal open={apiKeysOpen} onClose={() => setApiKeysOpen(false)} />
    </>
  )
}
