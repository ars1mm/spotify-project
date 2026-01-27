import { Button, ButtonProps } from '@chakra-ui/react';
import { APP_CONSTANTS } from '../../constants';

interface PrimaryButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export function PrimaryButton({ children, ...props }: PrimaryButtonProps) {
  return (
    <Button
      bg={APP_CONSTANTS.COLORS.PRIMARY}
      color={APP_CONSTANTS.COLORS.TEXT_PRIMARY}
      _hover={{ bg: APP_CONSTANTS.COLORS.PRIMARY_HOVER }}
      {...props}
    >
      {children}
    </Button>
  );
}

export function SecondaryButton({ children, ...props }: PrimaryButtonProps) {
  return (
    <Button
      bg="transparent"
      color={APP_CONSTANTS.COLORS.TEXT_PRIMARY}
      _hover={{ bg: APP_CONSTANTS.COLORS.INPUT_BG }}
      {...props}
    >
      {children}
    </Button>
  );
}

export function DangerButton({ children, ...props }: PrimaryButtonProps) {
  return (
    <Button
      bg={APP_CONSTANTS.COLORS.ERROR}
      color={APP_CONSTANTS.COLORS.TEXT_PRIMARY}
      _hover={{ bg: APP_CONSTANTS.COLORS.ERROR_HOVER }}
      {...props}
    >
      {children}
    </Button>
  );
}