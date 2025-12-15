'use client';

import { Box, Text, Button } from '@chakra-ui/react';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward } from 'react-icons/fi';
import { ProgressBar } from '../ui/ProgressBar';
import { usePlayer } from '../../contexts/PlayerContext';

export function PlayerControls() {
  const { currentSong, isPlaying, togglePlay, currentTime, duration, seekTo, playNext, playPrevious, hasNext, hasPrevious } = usePlayer();

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    seekTo(percent * duration)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <Box flex="2" maxW="722px" w="full">
      <Box display="flex" justifyContent="center" alignItems="center" gap={{ base: 2, md: 4 }} mb={{ base: 1, md: 2 }}>
        <Button 
          variant="ghost" 
          color={hasPrevious ? 'white' : '#535353'} 
          _hover={{ color: hasPrevious ? 'white' : '#535353' }} 
          onClick={playPrevious}
          cursor={hasPrevious ? 'pointer' : 'not-allowed'}
          size={{ base: "sm", md: "md" }}
        >
          <FiSkipBack />
        </Button>
        <Button
          variant="ghost"
          color="black"
          bg="white"
          _hover={{ bg: 'gray.200' }}
          borderRadius="full"
          size={{ base: "md", md: "lg" }}
          onClick={togglePlay}
          disabled={!currentSong}
        >
          {isPlaying ? <FiPause /> : <FiPlay />}
        </Button>
        <Button 
          variant="ghost" 
          color={hasNext ? 'white' : '#535353'} 
          _hover={{ color: hasNext ? 'white' : '#535353' }} 
          onClick={playNext}
          cursor={hasNext ? 'pointer' : 'not-allowed'}
          size={{ base: "sm", md: "md" }}
        >
          <FiSkipForward />
        </Button>
      </Box>
      <Box display={{ base: "none", md: "flex" }} alignItems="center" gap={2}>
        <Text color="#B3B3B3" fontSize="xs">{formatTime(currentTime)}</Text>
        <Box
          flex={1}
          h="4px"
          bg="#535353"
          borderRadius="2px"
          cursor="pointer"
          onClick={handleProgressClick}
        >
          <Box
            h="100%"
            bg="white"
            borderRadius="2px"
            width={`${progress}%`}
            transition="width 0.1s"
          />
        </Box>
        <Text color="#B3B3B3" fontSize="xs">{formatTime(duration)}</Text>
      </Box>
    </Box>
  );
}