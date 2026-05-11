import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { useSoundStore } from '../store/soundStore'
import { usePresetStore } from '../store/presetStore'
import { useSettingsStore } from '../store/settingsStore'
import { SoundCard } from './SoundCard'
import { Bin } from './Bin'
import { SearchPanel } from './SearchPanel'
import { PresetModal } from './PresetModal'
import { Preset, ActiveSound } from '../types'
import { savePreset } from '../lib/presets'

const BIN_WIDTH = 48
const BIN_HEIGHT = 48
const BIN_RIGHT = 16
const BIN_BOTTOM = 80

// Grid constants matching DEFAULT_POSITIONS in App.tsx
const GRID_START_X = 44
const GRID_START_Y = 88
const GRID_STEP_X = 200
const GRID_STEP_Y = 180

function isDirtyCheck(current: ActiveSound[], snapshot: ActiveSound[]): boolean {
  if (current.length !== snapshot.length) return true
  const snapMap = new Map(snapshot.map((s) => [s.id, s]))
  for (const s of current) {
    const snap = snapMap.get(s.id)
    if (!snap) return true
    if (snap.vol !== s.vol || snap.x !== s.x || snap.y !== s.y || snap.active !== s.active) return true
  }
  return false
}

export function Canvas() {
  const sounds = useSoundStore((s) => s.sounds)
  const updatePosition = useSoundStore((s) => s.updatePosition)
  const removeSound = useSoundStore((s) => s.removeSound)
  const clearSounds = useSoundStore((s) => s.clearSounds)

  const presets = usePresetStore((s) => s.presets)
  const activePresetId = usePresetStore((s) => s.activePresetId)
  const savedSnapshot = usePresetStore((s) => s.savedSnapshot)
  const setSnapshot = usePresetStore((s) => s.setSnapshot)
  const updatePreset = usePresetStore((s) => s.updatePreset)

  const masterVol = useSettingsStore((s) => s.masterVol)

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [isOverBin, setIsOverBin] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [presetModalOpen, setPresetModalOpen] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef({ x: 0, y: 0 })

  const isDirty = useMemo(() => {
    if (!activePresetId || !savedSnapshot) return false
    return isDirtyCheck(sounds, savedSnapshot)
  }, [sounds, savedSnapshot, activePresetId])

  // Close context menu on any outside mousedown
  useEffect(() => {
    if (!contextMenu) return
    const handler = () => setContextMenu(null)
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [contextMenu])

  function getBinRect() {
    const canvas = canvasRef.current?.getBoundingClientRect()
    if (!canvas) return null
    return {
      left:   canvas.right  - BIN_RIGHT  - BIN_WIDTH,
      right:  canvas.right  - BIN_RIGHT,
      top:    canvas.bottom - BIN_BOTTOM - BIN_HEIGHT,
      bottom: canvas.bottom - BIN_BOTTOM,
    }
  }

  const handleDragStart = useCallback(
    (id: string, e: React.MouseEvent) => {
      if (
        (e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'BUTTON'
      ) return
      e.preventDefault()

      const sound = sounds.find((s) => s.id === id)
      if (!sound) return

      setDraggingId(id)
      dragOffset.current = { x: e.clientX - sound.x, y: e.clientY - sound.y }

      const onMove = (me: MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()

        let x = me.clientX - dragOffset.current.x
        let y = me.clientY - dragOffset.current.y
        x = Math.max(0, Math.min(x, rect.width  - 165))
        y = Math.max(0, Math.min(y, rect.height - 160))
        updatePosition(id, x, y)

        const bin = getBinRect()
        if (bin) {
          const over =
            me.clientX >= bin.left  && me.clientX <= bin.right &&
            me.clientY >= bin.top   && me.clientY <= bin.bottom
          setIsOverBin(over)
        }
      }

      const onUp = (me: MouseEvent) => {
        const bin = getBinRect()
        if (bin) {
          const over =
            me.clientX >= bin.left  && me.clientX <= bin.right &&
            me.clientY >= bin.top   && me.clientY <= bin.bottom
          if (over) removeSound(id)
        }
        setDraggingId(null)
        setIsOverBin(false)
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [sounds, updatePosition, removeSound]
  )

  // ── Context menu handlers ──────────────────────────────────────────────────

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const MENU_W = 172
    const MENU_H = 116
    const x = Math.min(e.clientX - rect.left, rect.width  - MENU_W)
    const y = Math.min(e.clientY - rect.top,  rect.height - MENU_H)
    setContextMenu({ x: Math.max(0, x), y: Math.max(0, y) })
  }

  async function handleSavePreset() {
    setContextMenu(null)
    if (!activePresetId) {
      setPresetModalOpen(true)
      return
    }
    const preset = presets.find((p) => p.id === activePresetId)
    if (!preset) return
    const updated: Preset = { ...preset, sounds: [...sounds], masterVol }
    await savePreset(updated)
    updatePreset(updated)
    setSnapshot([...sounds])
  }

  function handleClearPlayground() {
    setContextMenu(null)
    clearSounds()
  }

  function handleAutoAlign() {
    setContextMenu(null)
    const canvas = canvasRef.current
    if (!canvas || sounds.length === 0) return
    const { width } = canvas.getBoundingClientRect()
    const cols = Math.max(1, Math.floor((width - GRID_START_X + 24) / GRID_STEP_X))
    sounds.forEach((sound, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      updatePosition(sound.id, GRID_START_X + col * GRID_STEP_X, GRID_START_Y + row * GRID_STEP_Y)
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const menuItemStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '7px 14px',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    color: '#c0c0c0',
    fontSize: '13px',
    cursor: 'pointer',
  }

  const dangerItemStyle: React.CSSProperties = {
    ...menuItemStyle,
    color: '#e24b4a',
  }

  const saveLabel = activePresetId
    ? (isDirty ? 'Save preset' : 'Save preset')
    : 'Save as new preset…'

  return (
    <div
      ref={canvasRef}
      onContextMenu={handleContextMenu}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#161616',
        backgroundImage:
          'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        overflow: 'hidden',
        cursor: draggingId ? 'grabbing' : 'default',
      }}
    >
      <AnimatePresence>
        {sounds.map((sound) => (
          <SoundCard
            key={sound.id}
            sound={sound}
            onDragStart={handleDragStart}
            isDragging={draggingId === sound.id}
            isOverBin={draggingId === sound.id && isOverBin}
          />
        ))}
      </AnimatePresence>

      {/* Search button */}
      <button
        onClick={() => setSearchOpen((v) => !v)}
        onContextMenu={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '16px',
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          border: `0.5px solid ${searchOpen ? '#7c6af7' : '#2a2a2a'}`,
          backgroundColor: searchOpen ? '#2d2540' : '#1e1e1e',
          color: searchOpen ? '#7c6af7' : '#555',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 50,
          transition: 'all 0.15s',
        }}
      >
        <Search size={16} />
      </button>

      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />

      <Bin isActive={draggingId !== null} isOver={isOverBin} />

      {/* Context menu */}
      {contextMenu && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: '#1a1a1a',
            border: '0.5px solid #2e2e2e',
            borderRadius: '10px',
            padding: '4px 0',
            minWidth: '172px',
            zIndex: 400,
            boxShadow: '0 12px 32px rgba(0,0,0,0.65)',
          }}
        >
          <button
            style={menuItemStyle}
            onClick={handleSavePreset}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#242424' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
          >
            {saveLabel}
          </button>
          <button
            style={menuItemStyle}
            onClick={handleAutoAlign}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#242424' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
          >
            Auto align
          </button>
          <div style={{ height: '0.5px', backgroundColor: '#2a2a2a', margin: '4px 0' }} />
          <button
            style={dangerItemStyle}
            onClick={handleClearPlayground}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2a1515' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
          >
            Clear playground
          </button>
        </div>
      )}

      <PresetModal
        open={presetModalOpen}
        onClose={() => setPresetModalOpen(false)}
        initialView="save"
      />

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  )
}
