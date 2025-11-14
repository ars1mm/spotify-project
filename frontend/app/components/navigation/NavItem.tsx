'use client';

import { Box, Text, Icon } from '@chakra-ui/react';
import { IconType } from 'react-icons';

interface NavItemProps {
  icon: IconType;
  label: string;
}

export function NavItem({ icon, label }: NavItemProps) {
  return (
    <Box 
      display="flex" 
      alignItems="center" 
      gap={4} 
      cursor="pointer" 
      _hover={{ color: 'white' }} 
      color="#B3B3B3"
      w="full"
    >
      <Icon as={icon} boxSize={6} />
      <Text>{label}</Text>
    </Box>
  );
}