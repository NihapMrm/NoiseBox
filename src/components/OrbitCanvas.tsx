import { useState, useRef, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search, CloudRain, Zap, Feather, Wind, Flame, Coffee, Waves, Trees,
  Fan, Users, Droplets, Train, Keyboard, Moon, Wifi, WifiOff,
} from 'lucide-react'
import { useSoundStore } from '../store/soundStore'
import { usePresetStore } from '../store/presetStore'
import { useSettingsStore } from '../store/settingsStore'
import { SearchPanel } from './SearchPanel'
import { PresetModal } from './PresetModal'
import { Preset } from '../types'
import { savePreset } from '../lib/presets'
import * as engine from '../audio/engine'

const ICON_MAP: Record<string, React.ElementType> = {
  CloudRain, Zap, Feather, Wind, Flame, Coffee, Waves, Trees,
  Fan, Users, Droplets, Train, Keyboard, Moon,
}

export const ORBIT_BUBBLE_D = 56 // diameter — exported for SearchPanel
const BUBBLE_R = ORBIT_BUBBLE_D / 2

// Distance at which volume = 0, as a fraction of the corner distance
const MAX_DIST_FACTOR = 0.82

function computeVol(bx: number, by: number, cx: number, cy: number, cw: number, ch: number): number {
  const maxDist = Math.hypot(cw / 2, ch / 2) * MAX_DIST_FACTOR
  const dist = Math.hypot(bx - cx, by - cy)
  return Math.max(0, Math.min(100, Math.round((1 - dist / maxDist) * 100)))
}

function computePan(bx: number, cx: number): number {
  return Math.max(-1, Math.min(1, (bx - cx) / (cx || 1)))
}

