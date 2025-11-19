'use client';

import { Box, Text, Button, HStack } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage, User } from '../../lib/auth';

export function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const session = authStorage.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  }, []);

  const handleLogout = () => {
    authStorage.clearSession();
    router.push('/');
    window.location.reload();
  };

  if (!user) return null;

  return (
    <HStack gap={3}>
      <Box
        bg="#282828"
        px={4}
        py={2}
        borderRadius="23px"
        _hover={{ bg: '#3e3e3e' }}
        cursor="pointer"
      >
        <HStack gap={2}>
          <Box
            w="28px"
            h="28px"
            bg="#535353"
            borderRadius="50%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="white" fontSize="14px" fontWeight="600">
              {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </Text>
          </Box>
          <Text color="white" fontSize="14px" fontWeight="600">
            {user.name || user.email}
          </Text>
        </HStack>
      </Box>
      <Button
        onClick={handleLogout}
        variant="ghost"
        color="#b3b3b3"
        fontSize="14px"
        fontWeight="600"
        h="auto"
        p={2}
        _hover={{ color: 'white' }}
      >
        Log out
      </Button>
    </HStack>
  );
}