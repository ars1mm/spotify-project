import toast from 'react-hot-toast';

interface ErrorWithResponse {
  response?: {
    data?: {
      detail?: string;
    };
  };
  message?: string;
}

export const handleApiError = (error: unknown, defaultMessage: string) => {
  console.error(defaultMessage, error);
  
  let message = defaultMessage;
  
  if (error && typeof error === 'object') {
    const err = error as ErrorWithResponse;
    message = err?.response?.data?.detail || err?.message || defaultMessage;
  }
  
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