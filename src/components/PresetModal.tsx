import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Pencil, Check } from 'lucide-react'
import { usePresetStore } from '../store/presetStore'
import { useSoundStore } from '../store/soundStore'
import { useSettingsStore } from '../store/settingsStore'
import { Preset } from '../types'
import { savePreset, deletePreset, loadAllPresets } from '../lib/presets'

interface PresetModalProps {
  open: boolean
  onClose: () => void
  initialView?: 'save' | 'manage'
}

export function PresetModal({ open, onClose, initialView = 'save' }: PresetModalProps) {
  const [name, setName] = useState('')
  const [view, setView] = useState<'save' | 'manage'>(initialView)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)

  const presets = usePresetStore((s) => s.presets)
  const activePresetId = usePresetStore((s) => s.activePresetId)
  const setPresets = usePresetStore((s) => s.setPresets)
  const addPreset = usePresetStore((s) => s.addPreset)
  const removePreset = usePresetStore((s) => s.removePreset)
  const updatePreset = usePresetStore((s) => s.updatePreset)
  const setActivePresetId = usePresetStore((s) => s.setActivePresetId)
  const setSnapshot = usePresetStore((s) => s.setSnapshot)

  const sounds = useSoundStore((s) => s.sounds)
  const loadSounds = useSoundStore((s) => s.loadSounds)
  const masterVol = useSettingsStore((s) => s.masterVol)

  // Reset view and name when modal opens
  useEffect(() => {
    if (open) {
      setView(initialView)
      setName('')
      setRenamingId(null)
      loadAllPresets().then(setPresets)
    }
  }, [open, initialView, setPresets])

  useEffect(() => {
    if (renamingId) renameInputRef.current?.focus()
  }, [renamingId])

  function startRename(preset: Preset) {
    setRenamingId(preset.id)
    setRenameValue(preset.name)
  }

  async function commitRename(preset: Preset) {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== preset.name) {
      const updated: Preset = { ...preset, name: trimmed }
      await savePreset(updated)
      updatePreset(updated)
    }
    setRenamingId(null)
  }

  async function handleSave() {
    if (!name.trim()) return
    const preset: Preset = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
      sounds,
      masterVol,
    }
    await savePreset(preset)
    addPreset(preset)
    setActivePresetId(preset.id)
    setSnapshot([...sounds])
    setName('')
    onClose()
  }

  async function handleDelete(id: string) {
    await deletePreset(id)
    removePreset(id)
    if (id === activePresetId) {
      setActivePresetId(null)
      setSnapshot(null)
    }
  }

  function handleLoad(preset: Preset) {
    loadSounds(preset.sounds)
    setActivePresetId(preset.id)
    setSnapshot([...preset.sounds])
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
              width: '320px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setView('save')}
                  style={{ fontSize: '14px', fontWeight: 500, color: view === 'save' ? '#d0d0d0' : '#555', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Save preset
                </button>
                <button
                  onClick={() => setView('manage')}
                  style={{ fontSize: '14px', fontWeight: 500, color: view === 'manage' ? '#d0d0d0' : '#555', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Manage
                </button>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
                <X size={16} />
              </button>
            </div>

            {view === 'save' ? (
              <>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                  placeholder="Preset name..."
                  style={{
                    width: '100%',
                    backgroundColor: '#252525',
                    border: '0.5px solid #333',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#d0d0d0',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
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
              </>
            ) : (
              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {presets.length === 0 ? (
                  <p style={{ color: '#444', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No saved presets</p>
                ) : (
                  presets.map((preset) => {
                    const isRenaming = renamingId === preset.id
                    return (
                    <div
                      key={preset.id}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: '0.5px solid #222' }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {isRenaming ? (
                          <input
                            ref={renameInputRef}
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitRename(preset)
                              if (e.key === 'Escape') setRenamingId(null)
                            }}
                            onBlur={() => commitRename(preset)}
                            style={{
                              width: '100%',
                              backgroundColor: '#2a2a2a',
                              border: '0.5px solid #7c6af7',
                              borderRadius: '5px',
                              padding: '3px 7px',
                              color: '#d0d0d0',
                              fontSize: '13px',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                        ) : (
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'text' }}
                            onDoubleClick={() => startRename(preset)}
                          >
                            <span style={{ fontSize: '13px', color: preset.id === activePresetId ? '#c4b8ff' : '#d0d0d0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {preset.name}
                            </span>
                            <button
                              onClick={() => startRename(preset)}
                              title="Rename"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '2px', flexShrink: 0, display: 'flex' }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#ccc' }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#666' }}
                            >
                              <Pencil size={11} />
                            </button>
                          </div>
                        )}
                        <div style={{ fontSize: '11px', color: '#555', marginTop: '1px' }}>{preset.sounds.length} sounds</div>
                      </div>
                      {isRenaming ? (
                        <button
                          onMouseDown={(e) => { e.preventDefault(); commitRename(preset) }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c6af7', padding: '4px', display: 'flex' }}
                        >
                          <Check size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLoad(preset)}
                          style={{
                            fontSize: '12px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '0.5px solid #7c6af7',
                            backgroundColor: 'transparent',
                            color: '#7c6af7',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          Load
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(preset.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: '4px', display: 'flex' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#e24b4a' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#444' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    )
                  })
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
