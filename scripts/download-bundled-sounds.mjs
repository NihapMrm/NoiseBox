/**
 * Downloads the 10 bundled sounds from Freesound (primary) or Pixabay (fallback).
 * Run once before building: pnpm download-sounds
 *
 * Usage:
 *   FREESOUND_API_KEY=xxx pnpm download-sounds
 *   PIXABAY_API_KEY=xxx pnpm download-sounds
 *   FREESOUND_API_KEY=xxx PIXABAY_API_KEY=yyy pnpm download-sounds
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dir, '..', 'public', 'sounds')

const FREESOUND_KEY = process.env.FREESOUND_API_KEY ?? ''
const PIXABAY_KEY   = process.env.PIXABAY_API_KEY ?? ''

const BUNDLED = [
  { id: 'rain',     freesoundId: 401722, pixabayQuery: 'rain' },
  { id: 'birds',    freesoundId: 473151, pixabayQuery: 'birds chirping' },
  { id: 'ocean',    freesoundId: 415758, pixabayQuery: 'ocean waves' },
  { id: 'forest',   freesoundId: 490513, pixabayQuery: 'forest nature ambience' },
  { id: 'fire',     freesoundId: 386752, pixabayQuery: 'fireplace crackling' },
  { id: 'cafe',     freesoundId: 205966, pixabayQuery: 'cafe coffee shop ambience' },
  { id: 'wind',     freesoundId: 366104, pixabayQuery: 'wind blowing' },
  { id: 'fan',      freesoundId: 264661, pixabayQuery: 'electric fan white noise' },
  { id: 'keyboard', freesoundId: 542774, pixabayQuery: 'keyboard typing' },
  { id: 'night',    freesoundId: 399583, pixabayQuery: 'crickets night insects' },
]

mkdirSync(OUT_DIR, { recursive: true })

async function downloadBinary(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Noisebox/0.1' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
  const buf = await res.arrayBuffer()
  writeFileSync(dest, Buffer.from(buf))
}

async function fromFreesound(sound) {
  if (!FREESOUND_KEY) throw new Error('No FREESOUND_API_KEY')
  const metaUrl = `https://freesound.org/apiv2/sounds/${sound.freesoundId}/?token=${FREESOUND_KEY}`
  const res = await fetch(metaUrl, { headers: { 'User-Agent': 'Noisebox/0.1' } })
  if (!res.ok) throw new Error(`Freesound metadata HTTP ${res.status}`)
  const meta = await res.json()
  const url =
    meta?.previews?.['preview-hq-ogg'] ??
    meta?.previews?.['preview-lq-ogg'] ??
    meta?.previews?.['preview-hq-mp3'] ??
    meta?.previews?.['preview-lq-mp3']
  if (!url) throw new Error('No preview URL in Freesound response')
  const ext = url.includes('.ogg') ? 'ogg' : 'mp3'
  const dest = join(OUT_DIR, `${sound.id}.${ext}`)
  await downloadBinary(url, dest)
  return ext
}

async function fromPixabay(sound) {
  if (!PIXABAY_KEY) throw new Error('No PIXABAY_API_KEY')
  const q = encodeURIComponent(sound.pixabayQuery)
  const searchUrl = `https://pixabay.com/api/audio/?key=${PIXABAY_KEY}&q=${q}&cat=sound_effects&per_page=5`
  const res = await fetch(searchUrl, { headers: { 'User-Agent': 'Noisebox/0.1' } })
  if (!res.ok) throw new Error(`Pixabay HTTP ${res.status}`)
  const data = await res.json()
  const hit = data?.hits?.[0]
  if (!hit) throw new Error('No Pixabay results')
  const url = hit?.audio?.ogg ?? hit?.audio?.mp3 ?? hit?.previewURL
  if (!url) throw new Error('No audio URL in Pixabay response')
  const ext = url.includes('.ogg') ? 'ogg' : 'mp3'
  const dest = join(OUT_DIR, `${sound.id}.${ext}`)
  await downloadBinary(url, dest)
  return ext
}

async function run() {
  if (!FREESOUND_KEY && !PIXABAY_KEY) {
    console.error('⚠  No API keys found. Set FREESOUND_API_KEY or PIXABAY_API_KEY.')
    console.error('   Example: FREESOUND_API_KEY=xxx pnpm download-sounds')
    process.exit(1)
  }

  let ok = 0, skip = 0, fail = 0

  for (const sound of BUNDLED) {
    // Skip if already downloaded (any extension)
    const alreadyOgg = existsSync(join(OUT_DIR, `${sound.id}.ogg`))
    const alreadyMp3 = existsSync(join(OUT_DIR, `${sound.id}.mp3`))
    if (alreadyOgg || alreadyMp3) {
      console.log(`  ✓ ${sound.id} (cached)`)
      skip++
      continue
    }

    process.stdout.write(`  ↓ ${sound.id}… `)
    try {
      const ext = await fromFreesound(sound)
      console.log(`done (freesound .${ext})`)
      ok++
    } catch (e1) {
      try {
        const ext = await fromPixabay(sound)
        console.log(`done (pixabay .${ext})`)
        ok++
      } catch (e2) {
        console.log(`FAILED`)
        console.error(`    Freesound: ${e1.message}`)
        console.error(`    Pixabay:   ${e2.message}`)
        fail++
      }
    }
  }

  console.log(`\nDone — ${ok} downloaded, ${skip} cached, ${fail} failed`)
  console.log(`Output: ${OUT_DIR}`)
  if (fail > 0) process.exit(1)
}

run()
