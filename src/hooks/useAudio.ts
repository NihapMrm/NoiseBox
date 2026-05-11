import { useEffect, useRef } from 'react'
import { useSoundStore } from '../store/soundStore'
import { useSettingsStore } from '../store/settingsStore'
import * as engine from '../audio/engine'

export function useAudio() {
  const sounds = useSoundStore((s) => s.sounds)
  const masterVol = useSettingsStore((s) => s.masterVol)
  const isPlaying = useSettingsStore((s) => s.isPlaying)
  const prevSoundsRef = useRef<typeof sounds>([])
  const prevPlayingRef = useRef(false)

  useEffect(() => {
    const prev = prevSoundsRef.current

    sounds.forEach((sound) => {
      if (!sound.src) return  // not yet downloaded

      const prevSound = prev.find((p) => p.id === sound.id)
      const effectiveVol = (masterVol / 100) * sound.vol

      if (!prevSound) {
        if (sound.active && isPlaying) {
          engine.playSound(sound.id, sound.src, effectiveVol)
        }
        return
      }

      if (!prevSound.active && sound.active && isPlaying) {
        engine.playSound(sound.id, sound.src, effectiveVol)
        return
      }

      if (prevSound.active && !sound.active) {
        engine.stopSound(sound.id)
        return
      }

      // src just became available (download finished)
      if (!prevSound.src && sound.src && sound.active && isPlaying) {
        engine.playSound(sound.id, sound.src, effectiveVol)
        return
      }

      if (sound.active && prevSound.vol !== sound.vol) {
        engine.setVolume(sound.id, effectiveVol)
      }
    })

    // Removed sounds → stop audio
    prev.forEach((prevSound) => {
      if (!sounds.find((s) => s.id === prevSound.id)) {
        engine.stopSound(prevSound.id)
      }
    })

    prevSoundsRef.current = sounds
  }, [sounds, masterVol, isPlaying])

  useEffect(() => {
    if (prevPlayingRef.current === isPlaying) return
    prevPlayingRef.current = isPlaying

    if (isPlaying) {
      sounds.forEach((sound) => {
        if (sound.active && sound.src) {
          const effectiveVol = (masterVol / 100) * sound.vol
          engine.playSound(sound.id, sound.src, effectiveVol)
        }
      })
    } else {
      engine.pauseAll()
    }
  }, [isPlaying, sounds, masterVol])

  useEffect(() => {
    engine.setMasterVolume(masterVol, sounds)
  }, [masterVol, sounds])
}
