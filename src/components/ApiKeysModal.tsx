import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink } from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import { LazyStore } from '@tauri-apps/plugin-store'

const store = new LazyStore('settings.json')

interface ApiKeysModalProps {
  open: boolean
  onClose: () => void
}

export function ApiKeysModal({ open, onClose }: ApiKeysModalProps) {
  const freesoundApiKey = useSettingsStore((s) => s.freesoundApiKey)
  const pixabayApiKey = useSettingsStore((s) => s.pixabayApiKey)
  const setFreesoundApiKey = useSettingsStore((s) => s.setFreesoundApiKey)
  const setPixabayApiKey = useSettingsStore((s) => s.setPixabayApiKey)

  const [fs, setFs] = useState(freesoundApiKey)
  const [pb, setPb] = useState(pixabayApiKey)

  useEffect(() => {
    if (open) { setFs(freesoundApiKey); setPb(pixabayApiKey) }
  }, [open, freesoundApiKey, pixabayApiKey])

  async function handleSave() {
    setFreesoundApiKey(fs.trim())
    setPixabayApiKey(pb.trim())
    await store.set('freesoundApiKey', fs.trim())
    await store.set('pixabayApiKey', pb.trim())
    await store.save()
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 500,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            style={{
              backgroundColor: '#1e1e1e',
              border: '0.5px solid #333',
              borderRadius: '12px',
              padding: '20px',
              width: '340px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#d0d0d0' }}>API Keys</span>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#555', marginBottom: '16px', lineHeight: '1.5' }}>
              Sounds are fetched once and cached locally. Freesound is tried first, Pixabay as fallback.
            </p>

            {/* Freesound */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', color: '#888' }}>Freesound API Key</label>
                <a
                  href="https://freesound.org/apiv2/apply/"
                  target="_blank"
                  rel="noopener"
                  style={{ fontSize: '11px', color: '#7c6af7', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                >
                  Get key <ExternalLink size={10} />
                </a>
              </div>
              <input
                value={fs}
                onChange={(e) => setFs(e.target.value)}
                placeholder="Paste your Freesound token..."
                style={{
                  width: '100%',
                  backgroundColor: '#252525',
                  border: '0.5px solid #333',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#d0d0d0',
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            {/* Pixabay */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', color: '#888' }}>Pixabay API Key</label>
                <a
                  href="https://pixabay.com/api/docs/"
                  target="_blank"
                  rel="noopener"
                  style={{ fontSize: '11px', color: '#7c6af7', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                >
                  Get key <ExternalLink size={10} />
                </a>
              </div>
              <input
                value={pb}
                onChange={(e) => setPb(e.target.value)}
                placeholder="Paste your Pixabay key..."
                style={{
                  width: '100%',
                  backgroundColor: '#252525',
                  border: '0.5px solid #333',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#d0d0d0',
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: '13px', padding: '6px 12px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  backgroundColor: '#7c6af7',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '13px',
                  padding: '6px 16px',
                  fontWeight: 500,
                }}
              >
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
