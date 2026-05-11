import { Volume2 } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import { useSoundStore } from '../store/soundStore'
import { useTimer } from '../hooks/useTimer'

export function BottomBar() {
  const masterVol = useSettingsStore((s) => s.masterVol)
  const setMasterVol = useSettingsStore((s) => s.setMasterVol)
  const isPlaying = useSettingsStore((s) => s.isPlaying)
  const timerMode = useSettingsStore((s) => s.timerMode)
  const sounds = useSoundStore((s) => s.sounds)
  const activeCount = sounds.filter((s) => s.active).length

  const { secondsLeft, pomPhase, formatTime } = useTimer()

  return (
    <div
      style={{
        height: '48px',
        backgroundColor: '#1e1e1e',
        borderTop: '0.5px solid #2a2a2a',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '16px',
        zIndex: 100,
        flexShrink: 0,
      }}
    >
      {/* Master volume */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Volume2 size={15} color="#555" />
        <input
          type="range"
          min={0}
          max={100}
          value={masterVol}
          onChange={(e) => setMasterVol(Number(e.target.value))}
          style={{ width: '80px', accentColor: '#7c6af7', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '12px', color: '#666', width: '32px' }}>{masterVol}%</span>
      </div>

      {/* Timer display */}
      {timerMode !== 'off' && secondsLeft > 0 && (
        <div style={{ fontSize: '12px', color: '#7c6af7' }}>
          {timerMode === 'pomodoro' && (
            <span style={{ color: '#555', marginRight: '4px' }}>
              {pomPhase === 'focus' ? 'Focus' : 'Break'} ·
            </span>
          )}
          {formatTime(secondsLeft)}
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isPlaying && activeCount > 0 ? '#7c6af7' : '#444',
            animation: isPlaying && activeCount > 0 ? 'pulse 2s ease-in-out infinite' : 'none',
          }}
        />
        <span style={{ fontSize: '12px', color: '#555' }}>
          {isPlaying && activeCount > 0 ? 'Playing' : 'Paused'} · {activeCount} active
        </span>
      </div>
    </div>
  )
}
