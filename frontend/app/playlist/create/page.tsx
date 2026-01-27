'use client'

import { Box, VStack, Text, Input, Button, Flex } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Sidebar } from '../../components/navigation/Sidebar'
import { Player } from '../../components/player/Player'
import { AuthButtons } from '../../components/auth/AuthButtons'
import { UserProfile } from '../../components/user/UserProfile'
import { authStorage } from '../../lib/auth'
import { apiRequest } from '../../config/api'

interface Song {
  id: string
  title: string
  artist: string
  album?: string
  cover_image_url?: string
}

export default function CreatePlaylistPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [isAuthenticated] = useState(() => authStorage.isAuthenticated())
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [allSongs, setAllSongs] = useState<Song[]>([])
  const [selectedSongs, setSelectedSongs] = useState<string[]>([])
  const [songsLoading, setSongsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadSongs()
  }, [])

  const loadSongs = async () => {
    setSongsLoading(true)
    try {
      const response = await apiRequest('/api/v1/songs?page=1&limit=100')
      setAllSongs(response.songs || [])
    } catch (error) {
      console.error('Failed to load songs:', error)
    } finally {
      setSongsLoading(false)
    }
  }

  const toggleSong = (songId: string) => {
    setSelectedSongs(prev => 
      prev.includes(songId) 
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    )
  }

  const handleCreate = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to create playlists')
      return
    }

    if (!name.trim()) {
      toast.error('Please enter a playlist name')
      return
    }

    setLoading(true)
    try {
      const session = authStorage.getSession()
      
      const response = await apiRequest('/api/v1/playlists', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          is_public: isPublic,
          user_id: session?.user?.id,
          song_ids: selectedSongs
        })
      })
      
      if (response.success) {
        toast.dismiss()
        toast.success('Playlist created successfully!')
        // Trigger sidebar refresh
        window.dispatchEvent(new CustomEvent('playlistsChanged'))
        router.push('/library')
      }
    } catch (error) {
      console.error('Failed to create playlist:', error)
      toast.dismiss()
      toast.error('Failed to create playlist')
    } finally {
      setLoading(false)
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
          <VStack align="start" gap={6} maxW="600px">
            <Text fontSize="3xl" fontWeight="bold" color="white">
              Create Playlist
            </Text>

            <VStack align="start" gap={4} w="full">
              <Box w="full">
                <Text color="white" fontWeight="700" mb={2}>Playlist Name</Text>
                <Input
                  placeholder="My Playlist"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  bg="#242424"
                  border="none"
                  color="white"
                  h="48px"
                  _placeholder={{ color: '#a7a7a7' }}
                  _hover={{ bg: '#2a2a2a' }}
                  _focus={{ bg: '#2a2a2a', boxShadow: 'none' }}
                />
              </Box>

              <Box w="full">
                <Text color="white" fontWeight="700" mb={2}>Description (optional)</Text>
                <Input
                  placeholder="Add a description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  bg="#242424"
                  border="none"
                  color="white"
                  h="48px"
                  _placeholder={{ color: '#a7a7a7' }}
                  _hover={{ bg: '#2a2a2a' }}
                  _focus={{ bg: '#2a2a2a', boxShadow: 'none' }}
                />
              </Box>

              <Box w="full">
                <Text color="white" fontWeight="700" mb={3}>Privacy</Text>
                <Flex gap={4}>
                  <Button
                    onClick={() => setIsPublic(true)}
                    bg={isPublic ? '#1db954' : '#242424'}
                    color={isPublic ? 'black' : 'white'}
                    _hover={{ bg: isPublic ? '#1ed760' : '#2a2a2a' }}
                    flex="1"
                  >
                    Public
                  </Button>
                  <Button
                    onClick={() => setIsPublic(false)}
                    bg={!isPublic ? '#1db954' : '#242424'}
                    color={!isPublic ? 'black' : 'white'}
                    _hover={{ bg: !isPublic ? '#1ed760' : '#2a2a2a' }}
                    flex="1"
                  >
                    Private
                  </Button>
                </Flex>
                <Text color="#a7a7a7" fontSize="sm" mt={2}>
                  {isPublic ? 'Anyone can search and view this playlist' : 'Only you can see this playlist'}
                </Text>
              </Box>

              <Box w="full">
                <Text color="white" fontWeight="700" mb={3}>Add Songs (optional)</Text>
                <Box 
                  maxH="300px" 
                  overflowY="auto" 
                  bg="#242424" 
                  borderRadius="md" 
                  p={3}
                >
                  {songsLoading ? (
                    <Text color="#a7a7a7">Loading songs...</Text>
                  ) : allSongs.length > 0 ? (
                    <VStack align="start" gap={2}>
                      {allSongs.map((song) => (
                        <Box
                          key={song.id}
                          display="flex"
                          alignItems="center"
                          gap={3}
                          w="full"
                          p={2}
                          bg={selectedSongs.includes(song.id) ? '#1db954' : 'transparent'}
                          borderRadius="md"
                          cursor="pointer"
                          onClick={() => toggleSong(song.id)}
                          _hover={{ bg: selectedSongs.includes(song.id) ? '#1ed760' : '#2a2a2a' }}
                        >
                          <Box
                            w="40px"
                            h="40px"
                            bg="#282828"
                            borderRadius="4px"
                            overflow="hidden"
                            flexShrink={0}
                          >
                            {song.cover_image_url ? (
                              <img
                                src={song.cover_image_url}
                                alt={song.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <Box w="full" h="full" display="flex" alignItems="center" justifyContent="center">
                                <Text color="#a7a7a7" fontSize="12px">♪</Text>
                              </Box>
                            )}
                          </Box>
                          <Box flex="1" minW="0">
                            <Text color={selectedSongs.includes(song.id) ? 'black' : 'white'} fontSize="sm" fontWeight="500">
                              {song.title}
                            </Text>
                            <Text color={selectedSongs.includes(song.id) ? 'black' : '#a7a7a7'} fontSize="xs">
                              {song.artist}
                            </Text>
                          </Box>
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Text color="#a7a7a7">No songs available</Text>
                  )}
                </Box>
                <Text color="#a7a7a7" fontSize="sm" mt={2}>
                  {selectedSongs.length} song{selectedSongs.length !== 1 ? 's' : ''} selected
                </Text>
              </Box>

              <Flex gap={4} w="full" mt={4}>
                <Button
                  onClick={() => router.back()}
                  variant="ghost"
                  color="white"
                  flex="1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  loading={loading}
                  bg="#1db954"
                  color="black"
                  _hover={{ bg: '#1ed760' }}
                  flex="1"
                >
                  Create
                </Button>
              </Flex>
            </VStack>
          </VStack>
        </Box>
      </Flex>
      <Player />
    </Box>
  )
}
