import toast from 'react-hot-toast';

export const handleApiError = (error: any, defaultMessage: string) => {
  console.error(defaultMessage, error);
  const message = error?.response?.data?.detail || error?.message || defaultMessage;
  toast.error(message);
};

export const handleApiSuccess = (message: string) => {
  toast.success(message);
};

export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorMessage: string,
  successMessage?: string
): Promise<T | null> => {
  try {
    const result = await operation();
    if (successMessage) {
      handleApiSuccess(successMessage);
    }
    return result;
  } catch (error) {
    handleApiError(error, errorMessage);
    return null;
  }
};