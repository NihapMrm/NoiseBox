import { motion } from 'framer-motion'
import {
  CloudRain, Zap, Feather, Wind, Flame, Coffee, Waves, Trees,
  Fan, Users, Droplets, Train, Keyboard, Moon, AlertCircle,
} from 'lucide-react'
import { ActiveSound } from '../types'
import { WaveBars } from './WaveBars'
import { Toggle } from './Toggle'
import { useSoundStore } from '../store/soundStore'
import { useDownloadStore } from '../store/downloadStore'

const ICON_MAP: Record<string, React.ElementType> = {
  CloudRain, Zap, Feather, Wind, Flame, Coffee, Waves, Trees,
  Fan, Users, Droplets, Train, Keyboard, Moon,
}

interface SoundCardProps {
  sound: ActiveSound
  onDragStart: (id: string, e: React.MouseEvent) => void
  isDragging: boolean
  isOverBin: boolean
}

export function SoundCard({ sound, onDragStart, isDragging, isOverBin }: SoundCardProps) {
  const toggleSound = useSoundStore((s) => s.toggleSound)
  const setVolume = useSoundStore((s) => s.setVolume)
  const dlStatus = useDownloadStore((s) => s.getStatus(sound.id))
  const Icon = ICON_MAP[sound.icon] ?? CloudRain

  const isDownloading = dlStatus === 'downloading'
  const isError = dlStatus === 'error'
  const opacity = isOverBin ? 0.4 : isDragging ? 0.85 : 1

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.2 }}
      onMouseDown={(e) => onDragStart(sound.id, e)}
      style={{
        position: 'absolute',
        left: sound.x,
        top: sound.y,
        width: '165px',
        borderRadius: '12px',
        border: `0.5px solid ${isError ? '#e24b4a' : sound.active ? '#7c6af7' : '#2e2e2e'}`,
        backgroundColor: '#1e1e1e',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        zIndex: isDragging ? 999 : 1,
        transition: 'border-color 0.15s ease, opacity 0.15s ease',
        overflow: 'hidden',
      }}
    >
      {/* Download overlay */}
      {(isDownloading || isError) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(18,18,18,0.82)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            zIndex: 10,
            borderRadius: '12px',
          }}
        >
          {isDownloading ? (
            <>
              <div style={{
                width: '18px',
                height: '18px',
                border: '2px solid #333',
                borderTop: '2px solid #7c6af7',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <span style={{ fontSize: '11px', color: '#888' }}>Downloading…</span>
            </>
          ) : (
            <>
              <AlertCircle size={16} color="#e24b4a" />
              <span style={{ fontSize: '11px', color: '#e24b4a' }}>Failed</span>
            </>
          )}
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '11px 11px 9px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: sound.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={16} color={sound.iconColor} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#d0d0d0', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {sound.name}
          </div>
          <div style={{ fontSize: '11px', color: sound.active ? '#7c6af7' : '#555', marginTop: '2px' }}>
            {sound.active ? 'Playing' : 'Off'}
          </div>
        </div>
        <Toggle
          checked={sound.active}
          onChange={() => { if (!isDownloading && !isError) toggleSound(sound.id) }}
        />
      </div>

      {/* Body */}
      <div style={{ padding: '0 11px 11px', borderTop: '0.5px solid #222' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '9px', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: sound.active ? '#888' : '#555' }}>Volume</span>
          <span style={{ fontSize: '11px', color: sound.active ? '#888' : '#555' }}>{sound.vol}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={sound.vol}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => setVolume(sound.id, Number(e.target.value))}
          style={{ width: '100%', accentColor: '#7c6af7', cursor: 'pointer', height: '3px' }}
        />
        <div style={{ marginTop: '8px' }}>
          <WaveBars active={sound.active} />
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  )
}
