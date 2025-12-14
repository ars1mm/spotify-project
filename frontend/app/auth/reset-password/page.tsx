'use client'

import { Box, VStack, Text, Input, Button } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [accessToken] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Extract tokens from URL hash and redirect to token route
    const hash = window.location.hash
    const params = new URLSearchParams(hash.substring(1))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (accessToken && refreshToken) {
      // Encode both tokens in the URL
      router.push(
        `/auth/reset-password/${accessToken}?refresh=${encodeURIComponent(
          refreshToken
        )}`
      )
    } else if (accessToken) {
      router.push(`/auth/reset-password/${accessToken}`)
    } else {
      setError('Invalid reset link')
    }
  }, [router])

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/v1/auth/update-password',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: accessToken,
            new_password: password,
          }),
        }
      )

      const result = await response.json()

      if (result.success) {
        alert('Password updated successfully!')
        router.push('/auth/login')
      } else {
        setError(result.error || 'Failed to update password')
      }
    } catch {
      setError('Failed to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      bg="#121212"
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box bg="black" p={12} borderRadius="8px" w="448px" maxW="90vw">
        <VStack gap={6} align="stretch">
          <Text
            fontSize="48px"
            fontWeight="700"
            color="white"
            textAlign="center"
            mb={4}
          >
            Reset your password
          </Text>

          <VStack gap={4} align="stretch">
            <Box>
              <Text color="white" fontWeight="700" mb={2}>
                New password
              </Text>
              <Input
                type="password"
                placeholder="Enter new password"
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
              <Text color="white" fontWeight="700" mb={2}>
                Confirm new password
              </Text>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            onClick={handleResetPassword}
            loading={loading}
            disabled={!accessToken}
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
            Update Password
          </Button>
        </VStack>
      </Box>
    </Box>
  )
}
