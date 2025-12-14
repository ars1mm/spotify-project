'use client';

import { Box, VStack, Text, Input, Button, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useState } from 'react';
import { apiRequest } from '../../config/api';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiRequest('/api/v1/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name })
      });
      
      if (response.success) {
        alert('Account created successfully! Please check your email to verify.');
      }
    } catch {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="#121212" minH="100vh" display="flex" alignItems="center" justifyContent="center" py={8}>
      <Box bg="black" p={12} borderRadius="8px" w="448px" maxW="90vw">
        <VStack gap={6} align="stretch">
          <Text fontSize="48px" fontWeight="700" color="white" textAlign="center" mb={4}>
            Sign up for free to start listening.
          </Text>
          
          <VStack gap={4} align="stretch">
            <Box>
              <Text color="white" fontWeight="700" mb={2}>Email address</Text>
              <Input
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                bg="#121212"
                border="1px solid #727272"
                color="white"
                h="48px"
                _placeholder={{ color: '#a7a7a7' }}
                _hover={{ borderColor: 'white' }}
                _focus={{ borderColor: 'white', boxShadow: 'none' }}
              />
            </Box>
            
            <Box>
              <Text color="white" fontWeight="700" mb={2}>Create a password</Text>
              <Input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg="#121212"
                border="1px solid #727272"
                color="white"
                h="48px"
                _placeholder={{ color: '#a7a7a7' }}
                _hover={{ borderColor: 'white' }}
                _focus={{ borderColor: 'white', boxShadow: 'none' }}
              />
            </Box>
            
            <Box>
              <Text color="white" fontWeight="700" mb={2}>What should we call you?</Text>
              <Input
                placeholder="Enter a profile name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                bg="#121212"
                border="1px solid #727272"
                color="white"
                h="48px"
                _placeholder={{ color: '#a7a7a7' }}
                _hover={{ borderColor: 'white' }}
                _focus={{ borderColor: 'white', boxShadow: 'none' }}
              />
              <Text color="#a7a7a7" fontSize="11px" mt={1}>
                This appears on your profile.
              </Text>
            </Box>
          </VStack>
          
          <Box display="flex" alignItems="flex-start" gap={3}>
            <Box w="16px" h="16px" border="2px solid #727272" borderRadius="2px" mt={1} />
            <Text fontSize="14px" color="white">
              I would prefer not to receive marketing messages from Spotify
            </Text>
          </Box>
          
          <Box display="flex" alignItems="flex-start" gap={3}>
            <Box w="16px" h="16px" border="2px solid #727272" borderRadius="2px" mt={1} />
            <Text fontSize="14px" color="white">
              Share my registration data with Spotify&apos;s content providers for marketing purposes.
            </Text>
          </Box>
          
          <Text fontSize="11px" color="#a7a7a7">
            By clicking on sign-up, you agree to Spotify&apos;s{' '}
            <Link color="#1db954" textDecoration="underline">Terms and Conditions of Use</Link>.
          </Text>
          
          <Text fontSize="11px" color="#a7a7a7">
            To learn more about how Spotify collects, uses, shares and protects your personal data, please see{' '}
            <Link color="#1db954" textDecoration="underline">Spotify&apos;s Privacy Policy</Link>.
          </Text>
          
          {error && (
            <Box bg="red.900" color="white" p={3} borderRadius="md">
              {error}
            </Box>
          )}
          
          <Button
            onClick={handleSignUp}
            loading={loading}
            bg="#1db954"
            color="black"
            h="48px"
            fontSize="16px"
            fontWeight="700"
            borderRadius="500px"
            _hover={{ bg: '#1ed760', transform: 'scale(1.04)' }}
            _active={{ transform: 'scale(0.96)' }}
            transition="all 0.1s ease"
            mt={4}
          >
            Sign Up
          </Button>
          
          <Box h="1px" bg="#292929" w="full" />
          
          <Text color="#a7a7a7" textAlign="center">
            Have an account?{' '}
            <Link as={NextLink} href="/auth/login" color="white" textDecoration="underline">
              Log in
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}