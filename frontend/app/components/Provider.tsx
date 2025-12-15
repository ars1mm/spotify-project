'use client';

import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

const system = createSystem(defaultConfig);

interface ProviderProps {
  children: ReactNode;
}

export function Provider({ children }: ProviderProps) {
  return (
    <ChakraProvider value={system}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
        containerStyle={{
          top: 20,
        }}
        gutter={8}
      />
    </ChakraProvider>
  );
}