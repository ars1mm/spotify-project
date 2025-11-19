'use client';

import { Box, VStack, Text, Input, Button, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../../config/api';
import { authStorage } from '../../lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      if (response.success) {
        // Store session data
        authStorage.setSession({
          access_token: response.session.access_token,
          refresh_token: response.session.refresh_token,
          user: {
            id: response.user.id,
            email: response.user.email,
            name: response.user.user_metadata?.name
          }
        });
        
        // Redirect to home page
        router.push('/');
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Login failed:', err);
      }
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setResetLoading(true);
    setError('');
    setResetMessage('');

    try {
      const response = await apiRequest('/api/v1/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      
      if (response.success) {
        setResetMessage('Password reset email sent! Check your inbox.');
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Password reset failed:', err);
      }
      setError('Failed to send reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Box bg="#121212" minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Box bg="black" p={12} borderRadius="8px" w="448px" maxW="90vw">
        <VStack gap={6} align="stretch">
          <Text fontSize="48px" fontWeight="700" color="white" textAlign="center" mb={4}>
            Log in to Spotify
          </Text>
          
          <VStack gap={4} align="stretch">
            <Box>
              <Text color="white" fontWeight="700" mb={2}>Email or username</Text>
              <Input
                placeholder="Email or username"
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
              <Text color="white" fontWeight="700" mb={2}>Password</Text>
              <Input
                type="password"
                placeholder="Password"
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
          </VStack>
          
          {error && (
            <Box bg="red.900" color="white" p={3} borderRadius="md">
              {error}
            </Box>
          )}
          
          <Button
            onClick={handleLogin}
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
            Log In
          </Button>
          
          {resetMessage && (
            <Box bg="green.900" color="white" p={3} borderRadius="md">
              {resetMessage}
            </Box>
          )}
          
          <Button
            onClick={handleResetPassword}
            loading={resetLoading}
            variant="ghost"
            color="white"
            textDecoration="underline"
            fontSize="14px"
            h="auto"
            p={0}
          >
            Forgot your password?
          </Button>
          
          <Box h="1px" bg="#292929" w="full" />
          
          <Text color="#a7a7a7" textAlign="center">
            Don&apos;t have an account?{' '}
            <Link as={NextLink} href="/auth/signup" color="white" textDecoration="underline">
              Sign up for Spotify
            </Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}