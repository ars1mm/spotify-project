import { VStack } from '@chakra-ui/react';
import { FiPlus, FiHeart } from 'react-icons/fi';
import { NavItem } from './NavItem';

export function QuickActions() {
  return (
    <VStack align="start" gap={4} w="full" mt={8}>
      <NavItem icon={FiPlus} label="Create Playlist" href="/playlist/create" />
      <NavItem icon={FiHeart} label="Liked Songs" href="/library?tab=liked" />
    </VStack>
  );
}