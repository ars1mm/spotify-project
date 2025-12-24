'use client';

import { Box } from '@chakra-ui/react';
import { SongInfo } from './SongInfo';
import { PlayerControls } from './PlayerControls';
import { VolumeControl } from './VolumeControl';
import { usePlayer } from '../../contexts/PlayerContext';

export function Player() {
  const { currentTime, duration, seekTo, currentSong } = usePlayer();

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!duration) return;
    
    // Support both mouse and touch events
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    seekTo(percent * duration);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      h="90px"
      bg="#191414"
      borderTop="1px solid"
      borderColor="#535353"
      px={{ base: 2, md: 4 }}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={{ base: 2, md: 4 }}
      zIndex={10}
    >
      {/* Mobile-only progress bar at the very top edge */}
      {currentSong && (
        <Box
          position="absolute"
          top="-2px" // Slightly above the border
          left={0}
          right={0}
          h="3px"
          bg="#333"
          cursor="pointer"
          onClick={handleProgressClick}
          onTouchStart={handleProgressClick}
          display={{ base: "block", md: "none" }}
          _after={{
            content: '""',
            position: 'absolute',
            top: '-12px',
            bottom: '-12px',
            left: 0,
            right: 0,
          }}
        >
          <Box
            h="100%"
            bg="#1DB954"
            width={`${progress}%`}
            transition="width 0.1s linear"
          />
        </Box>
      )}

      <Box flex={{ base: "1", md: "0.3" }} minW={0}>
        <SongInfo />
      </Box>
      <Box flex={{ base: "0", md: "0.4" }}>
        <PlayerControls />
      </Box>
      <Box display={{ base: "none", md: "block" }} flex="0.3">
        <VolumeControl />
      </Box>
    </Box>
  );
}