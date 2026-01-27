import { Box, Text } from '@chakra-ui/react';
import Image from 'next/image';
import { APP_CONSTANTS } from '../../constants';

interface CoverImageProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  fallbackIcon?: string;
}

const sizeMap = {
  sm: { w: '40px', h: '40px', fontSize: '12px' },
  md: { w: { base: '160px', md: '232px' }, h: { base: '160px', md: '232px' }, fontSize: '48px' },
  lg: { w: '300px', h: '300px', fontSize: '64px' }
};

export function CoverImage({ src, alt, size = 'md', fallbackIcon = '♪' }: CoverImageProps) {
  const dimensions = sizeMap[size];

  return (
    <Box
      w={dimensions.w}
      h={dimensions.h}
      bg={APP_CONSTANTS.COLORS.CARD_BG}
      borderRadius="8px"
      flexShrink={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          style={{
            borderRadius: '8px',
            objectFit: 'cover',
          }}
        />
      ) : (
        <Text color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} fontSize={dimensions.fontSize}>
          {fallbackIcon}
        </Text>
      )}
    </Box>
  );
}