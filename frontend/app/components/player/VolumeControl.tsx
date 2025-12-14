'use client';

import { Box, Button } from '@chakra-ui/react';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';
import { usePlayer } from '../../contexts/PlayerContext';

export function VolumeControl() {
  const { volume, setVolume } = usePlayer();

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    setVolume(Math.max(0, Math.min(1, percent)))
  }

  const toggleMute = () => {
    setVolume(volume > 0 ? 0 : 0.7)
  }

  return (
    <Box display="flex" alignItems="center" gap={2} flex="1" justifyContent="flex-end">
      <Button variant="ghost" color="#B3B3B3" _hover={{ color: 'white' }} onClick={toggleMute}>
        {volume > 0 ? <FiVolume2 /> : <FiVolumeX />}
      </Button>
      <Box
        w="100px"
        h="4px"
        bg="#535353"
        borderRadius="2px"
        cursor="pointer"
        onClick={handleVolumeClick}
      >
        <Box
          h="100%"
          bg="white"
          borderRadius="2px"
          width={`${volume * 100}%`}
          transition="width 0.1s"
        />
      </Box>
    </Box>
  );
}