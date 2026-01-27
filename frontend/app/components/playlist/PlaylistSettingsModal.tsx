import { Box, Flex, Text, VStack, Input, Textarea } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { PrimaryButton, SecondaryButton, DangerButton } from '../ui/Buttons';
import { APP_CONSTANTS } from '../../constants';

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
  onDelete: () => void;
}

export function PlaylistSettingsModal({ 
  isOpen, 
  playlist, 
  onClose, 
  onSave, 
  onAddSongs,
  onDelete
}: PlaylistSettingsModalProps) {
  const [editName, setEditName] = useState(playlist.name);
  const [editDescription, setEditDescription] = useState(playlist.description);
  const [editIsPublic, setEditIsPublic] = useState(playlist.is_public);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setEditName(playlist.name);
    setEditDescription(playlist.description);
    setEditIsPublic(playlist.is_public);
  }, [playlist]);

  const handleDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  if (!isOpen) return null;

  const handleSave = () => {
    if (!editName.trim()) {
      return; // Don't save if name is empty
    }
    onSave(editName.trim(), editDescription, editIsPublic);
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
        bg={APP_CONSTANTS.COLORS.CARD_BG}
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
          <PrimaryButton
            size="sm"
            onClick={onAddSongs}
          >
            + Add Songs
          </PrimaryButton>
        </Flex>
        
        <VStack gap={4} align="stretch">
          <Box>
            <Text color="white" mb={2} fontSize="sm">Name</Text>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              bg={APP_CONSTANTS.COLORS.INPUT_BG}
              border={!editName.trim() ? `1px solid ${APP_CONSTANTS.COLORS.ERROR}` : "none"}
              color={APP_CONSTANTS.COLORS.TEXT_PRIMARY}
              placeholder="Playlist name is required"
            />
            {!editName.trim() && (
              <Text color={APP_CONSTANTS.COLORS.ERROR} fontSize="xs" mt={1}>
                Playlist name cannot be empty
              </Text>
            )}
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
            <PrimaryButton
              size="sm"
              bg={editIsPublic ? APP_CONSTANTS.COLORS.PRIMARY : APP_CONSTANTS.COLORS.INPUT_BG}
              onClick={() => setEditIsPublic(!editIsPublic)}
              _hover={{ opacity: 0.8 }}
            >
              {editIsPublic ? 'Yes' : 'No'}
            </PrimaryButton>
          </Flex>
        </VStack>
        
        <Flex gap={3} mt={6} justify="space-between">
          <DangerButton
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Playlist
          </DangerButton>
          
          <Flex gap={3}>
            <SecondaryButton onClick={onClose}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              onClick={handleSave}
              disabled={!editName.trim()}
              opacity={!editName.trim() ? 0.5 : 1}
            >
              Save
            </PrimaryButton>
          </Flex>
        </Flex>
      </Box>
      
      {showDeleteConfirm && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0,0,0,0.9)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1001}
        >
          <Box
            bg={APP_CONSTANTS.COLORS.CARD_BG}
            borderRadius="8px"
            p={6}
            maxW="400px"
            w="90%"
          >
            <Text fontSize="xl" fontWeight="bold" color={APP_CONSTANTS.COLORS.TEXT_PRIMARY} mb={4}>
              Delete Playlist
            </Text>
            <Text color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} mb={6}>
              Are you sure you want to delete this playlist? This action cannot be undone.
            </Text>
            <Flex gap={3} justify="flex-end">
              <SecondaryButton onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </SecondaryButton>
              <DangerButton onClick={handleDelete}>
                Delete
              </DangerButton>
            </Flex>
          </Box>
        </Box>
      )}
    </Box>
  );
}