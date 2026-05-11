import { useState } from 'react'
import { Radio, Clock, Play, Pause, Key } from 'lucide-react'
import { usePresetStore } from '../store/presetStore'
import { useSettingsStore } from '../store/settingsStore'
import { PresetModal } from './PresetModal'
import { TimerModal } from './TimerModal'
import { ApiKeysModal } from './ApiKeysModal'

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
      <div
        style={{
          height: '48px',
          backgroundColor: '#1e1e1e',
          borderBottom: '0.5px solid #2a2a2a',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '12px',
          zIndex: 100,
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
          <Radio size={18} color="#7c6af7" />
          <span style={{ fontSize: '15px', fontWeight: 500, color: '#e0e0e0' }}>Noisebox</span>
        </div>

        {/* Separator */}
        <div style={{ width: '0.5px', height: '24px', backgroundColor: '#2a2a2a', flexShrink: 0 }} />

        {/* Preset pills */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', flex: 1, scrollbarWidth: 'none' }}>
          {presets.map((preset) => {
            const isActive = preset.id === activePresetId
            return (
              <button
                key={preset.id}
                onClick={() => setActivePresetId(isActive ? null : preset.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: `0.5px solid ${isActive ? '#7c6af7' : '#333'}`,
                  backgroundColor: isActive ? '#2d2540' : '#252525',
                  color: isActive ? '#c4b8ff' : '#888',
                  fontSize: '12px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  transition: 'border-color 0.15s, background-color 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#7c6af7'
                    ;(e.currentTarget as HTMLButtonElement).style.color = '#bbb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#333'
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
              padding: '4px 10px',
              borderRadius: '6px',
              border: '0.5px solid #333',
              backgroundColor: 'transparent',
              color: '#888',
              fontSize: '12px',
              cursor: 'pointer',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            + Save
          </button>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* API keys button — red dot when no keys set */}
          <button
            onClick={() => setApiKeysOpen(true)}
            title="API Keys"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: `0.5px solid ${noKeys ? '#e24b4a44' : '#2a2a2a'}`,
              backgroundColor: 'transparent',
              color: noKeys ? '#e24b4a' : '#555',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s',
            }}
          >
            <Key size={14} />
            {noKeys && (
              <div style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#e24b4a',
              }} />
            )}
          </button>

          <button
            onClick={() => setTimerModalOpen(true)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: `0.5px solid ${timerMode !== 'off' ? '#7c6af7' : '#2a2a2a'}`,
              backgroundColor: timerMode !== 'off' ? '#2d2540' : 'transparent',
              color: timerMode !== 'off' ? '#7c6af7' : '#555',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <Clock size={16} />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#7c6af7',
              border: 'none',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#6a58e0' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#7c6af7' }}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>
        </div>
      </div>

      <PresetModal open={presetModalOpen} onClose={() => setPresetModalOpen(false)} />
      <TimerModal open={timerModalOpen} onClose={() => setTimerModalOpen(false)} />
      <ApiKeysModal open={apiKeysOpen} onClose={() => setApiKeysOpen(false)} />
    </>
  )
}
