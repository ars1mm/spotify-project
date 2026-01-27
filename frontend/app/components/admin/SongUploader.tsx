/**
 * ************************************
 * EN: SONG UPLOADER COMPONENT
 *    Handles song upload functionality (single and bulk)
 * AL: KOMPONENTI I NGARKIMIT TË KËNGËVE
 *    Menaxhon funksionalitetin e ngarkimit të këngëve (njësh dhe masiv)
 * ************************************
 * 
 * HOW TO ADD A NEW UPLOAD FIELD:
 * 1. Add the field to the Song interface in types/admin.ts
 * 2. Add a new state for the field
 * 3. Create UI input for the field
 * 4. Update the uploadSong function to include the field
 * 5. Add validation if needed
 * 
 * SI TË SHTONI NJË FUSHË TË RE NGARKIMI:
 * 1. Shtoni fushën në ndërfaqen Song në types/admin.ts
 * 2. Shtoni një gjendje të re për fushën
 * 3. Krijoni input UI për fushën
 * 4. Përditësoni funksionin uploadSong për të përfshirë fushën
 * 5. Shtoni validim nëse nevojitet
 */

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
} from '@chakra-ui/react'
import { Song, GENRES } from '../../types/admin'

interface SongUploaderProps {
  adminToken: string
  addLog: (message: string) => void
  onUploadComplete: () => void
}

export default function SongUploader({
  adminToken,
  addLog,
  onUploadComplete,
}: SongUploaderProps) {
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
  const [uploadMode, setUploadMode] = useState<'single' | 'bulk'>('single')
  const [loading, setLoading] = useState(false)
  const [globalGenres, setGlobalGenres] = useState<string[]>([])
  const [globalAlbum, setGlobalAlbum] = useState('')
  const [artists, setArtists] = useState<string[]>([])
  const [artistInput, setArtistInput] = useState<{ [key: string]: string }>({})
  const [showArtistDropdown, setShowArtistDropdown] = useState<{
    [key: string]: boolean
  }>({})

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
      ? 'https://spotify-project-achx.onrender.com'
      : 'http://127.0.0.1:8000')

  useEffect(() => {
    let isMounted = true
    
    const loadArtists = async () => {
      if (!adminToken) return
      try {
        const response = await fetch(`${API_URL}/api/v1/admin/artists`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        })
        if (response.ok && isMounted) {
          const data = await response.json()
          setArtists(data.artists || [])
        }
      } catch (error) {
        console.error('Failed to fetch artists:', error)
      }
    }

    if (adminToken) {
      loadArtists()
    }

    return () => {
      isMounted = false
    }
  }, [adminToken, API_URL])

  const toBase64 = (str: string): string => {
    return Buffer.from(str).toString('base64')
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const uploadSong = async (song: Song) => {
    if (!song.title || !song.artist || !song.audioFile || !song.coverFile) {
      throw new Error(
        `Song "${song.title || 'Untitled'}" is missing required fields`
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

    if (!response.ok) {
      const result = await response.json()
      throw new Error(result.detail || result.error || 'Upload failed')
    }

    return response.json()
  }

  const handleUpload = async () => {
    const songsToUpload = uploadMode === 'single' ? [songs[0]] : songs
    const validSongs = songsToUpload.filter(
      (s) => s.title && s.artist && s.audioFile && s.coverFile
    )

    if (validSongs.length === 0) {
      return { successCount: 0, failCount: 0, errors: ['No valid songs to upload'] }
    }

    setLoading(true)
    let successCount = 0
    let failCount = 0
    const errors: string[] = []

    for (const song of validSongs) {
      try {
        addLog(`Uploading: ${song.title} by ${song.artist}`)
        const result = await uploadSong(song)
        addLog(`✓ Success: ${song.title} (ID: ${result.data.id})`)
        successCount++
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        addLog(`✗ Failed: ${song.title} - ${errorMessage}`)
        failCount++
        errors.push(`${song.title}: ${errorMessage}`)
      }
    }

    setLoading(false)

    if (successCount > 0) {
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
      onUploadComplete()
    }

    return { successCount, failCount, errors }
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
    value: string | File | string[] | null
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
    setSongs(songs.map((song) => ({ ...song, genre: newGenres })))
  }

  const handleGlobalAlbumChange = (album: string) => {
    setGlobalAlbum(album)
    setSongs(songs.map((song) => ({ ...song, album })))
  }

  return (
    <VStack gap={4} align="stretch">
      {/* Global Settings */}
      <Box border="1px solid #ddd" p={4} borderRadius="4px">
        <Text fontWeight="600" mb={4} color="black">
          Global Settings
        </Text>

        <Box mb={4}>
          <Text fontWeight="500" mb={2} color="black">
            Album
          </Text>
          <Input
            placeholder="Enter album name"
            value={globalAlbum}
            onChange={(e) => handleGlobalAlbumChange(e.target.value)}
            border="1px solid #ccc"
            size="sm"
            color="black"
          />
        </Box>

        <Box>
          <Text fontWeight="500" mb={2} color="black">
            Genres
          </Text>
          <VStack align="start" gap={1} maxH="150px" overflowY="auto">
            {GENRES.slice(0, 10).map((genre) => (
              <HStack key={genre} gap={2} color="black">
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

      {/* Upload Mode Tabs */}
      <HStack gap={2}>
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

      {/* Songs List */}
      <VStack gap={4} align="stretch">
        {(uploadMode === 'single' ? [songs[0]] : songs).map((song, index) => (
          <Box key={song.id} border="1px solid #ddd" p={4} borderRadius="4px">
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
                  onChange={(e) => updateSong(song.id, 'title', e.target.value)}
                  border="1px solid #ccc"
                  color="black"
                />
              </Box>

              {/* Artist */}
              <Box position="relative">
                <Text fontWeight="500" mb={1} color="black">
                  Artist *
                </Text>
                <Input
                  placeholder="Enter or select artist"
                  value={artistInput[song.id] || song.artist}
                  onChange={(e) => handleArtistInputChange(song.id, e.target.value)}
                  border="1px solid #ccc"
                  color="black"
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
                      zIndex={10}
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
                  color="black"
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
                    {song.coverFile.name}
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
                  color="black"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      updateSong(song.id, 'audioFile', e.target.files[0])
                    }
                  }}
                  border="1px solid #ccc"
                  p={1}
                />
                {song.audioFile && (
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    {song.audioFile.name}
                  </Text>
                )}
              </Box>
            </VStack>
          </Box>
        ))}
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
        {loading
          ? 'Uploading...'
          : `Upload ${uploadMode === 'bulk' ? `${songs.filter((s) => s.title && s.artist && s.audioFile && s.coverFile).length} Song(s)` : 'Song'}`}
      </Button>
    </VStack>
  )
}
