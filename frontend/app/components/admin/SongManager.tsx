/**
 * ************************************
 * EN: SONG MANAGER COMPONENT
 *    Displays and manages existing songs with delete functionality
 * AL: KOMPONENTI I MENAXHERIT TË KËNGËVE
 *    Shfaq dhe menaxhon këngët ekzistuese me funksionalitetin e fshirjes
 * ************************************
 * 
 * HOW TO ADD A NEW ACTION TO SONG LIST:
 * 1. Add a new column in the header
 * 2. Add the action button/icon in the song row
 * 3. Create handler function for the action
 * 4. Update the API call to support the new action
 * 
 * SI TË SHTONI NJË VEPRIM TË RI NË LISTËN E KËNGËVE:
 * 1. Shtoni një kolonë të re në kokë
 * 2. Shtoni butonin/iconin e veprimit në rreshtin e këngës
 * 3. Krijoni funksionin trajtues për veprimin
 * 4. Përditësoni thirrjen API për të mbështetur veprimin e ri
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Box, HStack, Text, Button } from '@chakra-ui/react'
import { FiTrash2, FiRefreshCw } from 'react-icons/fi'
import { ExistingSong } from '@/types/admin'
import { useDisclosure } from '@chakra-ui/react'

interface SongManagerProps {
  adminToken: string
  onLogout: () => void
}

export default function SongManager({ adminToken, onLogout }: SongManagerProps) {
  const [songs, setSongs] = useState<ExistingSong[]>([])
  const { open, onOpen, onClose } = useDisclosure()
  const [songToDelete, setSongToDelete] = useState<ExistingSong | null>(null)
  const [toastMessage, setToastMessage] = useState<{
    type: string
    text: string
  } | null>(null)

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
      ? 'https://spotify-project-achx.onrender.com'
      : 'http://127.0.0.1:8000')

      // UseCallback to avoid re-creating the function on each render
      // USAGE: Fetch songs from the server -> Sets the songs state with the fetched data
  const fetchSongs = useCallback(async () => {
    if (!adminToken) return

    try {
      const response = await fetch(`${API_URL}/api/v1/admin/songs`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSongs(data.songs || [])
      } else if (response.status === 401) {
        onLogout()
      }
    } catch {
      console.error('Failed to fetch songs')
    }
  }, [adminToken, onLogout, API_URL])

  const deleteSong = useCallback(async (songId: string) => {
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
        fetchSongs()
      } else if (response.status === 401) {
        onLogout()
      } else {
        throw new Error('Failed to delete song')
      }
    } catch {
      setToastMessage({ type: 'error', text: 'Failed to delete song' })
      setTimeout(() => setToastMessage(null), 3000)
    }
  }, [adminToken, onLogout, API_URL, fetchSongs]) 

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
    fetchSongs()
  }, [adminToken, fetchSongs])

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="18px" fontWeight="600" color="black">
          Existing Songs ({songs.length})
        </Text>
        <Button size="sm" onClick={fetchSongs}>
          <FiRefreshCw />
        </Button>
      </HStack>

      <Box border="1px solid #ddd" borderRadius="4px" overflow="hidden">
        <Box bg="gray.50" p={3} borderBottom="1px solid #ddd">
          <HStack>
            <Text fontWeight="600" flex="2" color="black">
              Title
            </Text>
            <Text fontWeight="600" flex="2" color="black">
              Artist
            </Text>
            <Text fontWeight="600" flex="2" color="black">
              Album
            </Text>
            <Text fontWeight="600" flex="1" color="black">
              Duration
            </Text>
            <Text fontWeight="600" flex="1" color="black">
              Created
            </Text>
            <Text fontWeight="600" w="80px" color="black">
              Actions
            </Text>
          </HStack>
        </Box>

        {songs.map((song) => (
          <Box
            key={song.id}
            p={3}
            borderBottom="1px solid #eee"
            _hover={{ bg: 'gray.50' }}
          >
            <HStack>
              <Text fontWeight="500" flex="2" color="black">
                {song.title}
              </Text>
              <Text flex="2" color="black">
                {song.artist}
              </Text>
              <Text flex="2" color="black">
                {song.album}
              </Text>
              <Text flex="1" color="black">
                {Math.floor(song.duration_seconds / 60)}:
                {(song.duration_seconds % 60).toString().padStart(2, '0')}
              </Text>
              <Text flex="1" color="black">
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

        {songs.length === 0 && (
          <Box p={8} textAlign="center">
            <Text color="gray.600">
              No songs found. Upload some songs first!
            </Text>
          </Box>
        )}
      </Box>

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
            <Text fontSize="18px" fontWeight="600" mb={4} color="black">
              Delete Song
            </Text>
            <Text mb={6} color="black">
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
    </Box>
  )
}
