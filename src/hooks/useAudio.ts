import { useEffect, useRef } from 'react'
import { useSoundStore } from '../store/soundStore'
import { useSettingsStore } from '../store/settingsStore'
import * as engine from '../audio/engine'

export function useAudio() {
  const sounds = useSoundStore((s) => s.sounds)
  const masterVol = useSettingsStore((s) => s.masterVol)
  const isPlaying = useSettingsStore((s) => s.isPlaying)
  const spatialAudio = useSettingsStore((s) => s.spatialAudio)

  const prevSoundsRef = useRef<typeof sounds>([])
  const prevPlayingRef = useRef(false)
  const prevSpatialRef = useRef(spatialAudio)

  useEffect(() => {
    const prev = prevSoundsRef.current
    const spatialChanged = prevSpatialRef.current !== spatialAudio
    prevSpatialRef.current = spatialAudio

    sounds.forEach((sound) => {
      if (!sound.src) return

      const prevSound = prev.find((p) => p.id === sound.id)
      const effectiveVol = (masterVol / 100) * sound.vol

      // New sound, OR spatial mode just changed (force recreate via engine)
      if (!prevSound || spatialChanged) {
        if (sound.active && isPlaying) {
          engine.playSound(sound.id, sound.src, effectiveVol, spatialAudio)
        }
        return
      }

      if (!prevSound.active && sound.active && isPlaying) {
        engine.playSound(sound.id, sound.src, effectiveVol, spatialAudio)
        return
      }

      if (prevSound.active && !sound.active) {
        engine.stopSound(sound.id)
        return
      }

      // src just became available after download
      if (!prevSound.src && sound.src && sound.active && isPlaying) {
        engine.playSound(sound.id, sound.src, effectiveVol, spatialAudio)
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
  }, [sounds, masterVol, isPlaying, spatialAudio])

  useEffect(() => {
    if (prevPlayingRef.current === isPlaying) return
    prevPlayingRef.current = isPlaying

    if (isPlaying) {
      sounds.forEach((sound) => {
        if (sound.active && sound.src) {
          const effectiveVol = (masterVol / 100) * sound.vol
          engine.playSound(sound.id, sound.src, effectiveVol, spatialAudio)
        }
      })
    } else {
      engine.pauseAll()
    }
  }, [isPlaying, sounds, masterVol, spatialAudio])

  useEffect(() => {
    engine.setMasterVolume(masterVol, sounds)
  }, [masterVol, sounds])
}
