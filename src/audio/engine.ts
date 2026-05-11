import { Howl } from 'howler'

const instances: Record<string, Howl> = {}
// Track whether each instance was created with spatial audio (Web Audio API)
const instanceSpatial: Record<string, boolean> = {}

export function playSound(id: string, src: string, volume: number, spatialAudio = false) {
  if (instances[id]) {
    // If spatial mode doesn't match, tear down and recreate
    if (instanceSpatial[id] !== spatialAudio) {
      instances[id].stop()
      instances[id].unload()
      delete instances[id]
      delete instanceSpatial[id]
      // fall through to create new instance
    } else {
      instances[id].volume(volume / 100)
      if (!instances[id].playing()) instances[id].play()
      return
    }
  }
  instanceSpatial[id] = spatialAudio
  instances[id] = new Howl({
    src: [src],
    loop: true,
    volume: volume / 100,
    autoplay: true,
    html5: !spatialAudio, // Web Audio API required for stereo panning
  })
}

export function stopSound(id: string) {
  if (instances[id]) {
    instances[id].fade(instances[id].volume(), 0, 600)
    setTimeout(() => {
      instances[id]?.stop()
      instances[id]?.unload()
      delete instances[id]
      delete instanceSpatial[id]
    }, 650)
  }
}

export function setVolume(id: string, volume: number) {
  instances[id]?.volume(volume / 100)
}

// Stereo pan: -1 (full left) → 0 (center) → 1 (full right).
// Only works when instance was created with spatialAudio=true (Web Audio API).
export function setStereo(id: string, pan: number) {
  try {
    instances[id]?.stereo(Math.max(-1, Math.min(1, pan)))
  } catch {
    // Silently fail if not supported (html5 mode)
  }
}

export function setMasterVolume(masterVol: number, sounds: Array<{ id: string; vol: number; active: boolean }>) {
  sounds.forEach(({ id, vol, active }) => {
    if (active && instances[id]) {
      instances[id].volume((masterVol / 100) * (vol / 100))
    }
  })
}

export function fadeIn(id: string, targetVol: number) {
  const h = instances[id]
  if (!h) return
  h.fade(0, targetVol / 100, 400)
}

export function fadeOut(id: string) {
  const h = instances[id]
  if (!h) return
  h.fade(h.volume(), 0, 600)
  setTimeout(() => { h.pause() }, 650)
}

export function stopAll() {
  Object.keys(instances).forEach(stopSound)
}

export function pauseAll() {
  Object.values(instances).forEach(h => h.pause())
}

export function resumeAll() {
  Object.values(instances).forEach(h => { if (!h.playing()) h.play() })
}
