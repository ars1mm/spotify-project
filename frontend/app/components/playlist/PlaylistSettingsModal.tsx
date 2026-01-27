import { Box, Flex, Text, Button, VStack, Input, Textarea } from '@chakra-ui/react';
import { useState } from 'react';

interface PlaylistSettingsModalProps {
  isOpen: boolean;
  playlist: {
    name: string;
    description: string;
    is_public: boolean;
  };
  onClose: () => void;
  onSave: (name: string, description: string, isPublic: boolean) => void;
  onAddSongs: () => void;
}

export function PlaylistSettingsModal({ 
  isOpen, 
  playlist, 
  onClose, 
  onSave, 
  onAddSongs 
}: PlaylistSettingsModalProps) {
  const [editName, setEditName] = useState(playlist.name);
  const [editDescription, setEditDescription] = useState(playlist.description);
  const [editIsPublic, setEditIsPublic] = useState(playlist.is_public);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(editName, editDescription, editIsPublic);
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0,0,0,0.8)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
      onClick={onClose}
    >
      <Box
        bg="#282828"
        borderRadius="8px"
        p={6}
        maxW="500px"
        w="90%"
        onClick={(e) => e.stopPropagation()}
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="2xl" fontWeight="bold" color="white">
            Playlist Settings
          </Text>
          <Button
            size="sm"
            bg="#1db954"
            color="white"
            _hover={{ bg: '#1ed760' }}
            onClick={onAddSongs}
          >
            + Add Songs
          </Button>
        </Flex>
        
        <VStack gap={4} align="stretch">
          <Box>
            <Text color="white" mb={2} fontSize="sm">Name</Text>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              bg="#3e3e3e"
              border="none"
              color="white"
            />
          </Box>
          
          <Box>
            <Text color="white" mb={2} fontSize="sm">Description</Text>
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              bg="#3e3e3e"
              border="none"
              color="white"
            />
          </Box>
          
          <Flex align="center" justify="space-between">
            <Text color="white" fontSize="sm">Public</Text>
            <Button
              size="sm"
              bg={editIsPublic ? '#1db954' : '#3e3e3e'}
              onClick={() => setEditIsPublic(!editIsPublic)}
              _hover={{ opacity: 0.8 }}
              color="white"
            >
              {editIsPublic ? 'Yes' : 'No'}
            </Button>
          </Flex>
        </VStack>
        
        <Flex gap={3} mt={6} justify="flex-end">
          <Button
            onClick={onClose}
            bg="transparent"
            color="white"
            _hover={{ bg: '#3e3e3e' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            bg="#1db954"
            color="white"
            _hover={{ bg: '#1ed760' }}
          >
            Save
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}