import { useEffect, useRef, useState } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { pauseAll } from '../audio/engine'

export function useTimer() {
  const timerMode = useSettingsStore((s) => s.timerMode)
  const setTimerMode = useSettingsStore((s) => s.setTimerMode)
  const setIsPlaying = useSettingsStore((s) => s.setIsPlaying)

  const [secondsLeft, setSecondsLeft] = useState(0)
    const [pomPhase, setPomPhase] = useState<'focus' | 'break'>('focus')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const startSleep = (minutes: number) => {
    clearTimer()
    setSecondsLeft(minutes * 60)
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimer()
          setTimerMode('off')
          setIsPlaying(false)
          pauseAll()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startPomodoro = (focusMinutes: number) => {
    clearTimer()
    setPomPhase('focus')
    setSecondsLeft(focusMinutes * 60)
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setPomPhase((phase) => {
            const next = phase === 'focus' ? 'break' : 'focus'
            setSecondsLeft(next === 'focus' ? focusMinutes * 60 : 5 * 60)
            if (next === 'break') {
              setIsPlaying(false)
              pauseAll()
            } else {
              setIsPlaying(true)
            }
            return next
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    if (timerMode === 'off') {
      clearTimer()
      setSecondsLeft(0)
    }
    return clearTimer
  }, [timerMode])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return { secondsLeft, pomPhase, formatTime, startSleep, startPomodoro }
}
