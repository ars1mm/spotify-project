/**
 * ************************************
 * EN: ADMIN LOGIN COMPONENT
 *    Handles admin authentication with SHA-256 key
 * AL: KOMPONENTI I HYRJES ADMIN
 *    Menaxhon autentikimin admin me çelësin SHA-256
 * ************************************
 * 
 * HOW TO ADD A NEW LOGIN METHOD:
 * 1. Add new authentication method (e.g., OAuth, email/password)
 * 2. Create a new function to handle the authentication
 * 3. Update the handleLogin function to support the new method
 * 4. Add appropriate error handling
 * 
 * SI TË SHTONI NJË METODË TË RE HYRJES:
 * 1. Shtoni metodën e re të autentikimit (p.sh. OAuth, email/fjalëkalim)
 * 2. Krijoni një funksion të ri për të menaxhuar autentikimin
 * 3. Përditësoni funksionin handleLogin për të mbështetur metodën e re
 * 4. Shtoni trajtimin e duhur të gabimeve
 */

'use client'

import { useState } from 'react'
import { Box, VStack, HStack, Text, Input, Button } from '@chakra-ui/react'
import { FiLock } from 'react-icons/fi'
// import { KeyExpiryInfo } from '@/types/admin'

interface AdminLoginProps {
  onLogin: (key: string) => void
  error: string
  isLoading: boolean
}

export default function AdminLogin({ onLogin, error, isLoading }: AdminLoginProps) {
  const [loginKey, setLoginKey] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(loginKey)
  }

  return (
    <Box
      bg="gray.900"
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        bg="white"
        p={8}
        borderRadius="12px"
        boxShadow="xl"
        w="400px"
        maxW="90%"
      >
        <form onSubmit={handleSubmit}>
          <VStack gap={6} align="stretch">
            <HStack justify="center" gap={3}>
              <FiLock size={32} color="#1DB954" />
              <Text fontSize="24px" fontWeight="700" color="black">
                Admin Access
              </Text>
            </HStack>

            <Text color="gray.600" textAlign="center" fontSize="sm">
              Enter the SHA-256 admin key from the backend console to access
              the admin dashboard.
            </Text>

            {error && (
              <Box
                p={3}
                borderRadius="4px"
                bg="red.50"
                border="1px solid"
                borderColor="red.200"
              >
                <Text color="red.600" fontSize="sm">
                  {error}
                </Text>
              </Box>
            )}

            <Box>
              <Text fontWeight="500" mb={2} color="black" fontSize="sm">
                Admin Key
              </Text>
              <Input
                type="password"
                placeholder="Enter 64-character SHA-256 key"
                value={loginKey}
                onChange={(e) => setLoginKey(e.target.value)}
                border="1px solid #ccc"
                color="black"
                _placeholder={{ color: '#999' }}
                _focus={{
                  borderColor: '#1DB954',
                  boxShadow: '0 0 0 1px #1DB954',
                }}
                fontFamily="monospace"
                fontSize="sm"
                required
              />
            </Box>

            <Button
              type="submit"
              disabled={isLoading || !loginKey.trim()}
              bg="#1DB954"
              color="white"
              size="lg"
              _hover={{ bg: '#1ed760' }}
              _disabled={{ bg: 'gray.300', cursor: 'not-allowed' }}
            >
              {isLoading ? 'Authenticating...' : 'Login to Admin'}
            </Button>

            <Text color="gray.500" fontSize="xs" textAlign="center">
              The admin key is displayed in the backend terminal when the
              server starts. Look for &quot;🔐 ADMIN KEY ROTATED&quot;
            </Text>
          </VStack>
        </form>
      </Box>
    </Box>
  )
}
