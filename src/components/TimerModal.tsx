import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import { useTimer } from '../hooks/useTimer'

interface TimerModalProps {
  open: boolean
  onClose: () => void
}

const SLEEP_PRESETS = [15, 30, 45, 60, 90]

export function TimerModal({ open, onClose }: TimerModalProps) {
  const [tab, setTab] = useState<'sleep' | 'pomodoro'>('sleep')
  const [customMinutes, setCustomMinutes] = useState('')
  const [focusMinutes, setFocusMinutes] = useState(25)

  const setTimerMode = useSettingsStore((s) => s.setTimerMode)
  const setTimerMinutes = useSettingsStore((s) => s.setTimerMinutes)
  const timerMode = useSettingsStore((s) => s.timerMode)
  const { startSleep, startPomodoro } = useTimer()

  function handleStartSleep(minutes: number) {
    setTimerMode('sleep')
    setTimerMinutes(minutes)
    startSleep(minutes)
    onClose()
  }

  function handleStartPomodoro() {
    setTimerMode('pomodoro')
    setTimerMinutes(focusMinutes)
    startPomodoro(focusMinutes)
    onClose()
  }

  function handleStop() {
    setTimerMode('off')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 500,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            style={{
              backgroundColor: '#1e1e1e',
              border: '0.5px solid #333',
              borderRadius: '12px',
              padding: '20px',
              width: '300px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                {(['sleep', 'pomodoro'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: tab === t ? '#d0d0d0' : '#555',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      textTransform: 'capitalize',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
                <X size={16} />
              </button>
            </div>

            {tab === 'sleep' ? (
              <div>
                <p style={{ fontSize: '12px', color: '#555', marginBottom: '12px' }}>Stop audio after:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {SLEEP_PRESETS.map((m) => (
                    <button
                      key={m}
                      onClick={() => handleStartSleep(m)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '0.5px solid #333',
                        backgroundColor: '#252525',
                        color: '#d0d0d0',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    placeholder="Custom min"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    style={{
                      flex: 1,
                      backgroundColor: '#252525',
                      border: '0.5px solid #333',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      color: '#d0d0d0',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => {
                      const m = parseInt(customMinutes)
                      if (m > 0) handleStartSleep(m)
                    }}
                    style={{
                      backgroundColor: '#7c6af7',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      color: '#fff',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Start
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '6px' }}>Focus duration (min)</label>
                  <input
                    type="number"
                    value={focusMinutes}
                    onChange={(e) => setFocusMinutes(Math.max(1, parseInt(e.target.value) || 25))}
                    style={{
                      width: '80px',
                      backgroundColor: '#252525',
                      border: '0.5px solid #333',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      color: '#d0d0d0',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
                <p style={{ fontSize: '12px', color: '#555', marginBottom: '12px' }}>Break: 5 min (auto)</p>
                <button
                  onClick={handleStartPomodoro}
                  style={{
                    width: '100%',
                    backgroundColor: '#7c6af7',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px',
                    color: '#fff',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Start Pomodoro
                </button>
              </div>
            )}

            {timerMode !== 'off' && (
              <button
                onClick={handleStop}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  backgroundColor: 'transparent',
                  border: '0.5px solid #333',
                  borderRadius: '6px',
                  padding: '7px',
                  color: '#888',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Stop timer
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
