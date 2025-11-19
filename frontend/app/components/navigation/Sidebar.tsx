'use client';

import { Box, VStack, Text } from '@chakra-ui/react';
import { NavItem } from './NavItem';
import { useSearch } from '../../contexts/SearchContext';
import { FiHome, FiSearch, FiMusic, FiPlus, FiHeart } from 'react-icons/fi';

export function Sidebar() {
  const { toggleSearch } = useSearch();

  return (
    <Box
      w="240px"
      h="100vh"
      bg="#191414"
      p={6}
      borderRight="1px solid"
      borderColor="#535353"
    >
      <VStack align="start" spacing={6}>
        <Text fontSize="2xl" fontWeight="bold" color="white">
          Spotify
        </Text>
        
        <VStack align="start" spacing={4} w="full">
          <NavItem icon={FiHome} label="Home" href="/" />
          <NavItem icon={FiSearch} label="Search" onClick={toggleSearch} />
          <NavItem icon={FiMusic} label="Your Library" />
        </VStack>

        <VStack align="start" spacing={4} w="full" mt={8}>
          <NavItem icon={FiPlus} label="Create Playlist" />
          <NavItem icon={FiHeart} label="Liked Songs" />
        </VStack>
      </VStack>
    </Box>
  );
}