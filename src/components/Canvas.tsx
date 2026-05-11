import { useState, useRef, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { useSoundStore } from '../store/soundStore'
import { SoundCard } from './SoundCard'
import { Bin } from './Bin'
import { SearchPanel } from './SearchPanel'

export function Canvas() {
  const sounds = useSoundStore((s) => s.sounds)
  const updatePosition = useSoundStore((s) => s.updatePosition)
  const removeSound = useSoundStore((s) => s.removeSound)

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [isOverBin, setIsOverBin] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const binRef = useRef<DOMRect | null>(null)

  const handleDragStart = useCallback(
    (id: string, e: React.MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') return
      e.preventDefault()

      const sound = sounds.find((s) => s.id === id)
      if (!sound) return

      setDraggingId(id)

      dragOffset.current = {
        x: e.clientX - sound.x,
        y: e.clientY - sound.y,
      }

      // Capture bin rect once drag starts
      const binEl = document.querySelector('[data-bin="true"]') as HTMLElement | null
      binRef.current = binEl?.getBoundingClientRect() ?? null

      const onMove = (me: MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        let x = me.clientX - dragOffset.current.x
        let y = me.clientY - dragOffset.current.y

        x = Math.max(0, Math.min(x, rect.width - 165))
        y = Math.max(0, Math.min(y, rect.height - 160))

        updatePosition(id, x, y)

        // Check over bin
        if (binRef.current) {
          const over =
            me.clientX >= binRef.current.left &&
            me.clientX <= binRef.current.right &&
            me.clientY >= binRef.current.top &&
            me.clientY <= binRef.current.bottom
          setIsOverBin(over)
        }
      }

      const onUp = (me: MouseEvent) => {
        if (binRef.current) {
          const over =
            me.clientX >= binRef.current.left &&
            me.clientX <= binRef.current.right &&
            me.clientY >= binRef.current.top &&
            me.clientY <= binRef.current.bottom
          if (over) removeSound(id)
        }
        setDraggingId(null)
        setIsOverBin(false)
        binRef.current = null
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }

      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [sounds, updatePosition, removeSound]
  )

  return (
    <div
      ref={canvasRef}
      style={{
        flex: 1,
        position: 'relative',
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
        style={{
          position: 'absolute',
          bottom: '60px',
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
