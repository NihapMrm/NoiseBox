import { useEffect } from 'react'
import { TopBar } from './components/TopBar'
import { Canvas } from './components/Canvas'
import { BottomBar } from './components/BottomBar'
import { useAudio } from './hooks/useAudio'
import { usePresetStore } from './store/presetStore'
import { useSoundStore } from './store/soundStore'
import { useSettingsStore } from './store/settingsStore'
import { loadAllPresets } from './lib/presets'
import { resolveBundledSrc } from './lib/audioDownloader'
import { BUNDLED_SOUNDS } from './audio/sounds'
import { ActiveSound } from './types'
import { LazyStore } from '@tauri-apps/plugin-store'

const settingsStore = new LazyStore('settings.json')

// Positions for 10 default cards in a 4-3-3 grid layout
const DEFAULT_POSITIONS: [number, number][] = [
  [44,  44],  [244, 44],  [444, 44],  [644, 44],
  [44,  224], [244, 224], [444, 224],
  [44,  404], [244, 404], [444, 404],
]

export default function App() {
  useAudio()

  const setPresets = usePresetStore((s) => s.setPresets)
  const loadSounds = useSoundStore((s) => s.loadSounds)
  const setFreesoundApiKey = useSettingsStore((s) => s.setFreesoundApiKey)
  const setPixabayApiKey = useSettingsStore((s) => s.setPixabayApiKey)

  useEffect(() => {
    async function init() {
      // Restore API keys
      const [fsKey, pbKey] = await Promise.all([
        settingsStore.get<string>('freesoundApiKey').catch(() => null),
        settingsStore.get<string>('pixabayApiKey').catch(() => null),
      ])
      if (fsKey) setFreesoundApiKey(fsKey)
      if (pbKey) setPixabayApiKey(pbKey)

      // Restore presets
      loadAllPresets().then(setPresets).catch(() => {})

      // First-launch default canvas
      const hasLaunched = await settingsStore.get<boolean>('hasLaunched').catch(() => null)
      if (!hasLaunched) {
        await settingsStore.set('hasLaunched', true)
        await settingsStore.save()

        // Resolve src for each bundled sound (empty string if file not present yet)
        const defaultSounds: ActiveSound[] = await Promise.all(
          BUNDLED_SOUNDS.map(async (s, i) => ({
            ...s,
            src: await resolveBundledSrc(s.id),
            vol: 70,
            active: false,
            x: DEFAULT_POSITIONS[i]?.[0] ?? 44 + i * 200,
            y: DEFAULT_POSITIONS[i]?.[1] ?? 44,
          }))
        )
        loadSounds(defaultSounds)
      }
    }

    init()
  }, [setPresets, loadSounds, setFreesoundApiKey, setPixabayApiKey])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#161616',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      <TopBar />
      <Canvas />
      <BottomBar />
    </div>
  )
}
