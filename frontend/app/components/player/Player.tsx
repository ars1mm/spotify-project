'use client';

import { Box } from '@chakra-ui/react';
import { SongInfo } from './SongInfo';
import { PlayerControls } from './PlayerControls';
import { VolumeControl } from './VolumeControl';

export function Player() {
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