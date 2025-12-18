'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Flex,
  // IconButton,
  useDisclosure,
} from '@chakra-ui/react'
import { FiTrash2, FiLock, FiRefreshCw } from 'react-icons/fi'

interface Song {
  id: string
  title: string
  artist: string
  album: string
  genre: string[]
  coverImage: string
  coverFile: File | null
  audioFile: File | null
}

interface ExistingSong {
  id: string
  title: string
  artist: string
  album: string
  duration_seconds: number
  file_path: string
  cover_image_url: string
  created_at: string
}

interface KeyExpiryInfo {
  expired: boolean
  expires_at: string
  seconds_remaining: number
  rotation_interval_seconds: number
}

const GENRES = [
  'Pop',
  'Hip Hop',
  'R&B',
  'Rock',
  'Electronic',
  'Jazz',
  'Country',
  'Classical',
  'Indie',
  'Soul',
  'Reggae',
  'Blues',
  'Folk',
  'Metal',
  'Punk',
  'Dance',
  'Latin',
  'K-Pop',
  'Alternative',
  'Trap',
]

// Use the same API URL logic as the rest of the app
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
    ? 'https://spotify-project-achx.onrender.com'
    : 'http://127.0.0.1:8000')

export default function AdminDashboard() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminToken, setAdminToken] = useState('')
  const [loginKey, setLoginKey] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [keyExpiry, setKeyExpiry] = useState<KeyExpiryInfo | null>(null)

  const [toastMessage, setToastMessage] = useState<{
    type: string
    text: string
  } | null>(null)
  const { open, onOpen, onClose } = useDisclosure()
  const [message, setMessage] = useState({ type: '', text: '' })
  const [songs, setSongs] = useState<Song[]>([
    {
      id: '1',
      title: '',
      artist: '',
      album: '',
      genre: [],
      coverImage: '',
      coverFile: null,
      audioFile: null,
    },
  ])
  const [existingSongs, setExistingSongs] = useState<ExistingSong[]>([])
  const [songToDelete, setSongToDelete] = useState<ExistingSong | null>(null)
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload')
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk'>('single')
  const [globalGenres, setGlobalGenres] = useState<string[]>([])
  const [globalAlbum, setGlobalAlbum] = useState('')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [artists, setArtists] = useState<string[]>([])
  const [artistInput, setArtistInput] = useState<{ [key: string]: string }>({})
  const [showArtistDropdown, setShowArtistDropdown] = useState<{
    [key: string]: boolean
  }>({})

  // Check for saved token on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem('adminToken')
    if (savedToken) {
      validateToken(savedToken)
    }
  }, [])

  // Fetch artists when authenticated
  useEffect(() => {
    if (isAuthenticated && adminToken) {
      fetchArtists()
    }
  }, [isAuthenticated, adminToken])

  const fetchArtists = async () => {
    if (!adminToken) return
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/artists`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
      if (response.ok) {
        const data = await response.json()
        setArtists(data.artists || [])
      }
    } catch (error) {
      console.error('Failed to fetch artists:', error)
    }
  }

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/key/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (!data.expired) {
          setAdminToken(token)
          setIsAuthenticated(true)
          setKeyExpiry(data)
          return true
        }
      }
      // Token invalid or expired
      sessionStorage.removeItem('adminToken')
      setIsAuthenticated(false)
      return false
    } catch {
      sessionStorage.removeItem('adminToken')
      setIsAuthenticated(false)
      return false
    }
  }

  const handleLogin = async () => {
    if (!loginKey.trim()) {
      setLoginError('Please enter the admin key')
      return
    }

    setLoginLoading(true)
    setLoginError('')

    try {
      console.log('Attempting login to:', `${API_URL}/api/v1/admin/login`)
      const response = await fetch(
        `${API_URL}/api/v1/admin/login?key=${encodeURIComponent(loginKey)}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setAdminToken(data.token)
        setKeyExpiry(data.key_expiry)
        setIsAuthenticated(true)
        sessionStorage.setItem('adminToken', data.token)
        setLoginKey('')
      } else {
        const error = await response.json()
        setLoginError(error.detail || 'Invalid admin key')
      }
    } catch (err) {
      console.error('Login error:', err)
      setLoginError(
        `Failed to connect to server at ${API_URL}. Make sure the backend is running.`
      )
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    setAdminToken('')
    setIsAuthenticated(false)
    setKeyExpiry(null)
    sessionStorage.removeItem('adminToken')
  }

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 100))
  }

  const fetchSongs = async () => {
    if (!adminToken) return

    try {
      const response = await fetch(`${API_URL}/api/v1/admin/songs`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setExistingSongs(data.songs || [])
      } else if (response.status === 401) {
        handleLogout()
        setLoginError('Session expired. Please login again.')
      }
    } catch {
      console.error('Failed to fetch songs')
    }
  }

  const deleteSong = async (songId: string) => {
    if (!adminToken) return

    try {
      const response = await fetch(`${API_URL}/api/v1/admin/songs/${songId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        setToastMessage({ type: 'success', text: 'Song deleted successfully' })
        setTimeout(() => setToastMessage(null), 3000)
        fetchSongs() // Refresh the list
      } else if (response.status === 401) {
        handleLogout()
        setLoginError('Session expired. Please login again.')
      } else {
        throw new Error('Failed to delete song')
      }
    } catch {
      setToastMessage({ type: 'error', text: 'Failed to delete song' })
      setTimeout(() => setToastMessage(null), 3000)
      console.error('Error deleting song')
    }
  }

  const handleDeleteClick = (song: ExistingSong) => {
    setSongToDelete(song)
    onOpen()
  }

  const confirmDelete = () => {
    if (songToDelete) {
      deleteSong(songToDelete.id)
      setSongToDelete(null)
      onClose()
    }
  }

  useEffect(() => {
    if (activeTab === 'manage' && isAuthenticated && adminToken) {
      fetchSongs()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAuthenticated, adminToken])

  const addSong = () => {
    setSongs([
      ...songs,
      {
        id: Date.now().toString(),
        title: '',
        artist: '',
        album: '',
        genre: [],
        coverImage: '',
        coverFile: null,
        audioFile: null,
      },
    ])
  }

  const removeSong = (id: string) => {
    setSongs(songs.filter((song) => song.id !== id))
  }

  const updateSong = (
    id: string,
    field: keyof Song,
    value: string | File | string[]
  ) => {
    setSongs(
      songs.map((song) => (song.id === id ? { ...song, [field]: value } : song))
    )
  }

  const handleArtistInputChange = (songId: string, value: string) => {
    setArtistInput({ ...artistInput, [songId]: value })
    updateSong(songId, 'artist', value)
    setShowArtistDropdown({ ...showArtistDropdown, [songId]: value.length > 0 })
  }

  const selectArtist = (songId: string, artist: string) => {
    setArtistInput({ ...artistInput, [songId]: artist })
    updateSong(songId, 'artist', artist)
    setShowArtistDropdown({ ...showArtistDropdown, [songId]: false })
  }

  const getFilteredArtists = (songId: string) => {
    const input = artistInput[songId] || ''
    if (!input) return []
    return artists.filter((a) => a.toLowerCase().includes(input.toLowerCase()))
  }

  const toggleGlobalGenre = (genre: string) => {
    const newGenres = globalGenres.includes(genre)
      ? globalGenres.filter((g) => g !== genre)
      : [...globalGenres, genre]
    setGlobalGenres(newGenres)

    // Apply to all songs
    setSongs(songs.map((song) => ({ ...song, genre: newGenres })))
  }

  const handleGlobalAlbumChange = (album: string) => {
    setGlobalAlbum(album)
    // Apply to all songs
    setSongs(songs.map((song) => ({ ...song, album })))
  }

  const handleFileChange = (songId: string, file: File) => {
    updateSong(songId, 'audioFile', file)
  }

  const toBase64 = (str: string): string => {
    return Buffer.from(str).toString('base64')
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Remove data:audio/mpeg;base64, prefix
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const uploadSong = async (song: Song) => {
    if (!song.title || !song.artist || !song.audioFile || !song.coverFile) {
      throw new Error(
        `Song "${
          song.title || 'Untitled'
        }" is missing required fields (title, artist, audio, cover)`
      )
    }

    const fileBase64 = await fileToBase64(song.audioFile)
    const coverBase64 = await fileToBase64(song.coverFile)

    const payload = {
      title: toBase64(song.title),
      artist: toBase64(song.artist),
      album: toBase64(song.album || 'Unknown'),
      cover_file_name: toBase64(song.coverFile.name),
      cover_content_type: toBase64(song.coverFile.type),
      cover_file_content: coverBase64,
      file_name: toBase64(song.audioFile.name),
      content_type: toBase64(song.audioFile.type),
      file_content: fileBase64,
    }

    const response = await fetch(`${API_URL}/api/v1/admin/songs/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(payload),
    })

    if (response.status === 401) {
      handleLogout()
      throw new Error('Session expired. Please login again.')
    }

    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.detail || result.error || 'Upload failed')
    }

    const result = await response.json()
    return result
  }

  const handleUpload = async () => {
    if (!adminToken) {
      setMessage({ type: 'error', text: 'Not authenticated. Please login.' })
      return
    }

    const songsToUpload = uploadMode === 'single' ? [songs[0]] : songs
    const validSongs = songsToUpload.filter(
      (s) => s.title && s.artist && s.audioFile && s.coverFile
    )

    if (validSongs.length === 0) {
      setMessage({
        type: 'error',
        text: 'Please fill in all required fields for at least one song',
      })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    let successCount = 0
    let failCount = 0
    const errors: string[] = []

    for (const song of validSongs) {
      try {
        addLog(`Uploading: ${song.title} by ${song.artist}`)
        const result = await uploadSong(song)
        addLog(`✓ Success: ${song.title} (ID: ${result.data.id})`)
        successCount++
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        addLog(`✗ Failed: ${song.title} - ${errorMessage}`)
        failCount++
        errors.push(`${song.title}: ${errorMessage}`)
      }
    }

    setLoading(false)

    if (successCount > 0 && failCount === 0) {
      setMessage({
        type: 'success',
        text: `Successfully uploaded ${successCount} song(s)!`,
      })
      // Reset form
      setSongs([
        {
          id: '1',
          title: '',
          artist: '',
          album: '',
          genre: [],
          coverImage: '',
          coverFile: null,
          audioFile: null,
        },
      ])
      // Refresh song list if on manage tab
      if (activeTab === 'manage') {
        fetchSongs()
      }
    } else if (successCount > 0 && failCount > 0) {
      setMessage({
        type: 'warning',
        text: `Uploaded ${successCount} song(s). Failed: ${failCount}. Errors: ${errors.join(
          '; '
        )}`,
      })
    } else {
      setMessage({
        type: 'error',
        text: `All uploads failed. ${errors.join('; ')}`,
      })
    }
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <Box
        bg="gray.900"
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          bg="white"
          p={8}
          borderRadius="12px"
          boxShadow="xl"
          w="400px"
          maxW="90%"
        >
          <VStack gap={6} align="stretch">
            <HStack justify="center" gap={3}>
              <FiLock size={32} color="#1DB954" />
              <Text fontSize="24px" fontWeight="700" color="black">
                Admin Access
              </Text>
            </HStack>

            <Text color="gray.600" textAlign="center" fontSize="sm">
              Enter the SHA-256 admin key from the backend console to access the
              admin dashboard.
            </Text>

            {loginError && (
              <Box
                p={3}
                borderRadius="4px"
                bg="red.50"
                border="1px solid"
                borderColor="red.200"
              >
                <Text color="red.600" fontSize="sm">
                  {loginError}
                </Text>
              </Box>
            )}

            <Box>
              <Text fontWeight="500" mb={2} color="black" fontSize="sm">
                Admin Key
              </Text>
              <Input
                type="password"
                placeholder="Enter 64-character SHA-256 key"
                value={loginKey}
                onChange={(e) => setLoginKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                border="1px solid #ccc"
                color="black"
                _placeholder={{ color: '#999' }}
                _focus={{
                  borderColor: '#1DB954',
                  boxShadow: '0 0 0 1px #1DB954',
                }}
                fontFamily="monospace"
                fontSize="sm"
              />
            </Box>

            <Button
              onClick={handleLogin}
              disabled={loginLoading || !loginKey.trim()}
              bg="#1DB954"
              color="white"
              size="lg"
              _hover={{ bg: '#1ed760' }}
              _disabled={{ bg: 'gray.300', cursor: 'not-allowed' }}
            >
              {loginLoading ? 'Authenticating...' : 'Login to Admin'}
            </Button>

            <Text color="gray.500" fontSize="xs" textAlign="center">
              The admin key is displayed in the backend terminal when the server
              starts. Look for &quot;🔐 ADMIN KEY ROTATED&quot;
            </Text>
          </VStack>
        </Box>
      </Box>
    )
  }

  // Authenticated Admin Dashboard
  return (
    <Box bg="white" minH="100vh" p={8}>
      {/* Header with logout */}
      <HStack justify="space-between" maxW="1400px" mx="auto" mb={6}>
        <HStack gap={3}>
          <FiLock color="#1DB954" />
          <Text fontWeight="600" color="black">
            Admin Dashboard
          </Text>
          {keyExpiry && !keyExpiry.expired && (
            <Text fontSize="xs" color="gray.500">
              Key expires in {Math.floor(keyExpiry.seconds_remaining / 60)} min
            </Text>
          )}
        </HStack>
        <HStack gap={3}>
          <Button
            size="sm"
            variant="outline"
            colorScheme="gray"
            onClick={() => validateToken(adminToken)}
          >
            <FiRefreshCw />
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorScheme="red"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </HStack>
      </HStack>

      <HStack maxW="1400px" mx="auto" gap={6} align="start">
        {/* Left Sidebar - Global Settings */}
        <Box w="250px" border="1px solid #ddd" p={4} borderRadius="4px">
          <Text fontWeight="600" mb={4} color={'black'}>
            Global Settings
          </Text>

          {/* Global Album */}
          <Box mb={4}>
            <Text fontWeight="500" mb={2} color={'black'}>
              Album
            </Text>
            <Input
              placeholder="Enter album name"
              value={globalAlbum}
              onChange={(e) => handleGlobalAlbumChange(e.target.value)}
              border="1px solid #ccc"
              size="sm"
              color="black"
              _placeholder={{ color: '#666' }}
              _focus={{ borderColor: '#007bff', boxShadow: 'none' }}
            />
          </Box>

          {/* Global Genres */}
          <Box>
            <Text fontWeight="500" mb={2} color={'black'}>
              Genres
            </Text>
            <VStack align="start" gap={1} maxH="300px" overflowY="auto">
              {GENRES.map((genre) => (
                <HStack key={genre} gap={2} color={'black'}>
                  <input
                    type="checkbox"
                    checked={globalGenres.includes(genre)}
                    onChange={() => toggleGlobalGenre(genre)}
                  />
                  <Text fontSize="xs">{genre}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        </Box>

        {/* Main Content */}
        <VStack flex={1} gap={4} align="stretch">
          {/* Message */}
          {message.text && (
            <Box
              p={3}
              borderRadius="4px"
              bg={
                message.type === 'success'
                  ? '#d4edda'
                  : message.type === 'warning'
                  ? '#fff3cd'
                  : '#f8d7da'
              }
              color={
                message.type === 'success'
                  ? '#155724'
                  : message.type === 'warning'
                  ? '#856404'
                  : '#721c24'
              }
              border={`1px solid ${
                message.type === 'success'
                  ? '#c3e6cb'
                  : message.type === 'warning'
                  ? '#ffeaa7'
                  : '#f5c6cb'
              }`}
            >
              {message.text}
            </Box>
          )}

          {/* Main Tabs */}
          <HStack gap={2} mb={4}>
            <Button
              onClick={() => setActiveTab('upload')}
              variant={activeTab === 'upload' ? 'solid' : 'outline'}
              colorScheme="blue"
              size="sm"
            >
              Upload Songs
            </Button>
            <Button
              onClick={() => setActiveTab('manage')}
              variant={activeTab === 'manage' ? 'solid' : 'outline'}
              colorScheme="blue"
              size="sm"
            >
              Manage Songs
            </Button>
          </HStack>

          {/* Upload Mode Tabs */}
          {activeTab === 'upload' && (
            <HStack gap={2} mb={4}>
              <Button
                onClick={() => setUploadMode('single')}
                variant={uploadMode === 'single' ? 'solid' : 'outline'}
                colorScheme="green"
                size="xs"
              >
                Single Upload
              </Button>
              <Button
                onClick={() => setUploadMode('bulk')}
                variant={uploadMode === 'bulk' ? 'solid' : 'outline'}
                colorScheme="green"
                size="xs"
              >
                Bulk Upload
              </Button>
            </HStack>
          )}

          {/* Content based on active tab */}
          {activeTab === 'upload' ? (
            <>
              {/* Songs List */}
              <VStack gap={4} align="stretch">
                {(uploadMode === 'single' ? [songs[0]] : songs).map(
                  (song, index) => (
                    <Box
                      key={song.id}
                      border="1px solid #ddd"
                      p={4}
                      borderRadius="4px"
                    >
                      <Flex justify="space-between" align="center" mb={3}>
                        <Text fontWeight="500" fontSize="16px" color="black">
                          Song {index + 1}
                        </Text>
                        {uploadMode === 'bulk' && songs.length > 1 && (
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            onClick={() => removeSong(song.id)}
                          >
                            Remove
                          </Button>
                        )}
                      </Flex>

                      <VStack gap={3} align="stretch">
                        {/* Title */}
                        <Box>
                          <Text fontWeight="500" mb={1} color="black">
                            Song Title *
                          </Text>
                          <Input
                            placeholder="Enter song title"
                            value={song.title}
                            onChange={(e) =>
                              updateSong(song.id, 'title', e.target.value)
                            }
                            border="1px solid #ccc"
                            color="black"
                            _placeholder={{ color: '#666' }}
                            _focus={{
                              borderColor: '#007bff',
                              boxShadow: 'none',
                            }}
                          />
                        </Box>

                        {/* Artist */}
                        <Box position="relative">
                          <Text fontWeight="500" mb={1} color={'black'}>
                            Artist *
                          </Text>
                          <Input
                            placeholder="Enter or select artist name"
                            value={artistInput[song.id] || song.artist}
                            onChange={(e) =>
                              handleArtistInputChange(song.id, e.target.value)
                            }
                            onFocus={() =>
                              setShowArtistDropdown({
                                ...showArtistDropdown,
                                [song.id]: true,
                              })
                            }
                            border="1px solid #ccc"
                            color="black"
                            _placeholder={{ color: '#666' }}
                            _focus={{
                              borderColor: '#007bff',
                              boxShadow: 'none',
                            }}
                          />
                          {showArtistDropdown[song.id] &&
                            getFilteredArtists(song.id).length > 0 && (
                              <Box
                                position="absolute"
                                top="100%"
                                left={0}
                                right={0}
                                bg="white"
                                border="1px solid #ccc"
                                borderTop="none"
                                maxH="200px"
                                overflowY="auto"
                                zIndex={10}
                                boxShadow="md"
                              >
                                {getFilteredArtists(song.id).map((artist) => (
                                  <Box
                                    key={artist}
                                    p={2}
                                    cursor="pointer"
                                    _hover={{ bg: 'gray.100' }}
                                    onClick={() => selectArtist(song.id, artist)}
                                    color="black"
                                  >
                                    {artist}
                                  </Box>
                                ))}
                              </Box>
                            )}
                        </Box>

                        {/* Cover Image */}
                        <Box>
                          <Text fontWeight="500" mb={1} color="black">
                            Cover Image *
                          </Text>
                          <Input
                            type="file"
                            accept="image/*"
                            color={'black'}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                updateSong(
                                  song.id,
                                  'coverFile',
                                  e.target.files[0]
                                )
                              }
                            }}
                            border="1px solid #ccc"
                            p={1}
                          />
                          {song.coverFile && (
                            <Text fontSize="sm" color="gray.600" mt={1}>
                              {song.coverFile.name} (
                              {(song.coverFile.size / 1024).toFixed(2)} KB)
                            </Text>
                          )}
                        </Box>

                        {/* Audio File */}
                        <Box>
                          <Text fontWeight="500" mb={1} color="black">
                            Audio File *
                          </Text>
                          <Input
                            type="file"
                            accept="audio/*"
                            color={'black'}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileChange(song.id, e.target.files[0])
                              }
                            }}
                            border="1px solid #ccc"
                            p={1}
                          />
                          {song.audioFile && (
                            <Text fontSize="sm" color="gray.600" mt={1}>
                              {song.audioFile.name} (
                              {(song.audioFile.size / (1024 * 1024)).toFixed(2)}{' '}
                              MB)
                            </Text>
                          )}
                        </Box>
                      </VStack>
                    </Box>
                  )
                )}
              </VStack>

              {/* Add Another Song (Bulk Mode) */}
              {uploadMode === 'bulk' && (
                <Button onClick={addSong} variant="outline" colorScheme="blue">
                  Add Another Song
                </Button>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={loading}
                colorScheme="blue"
                size="lg"
              >
                {loading ? 'Uploading...' : ''}
                Upload{' '}
                {uploadMode === 'bulk'
                  ? `${
                      songs.filter(
                        (s) => s.title && s.artist && s.audioFile && s.coverFile
                      ).length
                    } Song(s)`
                  : 'Song'}
              </Button>
            </>
          ) : (
            /* Song Management */
            <Box>
              <HStack justify="space-between" mb={4}>
                <Text fontSize="18px" fontWeight="600">
                  Existing Songs ({existingSongs.length})
                </Text>
                <Button size="sm" onClick={fetchSongs}>
                  Refresh
                </Button>
              </HStack>

              <Box border="1px solid #ddd" borderRadius="4px" overflow="hidden">
                <Box bg="gray.50" p={3} borderBottom="1px solid #ddd">
                  <HStack>
                    <Text fontWeight="600" flex="2">
                      Title
                    </Text>
                    <Text fontWeight="600" flex="2">
                      Artist
                    </Text>
                    <Text fontWeight="600" flex="2">
                      Album
                    </Text>
                    <Text fontWeight="600" flex="1">
                      Duration
                    </Text>
                    <Text fontWeight="600" flex="1">
                      Created
                    </Text>
                    <Text fontWeight="600" w="80px">
                      Actions
                    </Text>
                  </HStack>
                </Box>

                {existingSongs.map((song) => (
                  <Box
                    key={song.id}
                    p={3}
                    borderBottom="1px solid #eee"
                    _hover={{ bg: 'gray.50' }}
                  >
                    <HStack>
                      <Text fontWeight="500" flex="2">
                        {song.title}
                      </Text>
                      <Text flex="2">{song.artist}</Text>
                      <Text flex="2">{song.album}</Text>
                      <Text flex="1">
                        {Math.floor(song.duration_seconds / 60)}:
                        {(song.duration_seconds % 60)
                          .toString()
                          .padStart(2, '0')}
                      </Text>
                      <Text flex="1">
                        {new Date(song.created_at).toLocaleDateString()}
                      </Text>
                      <Box w="80px">
                        <Button
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDeleteClick(song)}
                        >
                          <FiTrash2 />
                        </Button>
                      </Box>
                    </HStack>
                  </Box>
                ))}

                {existingSongs.length === 0 && (
                  <Box p={8} textAlign="center">
                    <Text color="gray.600">
                      No songs found. Upload some songs first!
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </VStack>

        {/* Toast Message */}
        {toastMessage && (
          <Box
            position="fixed"
            top="20px"
            right="20px"
            p={4}
            borderRadius="8px"
            bg={toastMessage.type === 'success' ? 'green.500' : 'red.500'}
            color="white"
            zIndex="1001"
          >
            {toastMessage.text}
          </Box>
        )}

        {/* Right Sidebar - Server Logs */}
        <Box w="300px" border="1px solid #ddd" p={4} borderRadius="4px">
          <HStack justify="space-between" mb={3}>
            <Text fontWeight="600" color={'black'}>
              Server Logs
            </Text>
            <Button size="xs" variant="outline" onClick={() => setLogs([])}>
              Clear
            </Button>
          </HStack>
          <Box
            bg="#f8f9fa"
            border="1px solid #e9ecef"
            borderRadius="4px"
            p={3}
            h="500px"
            overflowY="auto"
            fontFamily="monospace"
            fontSize="xs"
          >
            {logs.length === 0 ? (
              <Text color="gray.600">No logs yet...</Text>
            ) : (
              logs.map((log, index) => (
                <Text
                  key={index}
                  mb={1}
                  color={
                    log.includes('✓')
                      ? 'green.600'
                      : log.includes('✗')
                      ? 'red.600'
                      : 'black'
                  }
                >
                  {log}
                </Text>
              ))
            )}
          </Box>
        </Box>
      </HStack>

      {/* Delete Confirmation Modal */}
      {open && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="1000"
        >
          <Box bg="white" p={6} borderRadius="8px" maxW="400px" w="90%">
            <Text fontSize="18px" fontWeight="600" mb={4}>
              Delete Song
            </Text>
            <Text mb={6}>
              Are you sure you want to delete &quot;{songToDelete?.title}&quot;
              by {songToDelete?.artist}? This action cannot be undone.
            </Text>
            <HStack justify="flex-end" gap={3}>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete}>
                Delete
              </Button>
            </HStack>
          </Box>
        </Box>
      )}
    </Box>
  )
}
