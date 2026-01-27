'use client';

import { Box, VStack } from '@chakra-ui/react';
import { useSearch } from '../../contexts/SearchContext';
import { usePlaylists } from '../../hooks/usePlaylists';
import { SidebarHeader } from './SidebarHeader';
import { MainNavigation } from './MainNavigation';
import { QuickActions } from './QuickActions';
import { PlaylistsList } from './PlaylistsList';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { toggleSearch } = useSearch();
  const { playlists } = usePlaylists();

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
        <SidebarHeader />
        <MainNavigation onNavClick={handleNavClick} onSearchToggle={toggleSearch} />
        <QuickActions />
        <PlaylistsList playlists={playlists} />
      </VStack>
    </Box>
  );
}