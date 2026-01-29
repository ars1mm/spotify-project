/**
 * ************************************
 * EN: ADMIN DASHBOARD - MAIN COMPONENT
 *    Combines all admin components into a unified dashboard
 * AL: PANELI ADMIN - KOMPONENTI KRYESOR
 *    Kombinon të gjitha komponentet admin në një panel të bashkuar
 * ************************************
 * 
 * COMPONENTS STRUCTURE:
 * ├── AdminLogin        (Authentication)
 * ├── SongUploader      (Upload songs)
 * ├── SongManager       (Manage/delete songs)
 * ├── ServerLogs        (Activity logs)
 * └── AdminDashboard    (Main container)
 * 
 * HOW TO ADD A NEW FEATURE:
 * 1. Create a new component in components/admin/
 * 2. Add it to this dashboard
 * 3. Pass necessary props (token, callbacks)
 * 4. Update state management as needed
 * 
 * SI TË SHTONI NJË FUNKSION TË RI:
 * 1. Krijoni një komponent të ri në components/admin/
 * 2. Shtojeni në këtë panel
 * 3. Kaloni props-et e nevojshme (token, callbacks)
 * 4. Përditësoni menaxhimin e gjendjes nëse nevojitet
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Box, VStack, HStack, Text, Button } from '@chakra-ui/react'
import { FiLock, FiRefreshCw } from 'react-icons/fi'
import AdminLogin from './AdminLogin'
import SongUploader from './SongUploader'
import SongManager from './SongManager'
import ServerLogs from './ServerLogs'
import { KeyExpiryInfo } from '@/types/admin'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && process.env.NODE_ENV === 'production'
    ? 'https://spotify-project-achx.onrender.com'
    : 'http://127.0.0.1:8000')

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminToken, setAdminToken] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [keyExpiry, setKeyExpiry] = useState<KeyExpiryInfo | null>(null)
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload')
  const [logs, setLogs] = useState<string[]>([])
  const [message, setMessage] = useState({ type: '', text: '' })

  // Check for saved token on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem('adminToken')
    if (savedToken) {
      validateToken(savedToken)
    }
  }, [])

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/key/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (!data.expired) {
          setAdminToken(token)
          setIsAuthenticated(true)
          setKeyExpiry(data)
          return true
        }
      }
      sessionStorage.removeItem('adminToken')
      setIsAuthenticated(false)
      return false
    } catch {
      sessionStorage.removeItem('adminToken')
      setIsAuthenticated(false)
      return false
    }
  }

  const handleLogin = async (key: string) => {
    if (!key.trim()) {
      setLoginError('Please enter the admin key')
      return
    }

    setLoginLoading(true)
    setLoginError('')

    try {
      const response = await fetch(
        `${API_URL}/api/v1/admin/login?key=${encodeURIComponent(key)}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setAdminToken(data.token)
        setKeyExpiry(data.key_expiry)
        setIsAuthenticated(true)
        sessionStorage.setItem('adminToken', data.token)
      } else {
        const error = await response.json()
        setLoginError(error.detail || 'Invalid admin key')
      }
    } catch {
      setLoginError(`Failed to connect to server at ${API_URL}`)
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    setAdminToken('')
    setIsAuthenticated(false)
    setKeyExpiry(null)
    sessionStorage.removeItem('adminToken')
  }

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 100))
  }, [])

  const clearLogs = () => setLogs([])

  const handleUploadComplete = () => {
    setMessage({
      type: 'success',
      text: 'Songs uploaded successfully!',
    })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <AdminLogin
        onLogin={handleLogin}
        error={loginError}
        isLoading={loginLoading}
      />
    )
  }

  // Authenticated dashboard
  return (
    <Box bg="white" minH="100vh" p={8}>
      {/* Header */}
      <HStack justify="space-between" maxW="1400px" mx="auto" mb={6}>
        <HStack gap={3}>
          <FiLock color="#1DB954" />
          <Text fontWeight="600" color="black">
            Admin Dashboard
          </Text>
          {keyExpiry && !keyExpiry.expired && (
            <Text fontSize="xs" color="gray.500">
              Key expires in {Math.floor(keyExpiry.seconds_remaining / 60)} min
            </Text>
          )}
        </HStack>
        <HStack gap={3}>
          <Button
            size="sm"
            variant="outline"
            colorScheme="gray"
            onClick={() => validateToken(adminToken)}
          >
            <FiRefreshCw />
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorScheme="red"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </HStack>
      </HStack>

      <HStack maxW="1400px" mx="auto" gap={6} align="start">
        {/* Main Content */}
        <VStack flex={1} gap={4} align="stretch">
          {/* Message */}
          {message.text && (
            <Box
              p={3}
              borderRadius="4px"
              bg={
                message.type === 'success'
                  ? '#d4edda'
                  : message.type === 'warning'
                  ? '#fff3cd'
                  : '#f8d7da'
              }
              color={
                message.type === 'success'
                  ? '#155724'
                  : message.type === 'warning'
                  ? '#856404'
                  : '#721c24'
              }
              border={`1px solid ${
                message.type === 'success'
                  ? '#c3e6cb'
                  : message.type === 'warning'
                  ? '#ffeaa7'
                  : '#f5c6cb'
              }`}
            >
              {message.text}
            </Box>
          )}

          {/* Main Tabs */}
          <HStack gap={2} mb={4}>
            <Button
              onClick={() => setActiveTab('upload')}
              variant={activeTab === 'upload' ? 'solid' : 'outline'}
              colorScheme="blue"
              size="sm"
            >
              Upload Songs
            </Button>
            <Button
              onClick={() => setActiveTab('manage')}
              variant={activeTab === 'manage' ? 'solid' : 'outline'}
              colorScheme="blue"
              size="sm"
            >
              Manage Songs
            </Button>
          </HStack>

          {/* Tab Content */}
          {activeTab === 'upload' ? (
            <SongUploader
              adminToken={adminToken}
              addLog={addLog}
              onUploadComplete={handleUploadComplete}
            />
          ) : (
            <SongManager adminToken={adminToken} onLogout={handleLogout} />
          )}
        </VStack>

        {/* Server Logs Sidebar */}
        <ServerLogs logs={logs} onClear={clearLogs} />
      </HStack>
    </Box>
  )
}
