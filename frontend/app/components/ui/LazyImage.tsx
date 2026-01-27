import { useState, useRef, useEffect } from 'react';
import { Box, Text } from '@chakra-ui/react';
import Image from 'next/image';
import { APP_CONSTANTS } from '../../constants';

interface LazyImageProps {
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

export function LazyImage({ src, alt, size = 'md', fallbackIcon = '♪' }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const dimensions = sizeMap[size];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={imgRef}
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
      {isInView && src && !error ? (
        <Image
          src={src}
          alt={alt}
          fill
          style={{
            borderRadius: '8px',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          loading="lazy"
        />
      ) : (
        <Text color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} fontSize={dimensions.fontSize}>
          {fallbackIcon}
        </Text>
      )}
    </Box>
  );
}