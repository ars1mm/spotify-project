'use client'

import { Box, Text, SimpleGrid, VStack, Input, Button } from '@chakra-ui/react'
import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
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

interface Playlist {
  id: string
  name: string
  description: string
  is_public: boolean
  user_id: string
  created_at: string
}

export function MainContent() {
  const { showSearch } = useSearch()
  const { playSong } = usePlayer()
  const [userName, setUserName] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [searchPlaylists, setSearchPlaylists] = useState<Playlist[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [allSongs, setAllSongs] = useState<Song[]>([])
  const [songsLoading, setSongsLoading] = useState(false)
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null)
  const [selectedMix, setSelectedMix] = useState<string | null>(null)
  const [mixSongs, setMixSongs] = useState<Song[]>([])

  const dailyMixCovers = useMemo(() => {
    if (allSongs.length === 0) return { mix1: null, mix2: null }
    return {
      mix1: allSongs[Math.floor(Math.random() * allSongs.length)]?.cover_image_url,
      mix2: allSongs[Math.floor(Math.random() * allSongs.length)]?.cover_image_url
    }
  }, [allSongs])

  const uniqueArtists = useMemo(() => {
    const artistSet = new Set<string>()
    allSongs.forEach(song => {
      const primaryArtist = song.artist.split(/feat\.|ft\.|,|&/i)[0].trim()
      artistSet.add(primaryArtist)
    })
    return Array.from(artistSet)
  }, [allSongs])

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
      toast.dismiss()
      toast.error('Please log in to play songs')
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
      setSearchPlaylists([])
      return
    }

    setSearchLoading(true)
    try {
      const response = await apiRequest(
        `/api/v1/search?q=${encodeURIComponent(query)}`
      )
      setSearchResults(response.songs || [])
      setSearchPlaylists(response.playlists || [])
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
      setSearchPlaylists([])
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

            {searchPlaylists.length > 0 && (
              <VStack align="start" gap={4} w="full">
                <Text color="white" fontWeight="bold" fontSize="xl">
                  Playlists
                </Text>
                <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={4} w="full">
                  {searchPlaylists.map((playlist) => (
                    <Box
                      key={playlist.id}
                      bg="#181818"
                      p={4}
                      borderRadius="8px"
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{ bg: '#282828' }}
                      onClick={() => window.location.href = `/playlist/${playlist.id}`}
                    >
                      <Box
                        w="full"
                        h="120px"
                        bg="#282828"
                        borderRadius="8px"
                        mb={3}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text color="#a7a7a7" fontSize="48px">
                          ♪
                        </Text>
                      </Box>
                      <Text
                        color="white"
                        fontWeight="bold"
                        fontSize="14px"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {playlist.name}
                      </Text>
                      {playlist.description && (
                        <Box
                          color="#a7a7a7"
                          fontSize="12px"
                          mt={1}
                          overflow="hidden"
                          textOverflow="ellipsis"
                          display="-webkit-box"
                          css={{
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {playlist.description}
                        </Box>
                      )}
                    </Box>
                  ))}
                </SimpleGrid>
              </VStack>
            )}

            {searchResults.length > 0 && (
              <VStack align="start" gap={0} w="full">
                <Text color="white" fontWeight="bold" fontSize="xl" mb={4}>
                  Songs
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

            {searchQuery && !searchLoading && searchResults.length === 0 && searchPlaylists.length === 0 && (
              <Text color="#a7a7a7">
                No results found for &quot;{searchQuery}&quot;
              </Text>
            )}
          </VStack>
        )}

        <VStack align="start" gap={4} w="full">
          <Text fontSize="2xl" fontWeight="bold" color="white">
            Made For You
          </Text>
          {songsLoading ? (
            <Text color="#a7a7a7">Loading...</Text>
          ) : allSongs.length > 0 ? (
            selectedArtist || selectedMix ? (
                <VStack align="start" gap={4} w="full">
                  <Button
                    onClick={() => { setSelectedArtist(null); setSelectedMix(null); }}
                    bg="transparent"
                    color="#1db954"
                    _hover={{ color: '#1ed760' }}
                    p={0}
                    fontSize="sm"
                  >
                    ← Back to playlists
                  </Button>
                  <VStack align="start" gap={0} w="full">
                    {(selectedMix ? mixSongs : allSongs.filter(s => s.artist.toLowerCase().includes(selectedArtist?.toLowerCase() || ''))).map((song, index) => (
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
                        <Text color="#a7a7a7" fontSize="16px" w="40px" textAlign="center">{index + 1}</Text>
                        <Box w="40px" h="40px" bg="#282828" borderRadius="4px" mr={3} display="flex" alignItems="center" justifyContent="center">
                          {song.cover_image_url ? (
                            <img src={song.cover_image_url} alt={song.title} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                          ) : (
                            <Text color="#a7a7a7" fontSize="12px">♪</Text>
                          )}
                        </Box>
                        <Box flex="1">
                          <Text color="white" fontWeight="400" fontSize="16px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{song.title}</Text>
                          <Text color="#a7a7a7" fontSize="14px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{song.artist}</Text>
                        </Box>
                        <Text color="#a7a7a7" fontSize="14px" mr={4} minW="120px" display={{ base: "none", md: "block" }} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                          {song.album && song.album !== 'Unknown' ? song.album : song.artist}
                        </Text>
                        <Text color="#a7a7a7" fontSize="14px" minW="50px" textAlign="right" display={{ base: "none", md: "block" }}>
                          {song.duration_seconds ? `${Math.floor(song.duration_seconds / 60)}:${(song.duration_seconds % 60).toString().padStart(2, '0')}` : '--:--'}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </VStack>
            ) : (
              <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} gap={4} w="full">
                {/* Daily Mix 1 */}
                <Box
                  bg="#181818"
                  p={4}
                  borderRadius="8px"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ bg: '#282828' }}
                  onClick={() => {
                    const shuffled = [...allSongs].sort(() => 0.5 - Math.random()).slice(0, 20)
                    setMixSongs(shuffled)
                    setSelectedMix('mix1')
                  }}
                >
                  <Box w="full" h="150px" bg="#282828" borderRadius="8px" mb={3} overflow="hidden">
                    {dailyMixCovers.mix1 ? (
                      <img src={dailyMixCovers.mix1} alt="Daily Mix 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Box display="flex" alignItems="center" justifyContent="center" h="full">
                        <Text color="#a7a7a7" fontSize="48px">♪</Text>
                      </Box>
                    )}
                  </Box>
                  <Text color="white" fontWeight="bold" fontSize="16px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                    Daily Mix 1
                  </Text>
                  <Text color="#a7a7a7" fontSize="14px" mt={1} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                    Random songs for you
                  </Text>
                </Box>
                {/* Daily Mix 2 */}
                <Box
                  bg="#181818"
                  p={4}
                  borderRadius="8px"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{ bg: '#282828' }}
                  onClick={() => {
                    const shuffled = [...allSongs].sort(() => 0.5 - Math.random()).slice(0, 20)
                    setMixSongs(shuffled)
                    setSelectedMix('mix2')
                  }}
                >
                  <Box w="full" h="150px" bg="#282828" borderRadius="8px" mb={3} overflow="hidden">
                    {dailyMixCovers.mix2 ? (
                      <img src={dailyMixCovers.mix2} alt="Daily Mix 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Box display="flex" alignItems="center" justifyContent="center" h="full">
                        <Text color="#a7a7a7" fontSize="48px">♪</Text>
                      </Box>
                    )}
                  </Box>
                  <Text color="white" fontWeight="bold" fontSize="16px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                    Daily Mix 2
                  </Text>
                  <Text color="#a7a7a7" fontSize="14px" mt={1} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                    Random songs for you
                  </Text>
                </Box>
                {/* Artist playlists */}
                {uniqueArtists.map((artist) => {
                  const artistSongs = allSongs.filter(s => s.artist.toLowerCase().includes(artist.toLowerCase()))
                  const coverImage = artistSongs[0]?.cover_image_url
                  return (
                    <Box
                      key={artist}
                      bg="#181818"
                      p={4}
                      borderRadius="8px"
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{ bg: '#282828' }}
                      onClick={() => setSelectedArtist(artist)}
                    >
                      <Box w="full" h="150px" bg="#282828" borderRadius="8px" mb={3} overflow="hidden">
                        {coverImage ? (
                          <img src={coverImage} alt={artist} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Box display="flex" alignItems="center" justifyContent="center" h="full">
                            <Text color="#a7a7a7" fontSize="48px">♪</Text>
                          </Box>
                        )}
                      </Box>
                      <Text color="white" fontWeight="bold" fontSize="16px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                        This is {artist}
                      </Text>
                      <Text color="#a7a7a7" fontSize="14px" mt={1} overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                        {artist} and more
                      </Text>
                    </Box>
                  )
                })}
              </SimpleGrid>
            )
          ) : (
            <Text color="#a7a7a7">
              No songs available yet.
            </Text>
          )}
        </VStack>
      </VStack>
    </Box>
  )
}
