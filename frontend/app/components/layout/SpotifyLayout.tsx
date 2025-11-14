'use client';

import { Box, Flex } from '@chakra-ui/react';
import { Sidebar } from '../navigation/Sidebar';
import { MainContent } from './MainContent';
import { Player } from '../player/Player';

export function SpotifyLayout() {
  return (
    <Box h="100vh" bg="#191414">
      <Flex h="calc(100vh - 90px)">
        <Sidebar />
        <MainContent />
      </Flex>
      <Player />
    </Box>
  );
}