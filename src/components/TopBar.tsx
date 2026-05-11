import { useState } from 'react'
import { Radio, Clock, Play, Pause, Key } from 'lucide-react'
import { usePresetStore } from '../store/presetStore'
import { useSettingsStore } from '../store/settingsStore'
import { PresetModal } from './PresetModal'
import { TimerModal } from './TimerModal'
import { ApiKeysModal } from './ApiKeysModal'

const GLASS: React.CSSProperties = {
  position: 'absolute',
  top: '16px',
  left: '10%',
  width: '80%',
  height: '48px',
  backgroundColor: 'rgba(16, 16, 16, 0.72)',
  backdropFilter: 'blur(20px) saturate(160%)',
  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
  border: '0.5px solid rgba(255, 255, 255, 0.07)',
  borderRadius: '14px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.45), inset 0 0.5px 0 rgba(255,255,255,0.04)',
  display: 'flex',
  alignItems: 'center',
  padding: '0 16px',
  gap: '12px',
  zIndex: 100,
}

export function TopBar() {
  const [presetModalOpen, setPresetModalOpen] = useState(false)
  const [timerModalOpen, setTimerModalOpen] = useState(false)
  const [apiKeysOpen, setApiKeysOpen] = useState(false)

  const presets = usePresetStore((s) => s.presets)
  const activePresetId = usePresetStore((s) => s.activePresetId)
  const setActivePresetId = usePresetStore((s) => s.setActivePresetId)
  const isPlaying = useSettingsStore((s) => s.isPlaying)
  const setIsPlaying = useSettingsStore((s) => s.setIsPlaying)
  const timerMode = useSettingsStore((s) => s.timerMode)
  const freesoundApiKey = useSettingsStore((s) => s.freesoundApiKey)
  const pixabayApiKey = useSettingsStore((s) => s.pixabayApiKey)
  const noKeys = !freesoundApiKey && !pixabayApiKey

  return (
    <>
      <div style={GLASS}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
          <Radio size={18} color="#7c6af7" />
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#e0e0e0' }}>Noisebox</span>
        </div>

        {/* Separator */}
        <div style={{ width: '0.5px', height: '20px', backgroundColor: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

        {/* Preset pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', flex: 1, scrollbarWidth: 'none' }}>
          {presets.map((preset) => {
            const isActive = preset.id === activePresetId
            return (
              <button
                key={preset.id}
                onClick={() => setActivePresetId(isActive ? null : preset.id)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '6px',
                  border: `0.5px solid ${isActive ? '#7c6af7' : 'rgba(255,255,255,0.08)'}`,
                  backgroundColor: isActive ? '#2d2540' : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#c4b8ff' : '#888',
                  fontSize: '12px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
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
              </button>
            )
          })}
          <button
            onClick={() => setPresetModalOpen(true)}
            style={{
              padding: '3px 10px',
              borderRadius: '6px',
              border: '0.5px solid rgba(255,255,255,0.08)',
              backgroundColor: 'transparent',
              color: '#888',
              fontSize: '12px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            + Save
          </button>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
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

      <PresetModal open={presetModalOpen} onClose={() => setPresetModalOpen(false)} />
      <TimerModal open={timerModalOpen} onClose={() => setTimerModalOpen(false)} />
      <ApiKeysModal open={apiKeysOpen} onClose={() => setApiKeysOpen(false)} />
    </>
  )
}
