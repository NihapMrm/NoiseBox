import { useEffect, useRef, useState } from 'react'

interface WaveBarsProps {
  active: boolean
  color?: string
}

const BAR_COUNT = 5

function randomHeight() {
  return Math.floor(Math.random() * 18) + 4
}

export function WaveBars({ active, color = '#7c6af7' }: WaveBarsProps) {
  const [heights, setHeights] = useState(() => Array(BAR_COUNT).fill(4))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (active) {
      setHeights(Array.from({ length: BAR_COUNT }, randomHeight))
      intervalRef.current = setInterval(() => {
        setHeights(Array.from({ length: BAR_COUNT }, randomHeight))
      }, 500)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      setHeights(Array(BAR_COUNT).fill(4))
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [active])

  return (
    <div className="flex items-end gap-[3px] h-[24px]">
      {heights.map((h, i) => (
        <div
          key={i}
          style={{
            height: `${h}px`,
            width: '3px',
            backgroundColor: active ? color : '#2a2a2a',
            borderRadius: '2px',
            transition: 'height 0.3s ease',
          }}
        />
      ))}
    </div>
  )
}
