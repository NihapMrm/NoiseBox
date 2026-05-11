import { useEffect } from 'react'
import { TopBar } from './components/TopBar'
import { Canvas } from './components/Canvas'
import { BottomBar } from './components/BottomBar'
import { useAudio } from './hooks/useAudio'
import { usePresetStore } from './store/presetStore'
import { useSoundStore } from './store/soundStore'
import { useSettingsStore } from './store/settingsStore'
import { useDownloadedSoundsStore, DownloadedSound } from './store/downloadedSoundsStore'
import { loadAllPresets } from './lib/presets'
import { resolveBundledSrc } from './lib/audioDownloader'
import { BUNDLED_SOUNDS } from './audio/sounds'
import { ActiveSound } from './types'
import { LazyStore } from '@tauri-apps/plugin-store'

const settingsStore = new LazyStore('settings.json')
const downloadsStore = new LazyStore('downloads.json')

// Cards start at y=88 to clear the floating TopBar (top:16 + height:48 + gap:24)
const DEFAULT_POSITIONS: [number, number][] = [
  [44,  88],  [244, 88],  [444, 88],  [644, 88],
  [44,  268], [244, 268], [444, 268],
  [44,  448], [244, 448], [444, 448],
]

export default function App() {
  useAudio()

  const setPresets = usePresetStore((s) => s.setPresets)
  const loadSounds = useSoundStore((s) => s.loadSounds)
  const setFreesoundApiKey = useSettingsStore((s) => s.setFreesoundApiKey)
  const setPixabayApiKey = useSettingsStore((s) => s.setPixabayApiKey)
  const setAllDownloaded = useDownloadedSoundsStore((s) => s.setAll)

  useEffect(() => {
    async function init() {
      const [fsKey, pbKey, savedDownloads] = await Promise.all([
        settingsStore.get<string>('freesoundApiKey').catch(() => null),
        settingsStore.get<string>('pixabayApiKey').catch(() => null),
        downloadsStore.get<DownloadedSound[]>('list').catch(() => null),
      ])
      if (fsKey) setFreesoundApiKey(fsKey)
      if (pbKey) setPixabayApiKey(pbKey)
      if (savedDownloads?.length) setAllDownloaded(savedDownloads)

      loadAllPresets().then(setPresets).catch(() => {})

      const hasLaunched = await settingsStore.get<boolean>('hasLaunched').catch(() => null)
      if (!hasLaunched) {
        await settingsStore.set('hasLaunched', true)
        await settingsStore.save()
        const defaultSounds: ActiveSound[] = await Promise.all(
          BUNDLED_SOUNDS.map(async (s, i) => ({
            ...s,
            src: await resolveBundledSrc(s.id),
            vol: 70,
            active: false,
            x: DEFAULT_POSITIONS[i]?.[0] ?? 44 + i * 200,
            y: DEFAULT_POSITIONS[i]?.[1] ?? 88,
          }))
        )
        loadSounds(defaultSounds)
      }
    }
    init()
  }, [setPresets, loadSounds, setFreesoundApiKey, setPixabayApiKey, setAllDownloaded])

  return (
    <div
      style={{
        position: 'relative',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
      }}
    >
      <Canvas />
      <TopBar />
      <BottomBar />
    </div>
  )
}
