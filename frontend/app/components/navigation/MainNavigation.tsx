import { VStack } from '@chakra-ui/react';
import { FiHome, FiSearch, FiMusic } from 'react-icons/fi';
import { NavItem } from './NavItem';
import { useRouter } from 'next/navigation';

interface MainNavigationProps {
  onNavClick: (callback?: () => void) => void;
  onSearchToggle: () => void;
}

export function MainNavigation({ onNavClick, onSearchToggle }: MainNavigationProps) {
  const router = useRouter();
  
  const handleSearchClick = () => {
    router.push('/');
    onSearchToggle();
  };

  return (
    <VStack align="start" gap={4} w="full">
      <NavItem icon={FiHome} label="Home" href="/" />
      <NavItem icon={FiSearch} label="Search" onClick={() => onNavClick(handleSearchClick)} />
      <NavItem icon={FiMusic} label="Your Library" href="/library" />
    </VStack>
  );
}