export function OrbitCanvas() {
  const sounds = useSoundStore((s) => s.sounds)
  const updatePosition = useSoundStore((s) => s.updatePosition)
  const removeSound = useSoundStore((s) => s.removeSound)
  const clearSounds = useSoundStore((s) => s.clearSounds)
  const toggleSound = useSoundStore((s) => s.toggleSound)
  const storeSetVolume = useSoundStore((s) => s.setVolume)

  const presets = usePresetStore((s) => s.presets)
  const activePresetId = usePresetStore((s) => s.activePresetId)
  const setSnapshot = usePresetStore((s) => s.setSnapshot)
  const updatePreset = usePresetStore((s) => s.updatePreset)

  const masterVol = useSettingsStore((s) => s.masterVol)
  const spatialAudio = useSettingsStore((s) => s.spatialAudio)
  const setSpatialAudio = useSettingsStore((s) => s.setSpatialAudio)

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overBinId, setOverBinId] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [presetModalOpen, setPresetModalOpen] = useState(false)
  const [presetModalView, setPresetModalView] = useState<'save' | 'manage'>('save')
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 })

  const canvasRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const mouseDownPos = useRef({ x: 0, y: 0 })
  const didDrag = useRef(false)


  // Track canvas size for SVG lines
  useEffect(() => {
    const update = () => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) setCanvasSize({ w: rect.width, h: rect.height })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return
    const handler = () => setContextMenu(null)
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [contextMenu])

  const getRect = () => canvasRef.current?.getBoundingClientRect() ?? null

  // ── Drag ──────────────────────────────────────────────────────────────────

  const handleBubbleDragStart = useCallback(
    (id: string, e: React.MouseEvent) => {
      if (
        (e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'BUTTON'
      ) return
      e.preventDefault()

      const sound = sounds.find((s) => s.id === id)
      if (!sound) return

      setDraggingId(id)
      mouseDownPos.current = { x: e.clientX, y: e.clientY }
      dragOffset.current = { x: e.clientX - sound.x, y: e.clientY - sound.y }
      didDrag.current = false

      const onMove = (me: MouseEvent) => {
        const rect = getRect()
        if (!rect) return

        if (Math.hypot(me.clientX - mouseDownPos.current.x, me.clientY - mouseDownPos.current.y) > 4) {
          didDrag.current = true
        }

        let x = me.clientX - dragOffset.current.x
        let y = me.clientY - dragOffset.current.y
        x = Math.max(0, Math.min(x, rect.width  - ORBIT_BUBBLE_D))
        y = Math.max(0, Math.min(y, rect.height - ORBIT_BUBBLE_D))
        updatePosition(id, x, y)

        // Bubble visual center
        const bx = x + BUBBLE_R
        const by = y + BUBBLE_R
        const cx = rect.width / 2
        const cy = rect.height / 2

        // Volume from distance
        const vol = computeVol(bx, by, cx, cy, rect.width, rect.height)
        storeSetVolume(id, vol)
        engine.setVolume(id, (masterVol / 100) * vol) // immediate audio

        // Stereo pan from horizontal position
        if (spatialAudio) {
          engine.setStereo(id, computePan(bx, cx))
        }

        // Bin detection: bottom-right corner area
        const BIN_SIZE = 48, BIN_MARGIN = 16
        const inBin =
          me.clientX >= rect.right  - BIN_MARGIN - BIN_SIZE &&
          me.clientX <= rect.right  - BIN_MARGIN &&
          me.clientY >= rect.bottom - 80         - BIN_SIZE &&
          me.clientY <= rect.bottom - 80
        setOverBinId(inBin ? id : null)
      }

      const onUp = (me: MouseEvent) => {
        const rect = getRect()
        if (rect) {
          const BIN_SIZE = 48, BIN_MARGIN = 16
          const inBin =
            me.clientX >= rect.right  - BIN_MARGIN - BIN_SIZE &&
            me.clientX <= rect.right  - BIN_MARGIN &&
            me.clientY >= rect.bottom - 80         - BIN_SIZE &&
            me.clientY <= rect.bottom - 80
          if (inBin) {
            removeSound(id)
            setOverBinId(null)
            setDraggingId(null)
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
            return
          }
        }

        // Click (no drag) → toggle active
        if (!didDrag.current) toggleSound(id)

        setDraggingId(null)
        setOverBinId(null)
        didDrag.current = false
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [sounds, updatePosition, storeSetVolume, toggleSound, removeSound, masterVol, spatialAudio]
  )

  // ── Context menu ──────────────────────────────────────────────────────────

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    const rect = getRect()
    if (!rect) return
    const MENU_W = 172, MENU_H = 116
    const x = Math.min(e.clientX - rect.left, rect.width  - MENU_W)
    const y = Math.min(e.clientY - rect.top,  rect.height - MENU_H)
    setContextMenu({ x: Math.max(0, x), y: Math.max(0, y) })
  }

  async function handleSavePreset() {
    setContextMenu(null)
    if (!activePresetId) {
      setPresetModalView('save')
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

  function handleManagePresets() {
    setContextMenu(null)
    setPresetModalView('manage')
    setPresetModalOpen(true)
  }

  function handleClearPlayground() {
    setContextMenu(null)
    clearSounds()
  }

  function handleAutoAlign() {
    setContextMenu(null)
    const rect = getRect()
    if (!rect || sounds.length === 0) return
    const cx = rect.width / 2
    const cy = rect.height / 2
    // Place bubbles in a circle at ~45% of the corner distance
    const radius = Math.min(cx, cy) * 0.55
    sounds.forEach((sound, i) => {
      const angle = (i / sounds.length) * Math.PI * 2 - Math.PI / 2
      const x = cx + Math.cos(angle) * radius - BUBBLE_R
      const y = cy + Math.sin(angle) * radius - BUBBLE_R
      updatePosition(sound.id, x, y)
      const vol = computeVol(x + BUBBLE_R, y + BUBBLE_R, cx, cy, rect.width, rect.height)
      storeSetVolume(sound.id, vol)
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const saveLabel = activePresetId ? 'Save preset' : 'Save as new preset…'

  const menuItemStyle: React.CSSProperties = {
    display: 'block', width: '100%', padding: '7px 14px',
    textAlign: 'left', background: 'none', border: 'none',
    color: '#c0c0c0', fontSize: '13px', cursor: 'pointer',
  }

  return (
    <div
      ref={canvasRef}
      onContextMenu={handleContextMenu}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#111113',
        overflow: 'hidden',
        cursor: draggingId ? 'grabbing' : 'default',
      }}
    >
      {/* Vertical split line */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: '1px',
        backgroundColor: 'rgba(255,255,255,0.045)',
        pointerEvents: 'none',
      }} />

      {/* Left / Right labels */}
      <div style={{ position: 'absolute', top: '72px', left: '50%', pointerEvents: 'none', display: 'flex', width: 0 }}>
        <span style={{ position: 'absolute', right: '12px', fontSize: '10px', color: 'rgba(255,255,255,0.08)', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Left</span>
        <span style={{ position: 'absolute', left: '12px', fontSize: '10px', color: 'rgba(255,255,255,0.08)', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Right</span>
      </div>

      {/* Subtle distance rings (volume guides) */}
      {[0.28, 0.55, 0.82].map((factor) => (
        <div
          key={factor}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: `0.5px solid rgba(255,255,255,${0.025 + factor * 0.01})`,
            pointerEvents: 'none',
            // ring size derived from MAX_DIST_FACTOR and current viewport approx
            width:  `${factor / MAX_DIST_FACTOR * 100}vmin`,
            height: `${factor / MAX_DIST_FACTOR * 100}vmin`,
          }}
        />
      ))}

      {/* Bubble → center connector lines (active sounds only) */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
          overflow: 'visible',
        }}
      >
        <defs>
          <filter id="line-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <AnimatePresence>
          {sounds.map((sound) => {
            const bx = sound.x + BUBBLE_R
            const by = sound.y + BUBBLE_R
            const cx = canvasSize.w / 2
            const cy = canvasSize.h / 2
            const isDragging = draggingId === sound.id
            const mx = (bx + cx) / 2
            const my = (by + cy) / 2
            const isActive = sound.active
            return (
              <motion.g key={sound.id}>
                <motion.line
                  x1={bx} y1={by}
                  initial={{ x2: bx, y2: by, opacity: 0 }}
                  animate={{
                    x2: cx, y2: cy,
                    opacity: isDragging ? 0.7 : isActive ? 0.45 : 0.15,
                    strokeWidth: isDragging ? 1.2 : isActive ? 0.9 : 0.6,
                  }}
                  exit={{ x2: bx, y2: by, opacity: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  stroke="white"
                  strokeDasharray={isDragging ? '4 7' : '3 8'}
                  filter={isActive ? 'url(#line-glow)' : undefined}
                />
                {isDragging && (
                  <text
                    x={mx} y={my - 5}
                    fill="white"
                    fontSize="9"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                    textAnchor="middle"
                    opacity={0.72}
                  >
                    {sound.vol}%
                  </text>
                )}
              </motion.g>
            )
          })}
        </AnimatePresence>
      </svg>

      {/* Center glow circle */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.92)',
        boxShadow: [
          '0 0 0 6px rgba(255,255,255,0.06)',
          '0 0 24px 8px rgba(255,255,255,0.22)',
          '0 0 60px 20px rgba(255,255,255,0.07)',
        ].join(', '),
        pointerEvents: 'none',
        zIndex: 2,
      }} />

      {/* Sound bubbles */}
      <AnimatePresence>
        {sounds.map((sound) => {
          const Icon = ICON_MAP[sound.icon] ?? Waves
          const isBeingDragged = draggingId === sound.id
          const isOverBin = overBinId === sound.id
          const borderColor = isOverBin
            ? '#e24b4a'
            : sound.active
            ? sound.iconColor
            : 'rgba(255,255,255,0.08)'
          const glow = sound.active
            ? `0 0 18px 4px ${sound.iconColor}44, 0 4px 16px rgba(0,0,0,0.5)`
            : '0 4px 16px rgba(0,0,0,0.4)'

          return (
            <motion.div
              key={sound.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: isOverBin ? 0.75 : 1, opacity: isOverBin ? 0.5 : 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onMouseDown={(e) => handleBubbleDragStart(sound.id, e)}
              style={{
                position: 'absolute',
                left: sound.x,
                top: sound.y,
                cursor: isBeingDragged ? 'grabbing' : 'grab',
                userSelect: 'none',
                zIndex: isBeingDragged ? 999 : 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Circle */}
              <div style={{
                width: ORBIT_BUBBLE_D,
                height: ORBIT_BUBBLE_D,
                borderRadius: '50%',
                backgroundColor: sound.color,
                border: `1.5px solid ${borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: glow,
                transition: 'border-color 0.15s, box-shadow 0.15s',
                opacity: isBeingDragged && !isOverBin ? 0.88 : 1,
              }}>
                <Icon size={20} color={sound.iconColor} />
              </div>
              {/* Name label */}
              <div style={{
                marginTop: '5px',
                fontSize: '10px',
                color: sound.active ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)',
                whiteSpace: 'nowrap',
                maxWidth: '72px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'center',
                lineHeight: 1,
                pointerEvents: 'none',
              }}>
                {sound.name.slice(0, 14)}
              </div>
              {/* Volume % */}
              <div style={{
                marginTop: '2px',
                fontSize: '9px',
                color: 'rgba(255,255,255,0.18)',
                pointerEvents: 'none',
              }}>
                {sound.vol}%
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Bin zone (bottom-right) */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        right: '16px',
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        border: `0.5px solid ${overBinId ? '#e24b4a' : draggingId ? '#333' : 'transparent'}`,
        backgroundColor: overBinId ? 'rgba(226,75,74,0.12)' : 'transparent',
        display: draggingId ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s',
        pointerEvents: 'none',
        zIndex: 10,
      }}>
        <span style={{ fontSize: '18px', opacity: overBinId ? 1 : 0.4 }}>🗑</span>
      </div>

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
          backgroundColor: searchOpen ? '#2d2540' : '#1a1a1a',
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

      {/* Spatial audio toggle */}
      <button
        onClick={() => setSpatialAudio(!spatialAudio)}
        onContextMenu={(e) => e.stopPropagation()}
        title={spatialAudio ? 'Spatial audio on — click to disable' : 'Spatial audio off — click to enable'}
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '60px',
          height: '36px',
          padding: '0 10px',
          borderRadius: '10px',
          border: `0.5px solid ${spatialAudio ? '#7c6af7' : '#2a2a2a'}`,
          backgroundColor: spatialAudio ? '#2d2540' : '#1a1a1a',
          color: spatialAudio ? '#c4b5fd' : '#555',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          cursor: 'pointer',
          fontSize: '11px',
          zIndex: 50,
          transition: 'all 0.15s',
          whiteSpace: 'nowrap',
        }}
      >
        {spatialAudio ? <Wifi size={13} /> : <WifiOff size={13} />}
        Spatial
      </button>

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
          <button
            style={menuItemStyle}
            onClick={handleManagePresets}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#242424' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
          >
            Manage presets…
          </button>
          <div style={{ height: '0.5px', backgroundColor: '#2a2a2a', margin: '4px 0' }} />
          <button
            style={{ ...menuItemStyle, color: '#e24b4a' }}
            onClick={handleClearPlayground}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2a1515' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
          >
            Clear playground
          </button>
        </div>
      )}

      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />

      <PresetModal
        open={presetModalOpen}
        onClose={() => setPresetModalOpen(false)}
        initialView={presetModalView}
      />
    </div>
  )
}
