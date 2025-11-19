'use client';

import { Button, HStack } from '@chakra-ui/react';
import Link from 'next/link';

export function AuthButtons() {
  return (
    <HStack gap={4}>
      <Link href="/auth/signup">
        <Button
          variant="ghost"
          color="#b3b3b3"
          fontSize="16px"
          fontWeight="700"
          h="48px"
          px={8}
          _hover={{ 
            color: 'white',
            transform: 'scale(1.04)'
          }}
          transition="all 0.1s ease"
        >
          Sign up
        </Button>
      </Link>
      <Link href="/auth/login">
        <Button
          bg="#1db954"
          color="black"
          fontSize="16px"
          fontWeight="700"
          h="48px"
          px={8}
          borderRadius="500px"
          _hover={{ 
            bg: '#1ed760',
            transform: 'scale(1.04)'
          }}
          _active={{
            transform: 'scale(0.96)'
          }}
          transition="all 0.1s ease"
        >
          Log in
        </Button>
      </Link>
    </HStack>
  );
}