import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'

interface BinProps {
  isActive: boolean
  isOver: boolean
}

export function Bin({ isActive, isOver }: BinProps) {
  if (!isActive) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: isOver ? 1.15 : 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.15 }}
        style={{
          position: 'absolute',
          bottom: '80px',
          right: '16px',
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          border: `0.5px solid ${isOver ? '#e24b4a' : '#2a2a2a'}`,
          backgroundColor: isOver ? '#2a1515' : '#1e1e1e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          transition: 'border-color 0.15s ease, background-color 0.15s ease',
          pointerEvents: 'none',
        }}
        data-bin="true"
      >
        <Trash2 size={20} color={isOver ? '#e24b4a' : '#444'} />
      </motion.div>
    </AnimatePresence>
  )
}
