'use client';

import { Box } from '@chakra-ui/react';
import { SongInfo } from './SongInfo';
import { PlayerControls } from './PlayerControls';
import { VolumeControl } from './VolumeControl';

export function Player() {
  return (
    <Box
      h="90px"
      bg="#191414"
      borderTop="1px solid"
      borderColor="#535353"
      px={4}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <SongInfo />
      <PlayerControls />
      <VolumeControl />
    </Box>
  );
}