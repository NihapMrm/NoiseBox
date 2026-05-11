import { Volume2 } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import { useSoundStore } from '../store/soundStore'
import { useTimer } from '../hooks/useTimer'

const GLASS: React.CSSProperties = {
  position: 'absolute',
  bottom: '16px',
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
  gap: '16px',
  zIndex: 100,
}

export function BottomBar() {
  const masterVol = useSettingsStore((s) => s.masterVol)
  const setMasterVol = useSettingsStore((s) => s.setMasterVol)
  const isPlaying = useSettingsStore((s) => s.isPlaying)
  const timerMode = useSettingsStore((s) => s.timerMode)
  const sounds = useSoundStore((s) => s.sounds)
  const activeCount = sounds.filter((s) => s.active).length
  const { secondsLeft, pomPhase, formatTime } = useTimer()

  return (
    <div style={GLASS}>
      {/* Master volume */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Volume2 size={14} color="#555" />
        <input
          type="range"
          min={0}
          max={100}
          value={masterVol}
          onChange={(e) => setMasterVol(Number(e.target.value))}
          style={{ width: '80px', accentColor: '#7c6af7', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '12px', color: '#666', width: '30px' }}>{masterVol}%</span>
      </div>

      {/* Timer */}
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
