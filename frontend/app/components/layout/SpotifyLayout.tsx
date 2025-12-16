'use client';

import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { Sidebar } from '../navigation/Sidebar';
import { MainContent } from './MainContent';
import { Player } from '../player/Player';
import { AuthButtons } from '../auth/AuthButtons';
import { UserProfile } from '../user/UserProfile';
import { authStorage } from '../../lib/auth';

export function SpotifyLayout() {
  const [isAuthenticated] = useState(() => authStorage.isAuthenticated());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Box h="100vh" bg="#191414">
          {/* Mobile Header */}
          <Box
            display={{ base: "flex", md: "none" }}
            position="fixed"
            top={0}
            left={0}
            right={0}
            h="56px"
            bg="#000000"
            alignItems="center"
            justifyContent="space-between"
            px={4}
            zIndex={15}
          >
            <IconButton
              aria-label="Toggle menu"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              variant="ghost"
              color="white"
              size="sm"
              minW="auto"
              _hover={{ bg: "transparent", transform: "scale(1.1)" }}
              _active={{ bg: "transparent" }}
            >
              {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </IconButton>
            <Box position="absolute" left="50%" transform="translateX(-50%)">
              <Text fontSize="lg" fontWeight="bold" color="white">Spotify</Text>
            </Box>
          </Box>

          {/* Auth/Profile Buttons */}
          <Box position="absolute" top={{ base: "8px", md: 4 }} right={4} zIndex={16}>
            {isAuthenticated ? <UserProfile /> : <AuthButtons />}
          </Box>

          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <Box
              display={{ base: "block", md: "none" }}
              position="fixed"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="blackAlpha.700"
              zIndex={19}
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <Flex h="100vh" pt={{ base: "56px", md: 0 }} pb="90px">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <MainContent />
          </Flex>
          <Player />
        </Box>
  );
}