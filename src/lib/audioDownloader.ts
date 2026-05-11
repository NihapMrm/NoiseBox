import { invoke } from '@tauri-apps/api/core'
import { convertFileSrc } from '@tauri-apps/api/core'
import { SoundDefinition } from '../types'

let appDataDirCache: string | null = null

async function getAppDataDir(): Promise<string> {
  if (!appDataDirCache) {
    appDataDirCache = await invoke<string>('get_app_data_dir')
  }
  return appDataDirCache
}

function cachePath(dir: string, soundId: string, ext: string) {
  return `${dir}/sounds/${soundId}.${ext}`
}

// Check if a bundled sound file exists in the app's webview origin (public/sounds/).
// Returns the static src string if found, null otherwise.
async function getBundledSrc(soundId: string): Promise<string | null> {
  for (const ext of ['ogg', 'mp3']) {
    try {
      const res = await fetch(`/sounds/${soundId}.${ext}`, { method: 'HEAD' })
      if (res.ok) return `/sounds/${soundId}.${ext}`
    } catch {
      // ignore
    }
  }
  return null
}

// Check the user's app-data cache (lazy-downloaded sounds).
async function getCachedSrc(soundId: string): Promise<string | null> {
  const dir = await getAppDataDir()
  for (const ext of ['ogg', 'mp3']) {
    const path = cachePath(dir, soundId, ext)
    const exists = await invoke<boolean>('file_exists', { path })
    if (exists) return convertFileSrc(path)
  }
  return null
}

// ── Freesound ──────────────────────────────────────────────────────────────

async function downloadFromFreesound(
  sound: SoundDefinition,
  apiKey: string,
  dir: string
): Promise<string> {
  const metaUrl = `https://freesound.org/apiv2/sounds/${sound.freesoundId}/?token=${apiKey}`
  const rawMeta = await invoke<string>('fetch_text', { url: metaUrl })
  const meta = JSON.parse(rawMeta)

  const url: string =
    meta?.previews?.['preview-hq-ogg'] ??
    meta?.previews?.['preview-lq-ogg'] ??
    meta?.previews?.['preview-hq-mp3'] ??
    meta?.previews?.['preview-lq-mp3']
  if (!url) throw new Error('No preview URL in Freesound response')

  const ext = url.includes('.ogg') ? 'ogg' : 'mp3'
  const dest = cachePath(dir, sound.id, ext)
  await invoke('download_file', { url, destPath: dest })
  return convertFileSrc(dest)
}

// ── Pixabay ────────────────────────────────────────────────────────────────

async function downloadFromPixabay(
  sound: SoundDefinition,
  apiKey: string,
  dir: string
): Promise<string> {
  const q = encodeURIComponent(sound.pixabayQuery ?? sound.name)
  const searchUrl = `https://pixabay.com/api/audio/?key=${apiKey}&q=${q}&cat=sound_effects&per_page=5`
  const rawSearch = await invoke<string>('fetch_text', { url: searchUrl })
  const data = JSON.parse(rawSearch)

  const hit = data?.hits?.[0]
  if (!hit) throw new Error('No Pixabay results')

  const url: string = hit?.audio?.ogg ?? hit?.audio?.mp3 ?? hit?.previewURL
  if (!url) throw new Error('No audio URL in Pixabay response')

  const ext = url.includes('.ogg') ? 'ogg' : 'mp3'
  const dest = cachePath(dir, sound.id, ext)
  await invoke('download_file', { url, destPath: dest })
  return convertFileSrc(dest)
}

// ── Public entry point ─────────────────────────────────────────────────────

export async function ensureSoundCached(
  sound: SoundDefinition,
  freesoundApiKey: string,
  pixabayApiKey: string
): Promise<string> {
  // 1. Bundled asset? (public/sounds/ shipped with the app)
  if (sound.bundled) {
    const bundledSrc = await getBundledSrc(sound.id)
    if (bundledSrc) return bundledSrc
    // Bundled file missing (prebuild script not run) → fall through to API
  }

  // 2. Already in user's app-data cache?
  const cached = await getCachedSrc(sound.id)
  if (cached) return cached

  const dir = await getAppDataDir()

  // 3. Try Freesound
  if (freesoundApiKey && sound.freesoundId) {
    try {
      return await downloadFromFreesound(sound, freesoundApiKey, dir)
    } catch (e) {
      console.warn(`[Freesound] ${sound.id}:`, e)
    }
  }

  // 4. Try Pixabay
  if (pixabayApiKey && sound.pixabayQuery) {
    try {
      return await downloadFromPixabay(sound, pixabayApiKey, dir)
    } catch (e) {
      console.warn(`[Pixabay] ${sound.id}:`, e)
    }
  }

  throw new Error('No API key configured or all sources failed')
}

// Used at startup to resolve a bundled sound's src without a full download attempt.
// Returns the static path if the file is present, empty string if not.
export async function resolveBundledSrc(soundId: string): Promise<string> {
  return (await getBundledSrc(soundId)) ?? ''
}
