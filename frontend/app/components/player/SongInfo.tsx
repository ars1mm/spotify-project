'use client';

import { Box, Text, Button } from '@chakra-ui/react';
import { FiHeart } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import { authStorage } from '../../lib/auth';
import { apiRequest } from '../../config/api';
import toast from 'react-hot-toast';

export function SongInfo() {
  const { currentSong } = usePlayer();
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentSong?.id) {
      checkIfLiked();
    }
  }, [currentSong?.id]);

  const checkIfLiked = async () => {
    const session = authStorage.getSession();
    if (!session?.user?.id || !currentSong?.id) return;

    try {
      const response = await apiRequest(`/api/v1/songs/${currentSong.id}/liked?user_id=${session.user.id}`);
      setIsLiked(response.is_liked);
    } catch (error) {
      console.error('Failed to check if song is liked:', error);
    }
  };

  const toggleLike = async () => {
    const session = authStorage.getSession();
    if (!session?.user?.id) {
      toast.error('Please log in to like songs');
      return;
    }
    if (!currentSong?.id) return;

    setLoading(true);
    try {
      if (isLiked) {
        await apiRequest(`/api/v1/songs/${currentSong.id}/like?user_id=${session.user.id}`, {
          method: 'DELETE',
        });
        setIsLiked(false);
        toast.success('Removed from liked songs');
      } else {
        await apiRequest(`/api/v1/songs/${currentSong.id}/like?user_id=${session.user.id}`, {
          method: 'POST',
        });
        setIsLiked(true);
        toast.success('Added to liked songs');
      }
    } catch (error) {
      toast.error('Failed to update liked status');
    } finally {
      setLoading(false);
    }
  };

  if (!currentSong) {
    return (
      <Box display="flex" alignItems="center" gap={4} flex="1">
        <Box w="56px" h="56px" bg="gray.500" borderRadius="md" />
        <Box>
          <Text color="#B3B3B3" fontWeight="medium">No song playing</Text>
          <Text color="#B3B3B3" fontSize="sm">Select a song to play</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box display="flex" alignItems="center" gap={{ base: 2, md: 4 }} flex="1" minW="0">
      <Box w={{ base: "40px", md: "56px" }} h={{ base: "40px", md: "56px" }} bg="gray.500" borderRadius="md" overflow="hidden" flexShrink={0}>
        {currentSong.cover_image_url ? (
          <img 
            src={currentSong.cover_image_url} 
            alt={currentSong.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Box w="full" h="full" bg="gray.500" display="flex" alignItems="center" justifyContent="center">
            <Text color="white" fontSize="lg">♪</Text>
          </Box>
        )}
      </Box>
      <Box flex="1" minW="0" maxW={{ base: "120px", md: "200px" }}>
        <Text 
          color="white" 
          fontWeight="medium"
          fontSize={{ base: "sm", md: "md" }}
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {currentSong.title}
        </Text>
        <Text 
          color="#B3B3B3" 
          fontSize={{ base: "xs", md: "sm" }}
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {currentSong.artist}
        </Text>
      </Box>
      <Button 
        variant="ghost" 
        color={isLiked ? '#1DB954' : '#B3B3B3'} 
        _hover={{ color: isLiked ? '#1ed760' : 'white' }} 
        flexShrink={0}
        onClick={toggleLike}
        disabled={loading}
        size={{ base: "sm", md: "md" }}
      >
        <FiHeart fill={isLiked ? 'currentColor' : 'none'} />
      </Button>
    </Box>
  );
}