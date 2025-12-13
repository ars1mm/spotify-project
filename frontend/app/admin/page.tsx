'use client'

import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Select,
  Flex,
  Badge,
} from '@chakra-ui/react'
import { FiUpload, FiX, FiPlus, FiMusic, FiTrash2 } from 'react-icons/fi'

interface Song {
  id: string
  title: string
  artist: string
  album: string
  genre: string[]
  coverImage: string
  audioFile: File | null
}

const POPULAR_ARTISTS = [
  'Travis Scott',
  'Drake',
  'The Weeknd',
  'Taylor Swift',
  'Ed Sheeran',
  'Ariana Grande',
  'Post Malone',
  'Billie Eilish',
  'Dua Lipa',
  'Justin Bieber',
  'Kanye West',
  'Beyoncé',
  'Rihanna',
  'Bruno Mars',
  'Adele',
]

const POPULAR_ALBUMS = [
  'UTOPIA',
  'Certified Lover Boy',
  'After Hours',
  'Midnights',
  'Divide',
  'Thank U, Next',
  "Hollywood's Bleeding",
  'Happier Than Ever',
  'Future Nostalgia',
  'Justice',
  'Donda',
  'Renaissance',
  'ANTI',
  '24K Magic',
  '30',
]

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
  const [adminToken, setAdminToken] = useState('admin-secret-key-123')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [songs, setSongs] = useState<Song[]>([
    {
      id: '1',
      title: '',
      artist: '',
      album: '',
      genre: [],
      coverImage: '',
      audioFile: null,
    },
  ])
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single')
  const [globalGenres, setGlobalGenres] = useState<string[]>([])
  const [globalAlbum, setGlobalAlbum] = useState('')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 100))
  }

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
        audioFile: null,
      },
    ])
  }

  const removeSong = (id: string) => {
    setSongs(songs.filter((song) => song.id !== id))
  }

  const updateSong = (id: string, field: keyof Song, value: string | File | string[]) => {
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
    setSongs(songs.map(song => ({ ...song, genre: newGenres })))
  }

  const handleGlobalAlbumChange = (album: string) => {
    setGlobalAlbum(album)
    // Apply to all songs
    setSongs(songs.map(song => ({ ...song, album })))
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
    if (!song.title || !song.artist || !song.audioFile) {
      throw new Error(
        `Song "${song.title || 'Untitled'}" is missing required fields`
      )
    }

    const fileBase64 = await fileToBase64(song.audioFile)

    const payload = {
      title: toBase64(song.title),
      artist: toBase64(song.artist),
      album: toBase64(song.album || 'Unknown'),
      cover_image: toBase64(song.coverImage || ''),
      file_name: toBase64(song.audioFile.name),
      content_type: toBase64(song.audioFile.type),
      file_content: fileBase64,
    }

    const response = await fetch(
      'http://127.0.0.1:8000/api/v1/admin/songs/upload',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      }
    )

    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.detail || result.error || 'Upload failed')
    }

    return await response.json()
  }

  const handleUpload = async () => {
    if (!adminToken) {
      setMessage({ type: 'error', text: 'Please provide admin token' })
      return
    }

    const songsToUpload = activeTab === 'single' ? [songs[0]] : songs
    const validSongs = songsToUpload.filter(
      (s) => s.title && s.artist && s.audioFile
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
        await uploadSong(song)
        addLog(`✓ Success: ${song.title}`)
        successCount++
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
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
          audioFile: null,
        },
      ])
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
          <Text fontWeight="600" mb={4}>Global Settings</Text>
          
          {/* Global Album */}
          <Box mb={4}>
            <Text fontWeight="500" mb={2}>Album</Text>
            <Input
              placeholder="Enter album name"
              value={globalAlbum}
              onChange={(e) => handleGlobalAlbumChange(e.target.value)}
              border="1px solid #ccc"
              size="sm"
              _focus={{ borderColor: '#007bff', boxShadow: 'none' }}
            />
          </Box>
          
          {/* Global Genres */}
          <Box>
            <Text fontWeight="500" mb={2}>Genres</Text>
            <VStack align="start" gap={1} maxH="300px" overflowY="auto">
              {GENRES.map((genre) => (
                <HStack key={genre} gap={2}>
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

        {/* Tabs */}
        <HStack gap={2} mb={4}>
          <Button
            onClick={() => setActiveTab('single')}
            variant={activeTab === 'single' ? 'solid' : 'outline'}
            colorScheme="blue"
            size="sm"
          >
            Single Upload
          </Button>
          <Button
            onClick={() => setActiveTab('bulk')}
            variant={activeTab === 'bulk' ? 'solid' : 'outline'}
            colorScheme="blue"
            size="sm"
          >
            Bulk Upload
          </Button>
        </HStack>

        {/* Songs List */}
        <VStack gap={4} align="stretch">
          {(activeTab === 'single' ? [songs[0]] : songs).map((song, index) => (
            <Box
              key={song.id}
              border="1px solid #ddd"
              p={4}
              borderRadius="4px"
            >
              <Flex justify="space-between" align="center" mb={3}>
                <Text fontWeight="500" fontSize="16px">
                  Song {index + 1}
                </Text>
                {activeTab === 'bulk' && songs.length > 1 && (
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
                  <Text fontWeight="500" mb={1}>
                    Song Title *
                  </Text>
                  <Input
                    placeholder="Enter song title"
                    value={song.title}
                    onChange={(e) =>
                      updateSong(song.id, 'title', e.target.value)
                    }
                    border="1px solid #ccc"
                    _focus={{ borderColor: '#007bff', boxShadow: 'none' }}
                  />
                </Box>

                {/* Artist */}
                <Box>
                  <Text fontWeight="500" mb={1}>
                    Artist *
                  </Text>
                  <Input
                    placeholder="Enter artist name"
                    value={song.artist}
                    onChange={(e) =>
                      updateSong(song.id, 'artist', e.target.value)
                    }
                    border="1px solid #ccc"
                    _focus={{ borderColor: '#007bff', boxShadow: 'none' }}
                  />
                </Box>



                {/* Audio File */}
                <Box>
                  <Text fontWeight="500" mb={1}>
                    Audio File *
                  </Text>
                  <Input
                    type="file"
                    accept="audio/*"
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
                      {song.audioFile.name} ({(song.audioFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </Text>
                  )}
                </Box>
              </VStack>
            </Box>
          ))}
        </VStack>

        {/* Add Another Song (Bulk Mode) */}
        {activeTab === 'bulk' && (
          <Button
            onClick={addSong}
            variant="outline"
            colorScheme="blue"
          >
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
          Upload {activeTab === 'bulk' ? `${songs.filter((s) => s.title && s.artist && s.audioFile).length} Song(s)` : 'Song'}
        </Button>
        </VStack>
        
        {/* Right Sidebar - Server Logs */}
        <Box w="300px" border="1px solid #ddd" p={4} borderRadius="4px">
          <HStack justify="space-between" mb={3}>
            <Text fontWeight="600">Server Logs</Text>
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
              <Text color="gray.500">No logs yet...</Text>
            ) : (
              logs.map((log, index) => (
                <Text key={index} mb={1} color={log.includes('✓') ? 'green.600' : log.includes('✗') ? 'red.600' : 'black'}>
                  {log}
                </Text>
              ))
            )}
          </Box>
        </Box>
      </HStack>
    </Box>
  )
}
