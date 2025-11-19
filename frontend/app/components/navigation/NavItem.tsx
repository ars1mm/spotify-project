'use client';

import { Box, Text, Icon } from '@chakra-ui/react';
import { IconType } from 'react-icons';
import { useRouter } from 'next/navigation';

interface NavItemProps {
  icon: IconType;
  label: string;
  href?: string;
  onClick?: () => void;
}

export function NavItem({ icon, label, href, onClick }: NavItemProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <Box 
      display="flex" 
      alignItems="center" 
      gap={4} 
      cursor="pointer" 
      _hover={{ color: 'white' }} 
      color="#B3B3B3"
      w="full"
      onClick={handleClick}
    >
      <Icon as={icon} boxSize={6} />
      <Text>{label}</Text>
    </Box>
  );
}