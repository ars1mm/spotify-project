'use client'

import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Song } from '../types'

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
    const handleEnded = () => {
      setIsPlaying(false)
      // playNext()
    }
    const handleError = (e: Event) => {
      console.error('Audio error for song:', currentSong?.title, e)
      console.error('Failed audio URL:', currentSong?.audio_url)
      setIsPlaying(false)
      toast.dismiss()
      toast.error(`Cannot play "${currentSong?.title}". Audio file not found.`)
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

    audio.volume = volume
    
    if (isPlaying) {
      audio.play()
    } else {
      audio.pause()
    }
  }, [isPlaying, currentSong, volume])



  const playSong = useCallback((song: Song) => {
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
  }, [])

  const pauseSong = () => {
    setIsPlaying(false)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const setVolume = (vol: number) => {
    const clampedVol = Math.max(0, Math.min(1, vol))
    setVolumeState(clampedVol)
    if (audioRef.current) {
      audioRef.current.volume = clampedVol
    }
  }

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  const playNext = useCallback(() => {
    try {
      const playlist = localStorage.getItem('currentPlaylist')
      if (playlist) {
        const songs: Song[] = JSON.parse(playlist)
        const currentIdx = songs.findIndex(s => s.id === currentSong?.id)
        if (currentIdx !== -1) {
          const nextIdx = currentIdx < songs.length - 1 ? currentIdx + 1 : 0
          playSong(songs[nextIdx])
          return
        }
      }
    } catch {}
    
    if (currentIndex < songHistory.length - 1) {
      const nextSong = songHistory[currentIndex + 1]
      setCurrentIndex(currentIndex + 1)
      setCurrentSong(nextSong)
      setIsPlaying(true)
    }
  }, [currentSong, currentIndex, songHistory, playSong, setCurrentSong, setIsPlaying, setCurrentIndex])

  const playPrevious = useCallback(() => {
    try {
      const playlist = localStorage.getItem('currentPlaylist')
      if (playlist) {
        const songs: Song[] = JSON.parse(playlist)
        const currentIdx = songs.findIndex(s => s.id === currentSong?.id)
        if (currentIdx !== -1) {
          const prevIdx = currentIdx > 0 ? currentIdx - 1 : songs.length - 1
          playSong(songs[prevIdx])
          return
        }
      }
    } catch {}
    
    if (currentIndex > 0) {
      const prevSong = songHistory[currentIndex - 1]
      setCurrentIndex(currentIndex - 1)
      setCurrentSong(prevSong)
      setIsPlaying(true)
    }
  }, [currentSong, currentIndex, songHistory, playSong, setCurrentSong, setIsPlaying, setCurrentIndex])

  const hasNext = (() => {
    try {
      const playlist = localStorage.getItem('currentPlaylist')
      if (playlist && currentSong) {
        const songs: Song[] = JSON.parse(playlist)
        return songs.length > 0
      }
    } catch {}
    return currentIndex < songHistory.length - 1
  })()
  
  const hasPrevious = (() => {
    try {
      const playlist = localStorage.getItem('currentPlaylist')
      if (playlist && currentSong) {
        const songs: Song[] = JSON.parse(playlist)
        return songs.length > 0
      }
    } catch {}
    return currentIndex > 0
  })()

  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: currentSong.album || 'Unknown Album',
        artwork: currentSong.cover_image_url ? [
          { src: currentSong.cover_image_url, sizes: '512x512', type: 'image/jpeg' }
        ] : []
      })
      
      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true))
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false))
      navigator.mediaSession.setActionHandler('nexttrack', playNext)
      navigator.mediaSession.setActionHandler('previoustrack', playPrevious)
    }
  }, [currentSong, isPlaying, playNext, playPrevious])

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