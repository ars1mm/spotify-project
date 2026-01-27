/**
 * ************************************
 * EN: SERVER LOGS COMPONENT
 *    Displays real-time server logs and activity
 * AL: KOMPONENTI I LOGJEVE TË SERVERIT
 *    Shfaq logjet e serverit dhe aktivitetin në kohë reale
 * ************************************
 * 
 * HOW TO ADD A NEW LOG TYPE:
 * 1. Add a new log type constant
 * 2. Update the log parsing logic to recognize the type
 * 3. Add styling for the new type
 * 4. Update the filter logic if needed
 * 
 * SI TË SHTONI NJË LLOJ TË RI LOGU:
 * 1. Shtoni një konstante të re llogu
 * 2. Përditësoni logjikën e analizës së logut për të njohur llojin
 * 3. Shtoni stilin për llojin e ri
 * 4. Përditësoni logjikën e filtrimit nëse nevojitet
 */

'use client'

import { Box, VStack, HStack, Text, Button } from '@chakra-ui/react'

interface ServerLogsProps {
  logs: string[]
  onClear: () => void
}

export default function ServerLogs({ logs, onClear }: ServerLogsProps) {
  return (
    <Box border="1px solid #ddd" p={4} borderRadius="4px">
      <HStack justify="space-between" mb={3}>
        <Text fontWeight="600" color="black">
          Server Logs
        </Text>
        <Button size="xs" variant="outline" onClick={onClear}>
          Clear
        </Button>
      </HStack>
      <Box
        bg="#f8f9fa"
        border="1px solid #e9ecef"
        borderRadius="4px"
        p={3}
        h="500px"
        overflowY="auto"
        fontFamily="monospace"
        fontSize="xs"
      >
        {logs.length === 0 ? (
          <Text color="gray.600">No logs yet...</Text>
        ) : (
          logs.map((log, index) => (
            <Text
              key={index}
              mb={1}
              color={
                log.includes('✓')
                  ? 'green.600'
                  : log.includes('✗')
                  ? 'red.600'
                  : 'black'
              }
            >
              {log}
            </Text>
          ))
        )}
      </Box>
    </Box>
  )
}
