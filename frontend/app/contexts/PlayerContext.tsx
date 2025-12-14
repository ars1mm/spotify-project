'use client'

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'

interface Song {
  id: string
  title: string
  artist: string
  album?: string
  audio_url?: string
  cover_image_url?: string
  file_path?: string
}

interface PlayerContextType {
  currentSong: Song | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  playSong: (song: Song) => void
  pauseSong: () => void
  togglePlay: () => void
  setVolume: (volume: number) => void
  seekTo: (time: number) => void
  audioRef: React.RefObject<HTMLAudioElement | null>
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.7)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)
    const handleError = (e: Event) => {
      console.error('Audio error for song:', currentSong?.title, e)
      console.error('Failed audio URL:', currentSong?.audio_url)
      setIsPlaying(false)
      alert(`Cannot play "${currentSong?.title}". Audio file not found or bucket not configured.`)
    }
    const handleLoadStart = () => console.log('Loading audio:', currentSong?.title)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('loadstart', handleLoadStart)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('loadstart', handleLoadStart)
    }
  }, [currentSong])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play()
    } else {
      audio.pause()
    }
  }, [isPlaying, currentSong])

  const playSong = (song: Song) => {
    console.log('Playing song:', song)
    console.log('Audio URL:', song.audio_url)
    
    if (!song.audio_url) {
      console.error('No audio URL available for song:', song.title)
      return
    }
    
    setCurrentSong(song)
    setIsPlaying(true)
  }

  const pauseSong = () => {
    setIsPlaying(false)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const setVolume = (vol: number) => {
    setVolumeState(vol)
    if (audioRef.current) {
      audioRef.current.volume = vol
    }
  }

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  return (
    <PlayerContext.Provider value={{
      currentSong,
      isPlaying,
      currentTime,
      duration,
      volume,
      playSong,
      pauseSong,
      togglePlay,
      setVolume,
      seekTo,
      audioRef
    }}>
      {children}
      {currentSong?.audio_url && (
        <audio
          ref={audioRef}
          src={currentSong.audio_url}
          preload="metadata"
          crossOrigin="anonymous"
        />
      )}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}