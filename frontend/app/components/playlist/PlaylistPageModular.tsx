'use client';

import { Box, VStack, Text, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Sidebar } from '../../components/navigation/Sidebar';
import { Player } from '../../components/player/Player';
import { AuthButtons } from '../../components/auth/AuthButtons';
import { UserProfile } from '../../components/user/UserProfile';
import { PlaylistHeader } from '../../components/playlist/PlaylistHeader';
import { PlaylistControls } from '../../components/playlist/PlaylistControls';
import { SongList } from '../../components/playlist/SongList';
import { PlaylistSettingsModal } from '../../components/playlist/PlaylistSettingsModal';
import { AddSongsModal } from '../../components/playlist/AddSongsModal';
import { usePlayer } from '../../contexts/PlayerContext';
import { usePlaylistPage } from '../../hooks/usePlaylistPage';
import { authStorage } from '../../lib/auth';

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration_seconds?: number;
  cover_image_url?: string;
  audio_url?: string;
}

export default function PlaylistPage() {
  const { playSong } = usePlayer();
  const [isAuthenticated] = useState(() => authStorage.isAuthenticated());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showAddSongs, setShowAddSongs] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);

  const {
    playlist,
    songs,
    loading,
    allSongs,
    currentUserId,
    loadAllSongs,
    updatePlaylist,
    addSong,
    removeSong
  } = usePlaylistPage();

  const handleSongClick = (song: Song) => {
    if (!isAuthenticated) {
      toast.error('Please log in to play songs');
      return;
    }
    playSong(song);
  };

  const handlePlay = (playlistSongs: Song[]) => {
    if (playlistSongs.length > 0) {
      handleSongClick(playlistSongs[0]);
    }
  };

  const openSettings = async () => {
    if (playlist) {
      setIsSettingsOpen(true);
      await loadAllSongs();
    }
  };

  const handleUpdatePlaylist = async (name: string, description: string, isPublic: boolean) => {
    await updatePlaylist(name, description, isPublic);
    setIsSettingsOpen(false);
  };

  const handleAddSongs = () => {
    setIsSettingsOpen(false);
    setShowAddSongs(true);
  };

  const handleAddSong = async (songId: string) => {
    await addSong(songId);
  };

  const handleRemoveSong = async (songId: string) => {
    await removeSong(songId);
  };

  return (
    <Box h="100vh" bg="#191414">
      <Box position="absolute" top={{ base: "8px", md: 4 }} right={4} zIndex={16}>
        {isAuthenticated ? <UserProfile /> : <AuthButtons />}
      </Box>

      <Flex h="100vh" pt={{ base: "56px", md: 0 }} pb="90px">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <Box flex="1" bg="#121212" p={{ base: 4, md: 8 }} overflowY="auto">
          {loading ? (
            <Text color="white">Loading...</Text>
          ) : playlist ? (
            <VStack align="start" gap={6} w="full">
              <PlaylistHeader
                playlist={playlist}
                songs={songs}
                currentUserId={currentUserId}
                onSettingsClick={openSettings}
              />

              <PlaylistControls
                songs={songs}
                isShuffled={isShuffled}
                onPlay={handlePlay}
                onShuffleToggle={() => setIsShuffled(!isShuffled)}
              />

              <SongList
                songs={songs}
                currentUserId={currentUserId}
                playlistUserId={playlist.user_id}
                onSongClick={handleSongClick}
                onRemoveSong={handleRemoveSong}
              />
            </VStack>
          ) : (
            <Text color="white">Playlist not found</Text>
          )}
        </Box>
      </Flex>

      <Player />

      <PlaylistSettingsModal
        isOpen={isSettingsOpen}
        playlist={playlist || { name: '', description: '', is_public: true }}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleUpdatePlaylist}
        onAddSongs={handleAddSongs}
      />

      <AddSongsModal
        isOpen={showAddSongs}
        allSongs={allSongs}
        playlistSongs={songs}
        onClose={() => setShowAddSongs(false)}
        onAddSong={handleAddSong}
      />
    </Box>
  );
}