'use client';

import { Box, Text, SimpleGrid, VStack, Input } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useHealthCheck } from '../../hooks/useApi';
import { useSearch } from '../../contexts/SearchContext';
import { apiRequest } from '../../config/api';
import { authStorage } from '../../lib/auth';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration_seconds?: number;
  cover_image_url?: string;
}

const playlists = [
  { id: 1, name: 'Today\'s Top Hits', image: '/placeholder.jpg' },
  { id: 2, name: 'RapCaviar', image: '/placeholder.jpg' },
  { id: 3, name: 'All Out 2010s', image: '/placeholder.jpg' },
  { id: 4, name: 'Rock Classics', image: '/placeholder.jpg' },
  { id: 5, name: 'Chill Hits', image: '/placeholder.jpg' },
  { id: 6, name: 'Pop Rising', image: '/placeholder.jpg' },
];

export function MainContent() {
  const { isHealthy, loading: healthLoading } = useHealthCheck();
  const { showSearch } = useSearch();
  const [userName, setUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const session = authStorage.getSession();
    if (session?.user?.name) {
      setUserName(session.user.name);
    }
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await apiRequest(`/api/v1/search?q=${encodeURIComponent(query)}`);
      setSearchResults(response.songs || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <Box flex="1" bg="#121212" p={8} overflowY="auto">
      <VStack align="start" gap={8}>
        <Text fontSize="3xl" fontWeight="bold" color="white">
          Good evening{userName ? `, ${userName}` : ''}
        </Text>
        
        {showSearch && (
          <VStack align="start" gap={4} w="full">
            <Box position="relative" w="full" maxW="400px">
              <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" zIndex={2}>
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
            
            {searchLoading && (
              <Text color="#a7a7a7">Searching...</Text>
            )}
            
            {searchResults.length > 0 && (
              <VStack align="start" gap={0} w="full">
                <Text color="white" fontWeight="bold" mb={4}>Search Results</Text>
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
                  >
                    <Text color="#a7a7a7" fontSize="16px" w="40px" textAlign="center">
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
                          style={{ width: '40px', height: '40px', borderRadius: '4px' }}
                        />
                      ) : (
                        <Text color="#a7a7a7" fontSize="12px">♪</Text>
                      )}
                    </Box>
                    <Box flex="1">
                      <Text color="white" fontWeight="400" fontSize="16px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                        {song.title}
                      </Text>
                      <Text color="#a7a7a7" fontSize="14px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                        {song.artist}
                      </Text>
                    </Box>
                    <Text color="#a7a7a7" fontSize="14px" mr={4} minW="120px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                      {song.album || 'Unknown Album'}
                    </Text>
                    <Text color="#a7a7a7" fontSize="14px" minW="50px" textAlign="right">
                      {song.duration_seconds ? 
                        `${Math.floor(song.duration_seconds / 60)}:${(song.duration_seconds % 60).toString().padStart(2, '0')}` 
                        : '--:--'
                      }
                    </Text>
                  </Box>
                ))}
              </VStack>
            )}
            
            {searchQuery && !searchLoading && searchResults.length === 0 && (
              <Text color="#a7a7a7">No results found for &quot;{searchQuery}&quot;</Text>
            )}
          </VStack>
        )}
        
        <Box w="full" p={4} bg="#1e1e1e" borderRadius="md">
          <Text fontSize="lg" fontWeight="bold" color="white" mb={2}>
            Backend Status
          </Text>
          {healthLoading ? (
            <Text color="gray.400">Checking connection...</Text>
          ) : (
            <Text color={isHealthy ? "green.400" : "red.400"}>
              {isHealthy ? "✓ Connected to backend" : "✗ Backend unavailable"}
            </Text>
          )}
        </Box>


        
        <VStack align="start" gap={4} w="full">
          <Text fontSize="2xl" fontWeight="bold" color="white">
            Made for you
          </Text>
          <SimpleGrid columns={3} gap={6} w="full">
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
                    w="150px"
                    h="150px"
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
  );
}