'use client'

import { Box, Text, VStack } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { usePlayer } from '../../contexts/PlayerContext'
import { authStorage } from '../../lib/auth'

interface Song {
  id: string
  title: string
  artist: string
  album?: string
  duration_seconds?: number
  cover_image_url?: string
  audio_url?: string
}

export function LibraryContent() {
  const { playSong } = usePlayer()
  const [recentSongs, setRecentSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsAuthenticated(authStorage.isAuthenticated())
    loadRecentSongs()
  }, [])

  const handleSongClick = (song: Song) => {
    if (!isAuthenticated) {
      toast.dismiss()
      toast.error('Please log in to play songs')
      return
    }
    playSong(song)
  }

  const loadRecentSongs = () => {
    setLoading(true)
    try {
      const stored = localStorage.getItem('recentSongs')
      if (stored) {
        setRecentSongs(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load recent songs:', error)
      setRecentSongs([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box flex="1" bg="#121212" p={{ base: 4, md: 8 }} overflowY="auto">
      <VStack align="start" gap={8}>
        <Text fontSize="3xl" fontWeight="bold" color="white">
          Your Library
        </Text>

        <VStack align="start" gap={4} w="full">
          <Text fontSize="2xl" fontWeight="bold" color="white">
            Recent Songs
          </Text>
          {loading ? (
            <Text color="#a7a7a7">Loading...</Text>
          ) : recentSongs.length > 0 ? (
            <VStack align="start" gap={0} w="full">
              {recentSongs.map((song, index: number) => (
                <Box
                  key={song.id}
                  display="flex"
                  alignItems="center"
                  p={2}
                  w="full"
                  _hover={{ bg: '#1a1a1a' }}
                  borderRadius="4px"
                  cursor="pointer"
                  transition="all 0.1s ease"
                  onClick={() => handleSongClick(song)}
                >
                  <Text
                    color="#a7a7a7"
                    fontSize="16px"
                    w="40px"
                    textAlign="center"
                  >
                    {index + 1}
                  </Text>
                  <Box
                    w="40px"
                    h="40px"
                    bg="#282828"
                    borderRadius="4px"
                    mr={3}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {song.cover_image_url ? (
                      <img
                        src={song.cover_image_url}
                        alt={song.title}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '4px',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Text color="#a7a7a7" fontSize="12px">
                        ♪
                      </Text>
                    )}
                  </Box>
                  <Box flex="1" minW="0" maxW={{ base: "none", md: "300px" }}>
                    <Text
                      color="white"
                      fontWeight="400"
                      fontSize="16px"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {song.title}
                    </Text>
                    <Text
                      color="#a7a7a7"
                      fontSize="14px"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {song.artist}
                    </Text>
                  </Box>
                  <Text
                    color="#a7a7a7"
                    fontSize="14px"
                    mr={4}
                    minW="200px"
                    display={{ base: "none", md: "block" }}
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    {song.album && song.album !== 'Unknown' ? song.album : song.artist}
                  </Text>
                  <Text
                    color="#a7a7a7"
                    fontSize="14px"
                    minW="60px"
                    textAlign="right"
                    display={{ base: "none", md: "block" }}
                    mr={4}
                  >
                    {song.duration_seconds
                      ? `${Math.floor(song.duration_seconds / 60)}:${(
                          song.duration_seconds % 60
                        )
                          .toString()
                          .padStart(2, '0')}`
                      : '--:--'}
                  </Text>
                </Box>
              ))}
            </VStack>
          ) : (
            <Text color="#a7a7a7">No songs in your library yet.</Text>
          )}
        </VStack>

        <VStack align="start" gap={4} w="full">
          <Text fontSize="2xl" fontWeight="bold" color="white">
            Playlists
          </Text>
          <Text color="#a7a7a7">Coming soon...</Text>
        </VStack>
      </VStack>
    </Box>
  )
}
