'use client';

import { Box, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { Sidebar } from '../navigation/Sidebar';
import { MainContent } from './MainContent';
import { Player } from '../player/Player';
import { AuthButtons } from '../auth/AuthButtons';
import { UserProfile } from '../user/UserProfile';
import { SearchProvider } from '../../contexts/SearchContext';
import { authStorage } from '../../lib/auth';

export function SpotifyLayout() {
  const [isAuthenticated] = useState(() => authStorage.isAuthenticated());

  return (
    <SearchProvider>
      <Box h="100vh" bg="#191414">
        <Box position="absolute" top={4} right={4} zIndex={10}>
          {isAuthenticated ? <UserProfile /> : <AuthButtons />}
        </Box>
        <Flex h="calc(100vh - 90px)">
          <Sidebar />
          <MainContent />
        </Flex>
        <Player />
      </Box>
    </SearchProvider>
  );
}