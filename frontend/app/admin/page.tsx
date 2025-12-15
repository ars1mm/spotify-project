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
import { FiTrash2 } from 'react-icons/fi'

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

export default function AdminDashboard() {
  const adminToken = 'admin-secret-key-123'
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

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 100))
  }

  const fetchSongs = async () => {
    try {
      const apiUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://spotify-project-achx.onrender.com'
          : 'http://127.0.0.1:8000'

      const response = await fetch(`${apiUrl}/api/v1/admin/songs`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setExistingSongs(data.songs || [])
      }
    } catch {
      console.error('Failed to fetch songs:')
    }
  }

  const deleteSong = async (songId: string) => {
    try {
      const apiUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://spotify-project-achx.onrender.com'
          : 'http://127.0.0.1:8000'

      const response = await fetch(`${apiUrl}/api/v1/admin/songs/${songId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        setToastMessage({ type: 'success', text: 'Song deleted successfully' })
        setTimeout(() => setToastMessage(null), 3000)
        fetchSongs() // Refresh the list
      } else {
        throw new Error('Failed to delete song')
      }
    } catch  {
        setToastMessage({ type: 'error', text: 'Failed to delete song' })
        setTimeout(() => setToastMessage(null), 3000)
        console.error('Error deleting song:')
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
    if (activeTab === 'manage') {
      fetchSongs()
    }
  }, [activeTab])

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
        `Song "${song.title || 'Untitled'}" is missing required fields (title, artist, audio, cover)`
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

    const apiUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://spotify-project-achx.onrender.com'
        : 'http://127.0.0.1:8000'

    const response = await fetch(`${apiUrl}/api/v1/admin/songs/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.detail || result.error || 'Upload failed')
    }

    const result = await response.json()
    return result
  }

  const handleUpload = async () => {
    if (!adminToken) {
      setMessage({ type: 'error', text: 'Please provide admin token' })
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

  return (
    <Box bg="white" minH="100vh" p={8}>
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
          <Text fontSize="24px" fontWeight="600" color="black" mb={4}>
            Admin Dashboard
          </Text>

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
                        <Box>
                          <Text fontWeight="500" mb={1} color={'black'}>
                            Artist *
                          </Text>
                          <Input
                            placeholder="Enter artist name"
                            value={song.artist}
                            onChange={(e) =>
                              updateSong(song.id, 'artist', e.target.value)
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
                                updateSong(song.id, 'coverFile', e.target.files[0])
                              }
                            }}
                            border="1px solid #ccc"
                            p={1}
                          />
                          {song.coverFile && (
                            <Text fontSize="sm" color="gray.600" mt={1}>
                              {song.coverFile.name} ({(song.coverFile.size / 1024).toFixed(2)} KB)
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
                      songs.filter((s) => s.title && s.artist && s.audioFile && s.coverFile)
                        .length
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
            <Text fontWeight="600" color={'black'}>Server Logs</Text>
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
