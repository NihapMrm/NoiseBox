import { Howl } from 'howler'

const instances: Record<string, Howl> = {}

export function playSound(id: string, src: string, volume: number) {
  if (instances[id]) {
    instances[id].volume(volume / 100)
    if (!instances[id].playing()) instances[id].play()
    return
  }
  instances[id] = new Howl({
    src: [src],
    loop: true,
    volume: volume / 100,
    autoplay: true,
    html5: true,
  })
}

export function stopSound(id: string) {
  if (instances[id]) {
    instances[id].fade(instances[id].volume(), 0, 600)
    setTimeout(() => {
      instances[id]?.stop()
      instances[id]?.unload()
      delete instances[id]
    }, 650)
  }
}

export function setVolume(id: string, volume: number) {
  instances[id]?.volume(volume / 100)
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
