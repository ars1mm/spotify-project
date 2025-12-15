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
  playNext: () => void
  playPrevious: () => void
  hasNext: boolean
  hasPrevious: boolean
  audioRef: React.RefObject<HTMLAudioElement | null>
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(() => {
    try {
      const stored = localStorage.getItem('lastSongListened')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.7)
  const [songHistory, setSongHistory] = useState<Song[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
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
    
    // Add to history if it's a new song
    setSongHistory(prev => {
      const newHistory = [...prev, song]
      setCurrentIndex(newHistory.length - 1)
      return newHistory
    })
    
    // Save to recent songs in localStorage
    try {
      const stored = localStorage.getItem('recentSongs')
      const recentSongs: Song[] = stored ? JSON.parse(stored) : []
      const filtered = recentSongs.filter(s => s.id !== song.id)
      const updated = [song, ...filtered].slice(0, 10)
      localStorage.setItem('recentSongs', JSON.stringify(updated))
      localStorage.setItem('lastSongListened', JSON.stringify(song))
    } catch (error) {
      console.error('Failed to save recent song:', error)
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

  const playNext = () => {
    if (currentIndex < songHistory.length - 1) {
      const nextSong = songHistory[currentIndex + 1]
      setCurrentIndex(currentIndex + 1)
      setCurrentSong(nextSong)
      setIsPlaying(true)
    }
  }

  const playPrevious = () => {
    if (currentIndex > 0) {
      const prevSong = songHistory[currentIndex - 1]
      setCurrentIndex(currentIndex - 1)
      setCurrentSong(prevSong)
      setIsPlaying(true)
    }
  }

  const hasNext = currentIndex < songHistory.length - 1
  const hasPrevious = currentIndex > 0

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
      playNext,
      playPrevious,
      hasNext,
      hasPrevious,
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