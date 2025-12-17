'use client'

import { Box, VStack, Text, Flex, IconButton, Button, Input, Textarea } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Sidebar } from '../../components/navigation/Sidebar'
import { Player } from '../../components/player/Player'
import { AuthButtons } from '../../components/auth/AuthButtons'
import { UserProfile } from '../../components/user/UserProfile'
import { usePlayer } from '../../contexts/PlayerContext'
import { authStorage } from '../../lib/auth'
import { apiRequest } from '../../config/api'

interface Song {
  id: string
  title: string
  artist: string
  album?: string
  duration_seconds?: number
  cover_image_url?: string
  audio_url?: string
}

interface Playlist {
  id: string
  name: string
  description: string
  is_public: boolean
  user_id: string
  created_at: string
  users?: {
    name: string
  }
}

export default function PlaylistPage() {
  const params = useParams()
  const router = useRouter()
  const { playSong } = usePlayer()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated] = useState(() => authStorage.isAuthenticated())
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editIsPublic, setEditIsPublic] = useState(true)
  const [showAddSongs, setShowAddSongs] = useState(false)
  const [allSongs, setAllSongs] = useState<Song[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const currentUserId = authStorage.getUser()?.id

  useEffect(() => {
    if (params.id) {
      loadPlaylist(params.id as string)
    }
  }, [params.id])

  const loadPlaylist = async (playlistId: string) => {
    setLoading(true)
    try {
      const response = await apiRequest(`/api/v1/playlists/${playlistId}`)
      setPlaylist(response.playlist)
      setSongs(response.songs || [])
    } catch (error) {
      console.error('Failed to load playlist:', error)
      toast.dismiss()
      toast.error('Failed to load playlist')
    } finally {
      setLoading(false)
    }
  }

  const handleSongClick = (song: Song) => {
    if (!isAuthenticated) {
      toast.dismiss()
      toast.error('Please log in to play songs')
      return
    }
    playSong(song)
  }

  const openSettings = async () => {
    if (playlist) {
      setEditName(playlist.name)
      setEditDescription(playlist.description)
      setEditIsPublic(playlist.is_public)
      setIsSettingsOpen(true)
      
      // Load all songs for adding
      try {
        const response = await apiRequest('/api/v1/songs?page=1&limit=100')
        setAllSongs(response.songs || [])
      } catch (error) {
        console.error('Failed to load songs:', error)
      }
    }
  }

  const handleUpdatePlaylist = async () => {
    try {
      await apiRequest(`/api/v1/playlists/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editName, description: editDescription, is_public: editIsPublic })
      })
      toast.success('Playlist updated')
      setIsSettingsOpen(false)
      loadPlaylist(params.id as string)
    } catch (error) {
      toast.error('Failed to update playlist')
    }
  }

  const handleRemoveSong = async (songId: string) => {
    try {
      await apiRequest(`/api/v1/playlists/${params.id}/songs/${songId}`, { method: 'DELETE' })
      toast.success('Song removed')
      loadPlaylist(params.id as string)
    } catch (error) {
      toast.error('Failed to remove song')
    }
  }

  const handleAddSong = async (songId: string) => {
    try {
      await apiRequest(`/api/v1/playlists/${params.id}/songs/${songId}`, { method: 'POST' })
      toast.success('Song added')
      loadPlaylist(params.id as string)
    } catch (error) {
      toast.error('Failed to add song')
    }
  }

  return (
    <Box h="100vh" bg="#191414">
      <Box position="absolute" top={{ base: "8px", md: 4 }} right={4} zIndex={16}>
        {isAuthenticated ? <UserProfile /> : <AuthButtons />}
      </Box>

      <Flex h="100vh" pt={{ base: "56px", md: 0 }} pb="90px">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <Box flex="1" bg="#121212" p={{ base: 4, md: 8 }} overflowY="auto">
          {loading ? (
            <Text color="white">Loading...</Text>
          ) : playlist ? (
            <VStack align="start" gap={6} w="full">
              <Flex gap={6} align="end" w="full">
                  <Box
                    w={{ base: "160px", md: "232px" }}
                    h={{ base: "160px", md: "232px" }}
                    bg="#282828"
                    borderRadius="8px"
                    flexShrink={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="0 4px 60px rgba(0,0,0,.5)"
                  >
                    {songs.length > 0 && songs[0].cover_image_url ? (
                      <img
                        src={songs[0].cover_image_url}
                        alt={playlist.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '8px',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Text color="#a7a7a7" fontSize="48px">
                        ♪
                      </Text>
                    )}
                  </Box>
                  <Box flex="1" pb={4} position="relative">
                    <Flex align="center" justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="bold" color="white" textTransform="uppercase">
                        Playlist
                      </Text>
                      {currentUserId === playlist.user_id && (
                        <Button
                          aria-label="Settings"
                          onClick={openSettings}
                          bg="transparent"
                          _hover={{ bg: 'rgba(255,255,255,0.1)' }}
                          color="white"
                          minW="auto"
                          p={2}
                        >
                          <Text fontSize="20px">⚙️</Text>
                        </Button>
                      )}
                    </Flex>
                    <Text fontSize={{ base: "2xl", md: "5xl" }} fontWeight="bold" color="white">
                      {playlist.name}
                    </Text>
                    {playlist.description && (
                      <Text color="#a7a7a7" mt={2}>
                        {playlist.description}
                      </Text>
                    )}
                    <Flex align="center" gap={1} fontSize="sm" mt={2}>
                      {playlist.users?.name && (
                        <Text color="white" fontWeight="bold">
                          {playlist.users.name}
                        </Text>
                      )}
                      {playlist.users?.name && <Text color="#a7a7a7">•</Text>}
                      <Text color="#a7a7a7">
                        {songs.length} song{songs.length !== 1 ? 's' : ''}
                      </Text>
                      {songs.length > 0 && (
                        <>
                          <Text color="#a7a7a7">•</Text>
                          <Text color="#a7a7a7">
                            {(() => {
                              const totalSeconds = songs.reduce((acc, song) => acc + (song.duration_seconds || 0), 0)
                              const hours = Math.floor(totalSeconds / 3600)
                              const minutes = Math.floor((totalSeconds % 3600) / 60)
                              return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`
                            })()}
                          </Text>
                        </>
                      )}
                    </Flex>
                  </Box>
                </Flex>

              <VStack align="start" gap={0} w="full">
                {songs.length > 0 ? (
                  songs.map((song, index) => (
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
                      {currentUserId === playlist.user_id && (
                        <Button
                          aria-label="Remove"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('Remove this song from playlist?')) {
                              handleRemoveSong(song.id)
                            }
                          }}
                          bg="transparent"
                          _hover={{ bg: 'rgba(255,255,255,0.1)' }}
                          color="#a7a7a7"
                          size="sm"
                          minW="auto"
                          p={1}
                        >
                          <Text fontSize="18px">✕</Text>
                        </Button>
                      )}
                    </Box>
                  ))
                ) : (
                  <Text color="#a7a7a7">No songs in this playlist yet.</Text>
                )}
              </VStack>
            </VStack>
          ) : (
            <Text color="white">Playlist not found</Text>
          )}
        </Box>
      </Flex>
      <Player />
      
      {isSettingsOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0,0,0,0.8)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1000}
          onClick={() => setIsSettingsOpen(false)}
        >
          <Box
            bg="#282828"
            borderRadius="8px"
            p={6}
            maxW="500px"
            w="90%"
            onClick={(e) => e.stopPropagation()}
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontSize="2xl" fontWeight="bold" color="white">
                {showAddSongs ? 'Add Songs' : 'Playlist Settings'}
              </Text>
              {!showAddSongs && (
                <Button
                  size="sm"
                  bg="#1db954"
                  color="white"
                  _hover={{ bg: '#1ed760' }}
                  onClick={() => setShowAddSongs(true)}
                >
                  + Add Songs
                </Button>
              )}
            </Flex>
            {showAddSongs ? (
              <VStack gap={4} align="stretch" maxH="400px" overflowY="auto">
                <Input
                  placeholder="Search songs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="#3e3e3e"
                  border="none"
                  color="white"
                />
                {allSongs
                  .filter(song => 
                    !songs.find(s => s.id === song.id) &&
                    (song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     song.artist.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map(song => (
                    <Flex
                      key={song.id}
                      align="center"
                      gap={3}
                      p={2}
                      bg="#3e3e3e"
                      borderRadius="4px"
                      _hover={{ bg: '#4e4e4e' }}
                      cursor="pointer"
                      onClick={() => handleAddSong(song.id)}
                    >
                      <Box w="40px" h="40px" bg="#282828" borderRadius="4px" flexShrink={0}>
                        {song.cover_image_url ? (
                          <img src={song.cover_image_url} alt={song.title} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                        ) : (
                          <Flex align="center" justify="center" h="full">
                            <Text color="#a7a7a7" fontSize="12px">♪</Text>
                          </Flex>
                        )}
                      </Box>
                      <Box flex="1" minW="0">
                        <Text
                          color="white"
                          fontSize="14px"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                        >
                          {song.title}
                        </Text>
                        <Text
                          color="#a7a7a7"
                          fontSize="12px"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                        >
                          {song.artist}
                        </Text>
                      </Box>
                    </Flex>
                  ))}
              </VStack>
            ) : (
              <VStack gap={4} align="stretch">
              <Box>
                <Text color="white" mb={2} fontSize="sm">Name</Text>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  bg="#3e3e3e"
                  border="none"
                  color="white"
                />
              </Box>
              <Box>
                <Text color="white" mb={2} fontSize="sm">Description</Text>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  bg="#3e3e3e"
                  border="none"
                  color="white"
                />
              </Box>
              <Flex align="center" justify="space-between">
                <Text color="white" fontSize="sm">Public</Text>
                <Button
                  size="sm"
                  bg={editIsPublic ? '#1db954' : '#3e3e3e'}
                  onClick={() => setEditIsPublic(!editIsPublic)}
                  _hover={{ opacity: 0.8 }}
                  color="white"
                >
                  {editIsPublic ? 'Yes' : 'No'}
                </Button>
              </Flex>
              </VStack>
            )}
            <Flex gap={3} mt={6} justify="flex-end">
              {showAddSongs ? (
                <Button
                  onClick={() => setShowAddSongs(false)}
                  bg="transparent"
                  color="white"
                  _hover={{ bg: '#3e3e3e' }}
                >
                  Back
                </Button>
              ) : (
                <Button
                  onClick={() => setIsSettingsOpen(false)}
                  bg="transparent"
                  color="white"
                  _hover={{ bg: '#3e3e3e' }}
                >
                  Cancel
                </Button>
              )}
              {!showAddSongs && (
                <Button
                  onClick={handleUpdatePlaylist}
                  bg="#1db954"
                  color="white"
                  _hover={{ bg: '#1ed760' }}
                >
                  Save
                </Button>
              )}
            </Flex>
          </Box>
        </Box>
      )}
    </Box>
  )
}
