import { Box, BoxProps } from '@chakra-ui/react';
import { APP_CONSTANTS } from '../../constants';

interface CardProps extends BoxProps {
  children: React.ReactNode;
}

export function Card({ children, ...props }: CardProps) {
  return (
    <Box
      bg={APP_CONSTANTS.COLORS.CARD_BG}
      borderRadius="8px"
      p={6}
      boxShadow="0 4px 60px rgba(0,0,0,.5)"
      {...props}
    >
      {children}
    </Box>
  );
}

export function PageContainer({ children, ...props }: CardProps) {
  return (
    <Box
      flex="1"
      bg="#121212"
      p={{ base: 4, md: 8 }}
      overflowY="auto"
      {...props}
    >
      {children}
    </Box>
  );
}

export function Modal({ children, onClose, ...props }: CardProps & { onClose: () => void }) {
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
      {...props}
    >
      {children}
    </Box>
  );
}