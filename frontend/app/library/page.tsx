'use client'

import { Box, Flex } from '@chakra-ui/react'
import { useState } from 'react'
import { Sidebar } from '../components/navigation/Sidebar'
import { LibraryContent } from '../components/layout/LibraryContent'
import { Player } from '../components/player/Player'
import { AuthButtons } from '../components/auth/AuthButtons'
import { UserProfile } from '../components/user/UserProfile'
import { authStorage } from '../lib/auth'

import { Suspense } from 'react'

export default function LibraryPage() {
  const [isAuthenticated] = useState(() => authStorage.isAuthenticated())
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <Box h="100vh" bg="#191414">
      <Box position="absolute" top={{ base: "8px", md: 4 }} right={4} zIndex={16}>
        {isAuthenticated ? <UserProfile /> : <AuthButtons />}
      </Box>

      <Flex h="100vh" pt={{ base: "56px", md: 0 }} pb="90px">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <Suspense fallback={<Box flex="1" bg="#121212" />}>
          <LibraryContent />
        </Suspense>
      </Flex>
      <Player />
    </Box>
  )
}
