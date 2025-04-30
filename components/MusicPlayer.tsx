'use client'

import { useState, useRef, useEffect } from 'react'
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'

const tracks = [
  {
    title: 'Osamason – Frontin',
    src: '/tracks/Frontin.mp3',
  },
  {
    title: 'Oklou & Bladee - take me by the hand',
    src: '/tracks/takemebythehand.mp3',
  },
  {
    title: "Cam'ron - Oh Boy (feat. Juelz Santana)",
    src: '/tracks/ohboy.mp3',
  },
  {
    title: "Standing on the Corner - Girl",
    src: '/tracks/girl.mp3',
  },
  // Add more tracks here
]

export default function MusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const playNext = () => {
    const next = (currentTrack + 1) % tracks.length
    setCurrentTrack(next)
    setIsPlaying(true)
  }

  const playPrev = () => {
    const prev = (currentTrack - 1 + tracks.length) % tracks.length
    setCurrentTrack(prev)
    setIsPlaying(true)
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    }
  }, [currentTrack])

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black text-green-400 text-sm font-mono px-4 py-2 flex items-center justify-between border-t border-green-600">
      <div className="truncate">
        ♪ now playing: {tracks[currentTrack].title}
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={playPrev} title="Previous Track">
          <SkipBack size={16} />
        </button>
        <button onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button onClick={playNext} title="Next Track">
          <SkipForward size={16} />
        </button>
      </div>
      <audio
        ref={audioRef}
        src={tracks[currentTrack].src}
        onEnded={playNext}
      />
    </div>
  )
}