import { VStack, Text } from '@chakra-ui/react';
import { FiList } from 'react-icons/fi';
import { NavItem } from './NavItem';

interface Playlist {
  id: string;
  name: string;
  is_public: boolean;
}

interface PlaylistsListProps {
  playlists: Playlist[];
}

export function PlaylistsList({ playlists }: PlaylistsListProps) {
  if (playlists.length === 0) return null;

  return (
    <VStack align="start" gap={2} w="full" mt={4}>
      <Text fontSize="xs" fontWeight="bold" color="#a7a7a7" textTransform="uppercase" mb={2}>
        Playlists
      </Text>
      {playlists.map((playlist) => (
        <NavItem 
          key={playlist.id}
          icon={FiList} 
          label={playlist.name} 
          href={`/playlist/${playlist.id}`}
        />
      ))}
    </VStack>
  );
}