'use client'

import { Box, Text, SimpleGrid, VStack, Input } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { FiSearch } from 'react-icons/fi'
import { useSearch } from '../../contexts/SearchContext'
import { usePlayer } from '../../contexts/PlayerContext'
import { apiRequest } from '../../config/api'
import { authStorage } from '../../lib/auth'

interface Song {
  id: string
  title: string
  artist: string
  album?: string
  duration_seconds?: number
  cover_image_url?: string
  audio_url?: string
  file_path?: string
}

const playlists = [
  { id: 1, name: "Today's Top Hits", image: '/placeholder.jpg' },
  { id: 2, name: 'RapCaviar', image: '/placeholder.jpg' },
  { id: 3, name: 'All Out 2010s', image: '/placeholder.jpg' },
  { id: 4, name: 'Rock Classics', image: '/placeholder.jpg' },
  { id: 5, name: 'Chill Hits', image: '/placeholder.jpg' },
  { id: 6, name: 'Pop Rising', image: '/placeholder.jpg' },
]

export function MainContent() {
  const { showSearch } = useSearch()
  const { playSong } = usePlayer()
  const [userName, setUserName] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [allSongs, setAllSongs] = useState<Song[]>([])
  const [songsLoading, setSongsLoading] = useState(false)

  useEffect(() => {
    const session = authStorage.getSession()
    setIsAuthenticated(authStorage.isAuthenticated())
    if (session?.user?.name) {
      setUserName(session.user.name)
    }

    // Load all songs on mount
    loadAllSongs()
  }, [])

  const handleSongClick = (song: Song) => {
    if (!isAuthenticated) {
      alert('Please log in to play songs')
      return
    }
    playSong(song)
  }

  const loadAllSongs = async () => {
    setSongsLoading(true)
    try {
      const response = await apiRequest('/api/v1/songs?page=1&limit=50')
      setAllSongs(response.songs || [])
    } catch (error) {
      console.error('Failed to load songs:', error)
      setAllSongs([])
    } finally {
      setSongsLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const response = await apiRequest(
        `/api/v1/search?q=${encodeURIComponent(query)}`
      )
      setSearchResults(response.songs || [])
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  return (
    <Box flex="1" bg="#121212" p={{ base: 4, md: 8 }} overflowY="auto">
      <VStack align="start" gap={8}>
        <Text fontSize="3xl" fontWeight="bold" color="white">
          Good evening{userName ? `, ${userName}` : ''}
        </Text>

        {showSearch && (
          <VStack align="start" gap={4} w="full">
            <Box position="relative" w="full" maxW="400px">
              <Box
                position="absolute"
                left={3}
                top="50%"
                transform="translateY(-50%)"
                zIndex={2}
              >
                <FiSearch color="#a7a7a7" size={20} />
              </Box>
              <Input
                placeholder="What do you want to listen to?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="#242424"
                border="none"
                color="white"
                h="48px"
                pl={12}
                borderRadius="500px"
                _placeholder={{ color: '#a7a7a7' }}
                _hover={{ bg: '#2a2a2a' }}
                _focus={{ bg: '#2a2a2a', boxShadow: 'none' }}
                autoFocus
              />
            </Box>

            {searchLoading && <Text color="#a7a7a7">Searching...</Text>}

            {searchResults.length > 0 && (
              <VStack align="start" gap={0} w="full">
                <Text color="white" fontWeight="bold" mb={4}>
                  Search Results
                </Text>
                {searchResults.map((song, index: number) => (
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
                          onError={(e) => {
                            console.error('Failed to load cover:', song.cover_image_url)
                            e.currentTarget.style.display = 'none'
                          }}
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
                    <Box flex="1">
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
                      minW="120px"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                    >
                      {song.album && song.album !== 'Unknown' ? song.album : song.artist}
                    </Text>
                    <Text
                      color="#a7a7a7"
                      fontSize="14px"
                      minW="50px"
                      textAlign="right"
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
            )}

            {searchQuery && !searchLoading && searchResults.length === 0 && (
              <Text color="#a7a7a7">
                No results found for &quot;{searchQuery}&quot;
              </Text>
            )}
          </VStack>
        )}

        <VStack align="start" gap={4} w="full">
          <Text fontSize="2xl" fontWeight="bold" color="white">
            All Songs
          </Text>
          {songsLoading ? (
            <Text color="#a7a7a7">Loading songs...</Text>
          ) : allSongs.length > 0 ? (
            <VStack align="start" gap={0} w="full">
              {allSongs.map((song, index: number) => (
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
                        onError={(e) => {
                          console.error('Failed to load cover:', song.cover_image_url)
                          e.currentTarget.style.display = 'none'
                        }}
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
                  <Box flex="1">
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
                    minW={{ base: "0", md: "120px" }}
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
                    minW="50px"
                    textAlign="right"
                    display={{ base: "none", md: "block" }}
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
            <Text color="#a7a7a7">
              No songs uploaded yet. Visit /admin to upload songs.
            </Text>
          )}
        </VStack>

        <VStack align="start" gap={4} w="full">
          <Text fontSize="2xl" fontWeight="bold" color="white">
            Made for you
          </Text>
          <SimpleGrid columns={{ base: 2, md: 3 }} gap={{ base: 4, md: 6 }} w="full">
            {playlists.map((playlist) => (
              <Box
                key={playlist.id}
                bg="#535353"
                p={4}
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: 'gray.600' }}
                transition="all 0.2s"
              >
                <VStack gap={3}>
                  <Box
                    w={{ base: "100%", md: "150px" }}
                    h={{ base: "120px", md: "150px" }}
                    bg="gray.500"
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="white" fontSize="sm">
                      {playlist.name}
                    </Text>
                  </Box>
                  <Text color="white" fontWeight="medium" textAlign="center">
                    {playlist.name}
                  </Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </VStack>
    </Box>
  )
}
