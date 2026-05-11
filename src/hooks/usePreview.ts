import { useRef, useState, useCallback } from 'react'

export function usePreview() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    setPlayingId(null)
    setLoadingId(null)
  }, [])

  const toggle = useCallback((id: string, previewUrl: string) => {
    if (playingId === id) {
      stop()
      return
    }
    // Stop any current
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    setLoadingId(id)
    setPlayingId(null)

    const audio = new Audio(previewUrl)
    audio.volume = 0.7
    audioRef.current = audio

    audio.oncanplay = () => {
      audio.play()
      setLoadingId(null)
      setPlayingId(id)
    }
    audio.onended = () => { setPlayingId(null) }
    audio.onerror = () => { setLoadingId(null); setPlayingId(null) }
    audio.load()
  }, [playingId, stop])

  return { playingId, loadingId, toggle, stop }
}
