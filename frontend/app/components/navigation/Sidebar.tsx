'use client';

import { Box, VStack, Text } from '@chakra-ui/react';
import { NavItem } from './NavItem';
import { useSearch } from '../../contexts/SearchContext';
import { FiHome, FiSearch, FiMusic, FiPlus, FiHeart } from 'react-icons/fi';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { toggleSearch } = useSearch();

  const handleNavClick = (callback?: () => void) => {
    callback?.();
    onClose?.();
  };

  return (
    <Box
      w={{ base: "full", md: "240px" }}
      h="100%"
      bg="#191414"
      p={6}
      borderRight={{ base: "none", md: "1px solid" }}
      borderColor={{ base: "transparent", md: "#535353" }}
      position={{ base: "fixed", md: "relative" }}
      top={0}
      left={0}
      zIndex={20}
      transform={{ base: isOpen ? "translateX(0)" : "translateX(-100%)", md: "translateX(0)" }}
      transition="transform 0.3s ease"
      overflowY="auto"
    >
      <VStack align="start" gap={6}>
        <Text fontSize="2xl" fontWeight="bold" color="white">
          Spotify
        </Text>
        
        <VStack align="start" gap={4} w="full">
          <NavItem icon={FiHome} label="Home" href="/" />
          <NavItem icon={FiSearch} label="Search" onClick={() => handleNavClick(toggleSearch)} />
          <NavItem icon={FiMusic} label="Your Library" href="/library" />
        </VStack>

        <VStack align="start" gap={4} w="full" mt={8}>
          <NavItem icon={FiPlus} label="Create Playlist" href="/playlist/create" />
          <NavItem icon={FiHeart} label="Liked Songs" href="/liked" />
        </VStack>
      </VStack>
    </Box>
  );
}