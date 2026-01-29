/*
 * ERROR HANDLING UTILITIES - UTILITËT PËR MENAXHIMIN E GABIMEVE
 * 
 * Përmban funksione për menaxhimin e centralizuar të gabimeve.
 * Integrohet me react-hot-toast për shfaqjen e mesazheve.
 * 
 * Funksionet kryesore:
 * - handleApiError: Menaxhon gabimet e API-ve
 * - handleApiSuccess: Shfaq mesazhe suksesi
 * - withErrorHandling: Wrapper për operacione async
 * 
 * Karakteristika:
 * - Ekstraktimi i mesazheve nga përgjigjet e API-ve
 * - Fallback në mesazhe default
 * - Logging për debugging
 */
import toast from 'react-hot-toast';

/*
 * ERROR INTERFACE - STRUKTURA E GABIMEVE
 * 
 * Përcakton strukturën e gabimeve që mund të vijnë nga API-të.
 * Mbështet formatët e ndryshme të error response-ve.
 */
interface ErrorWithResponse {
  response?: {
    data?: {
      detail?: string;
    };
  };
  message?: string;
}

/*
 * HANDLE API ERROR - MENAXHUESI I GABIMEVE TË API-VE
 * 
 * Ekstrakton mesazhin e gabimit nga përgjigja e API-së dhe e shfaq.
 * Kontrollon struktura të ndryshme të error response-ve.
 * 
 * Parametrat:
 * - error: Gabimi që ka ndëdhur
 * - defaultMessage: Mesazhi default nëse nuk gjendet specifik
 * 
 * Logjika:
 * 1. Log-on gabimin për debugging
 * 2. Përpiqet të ekstraktojë mesazhin specifik
 * 3. Shfaq toast me mesazhin e gabimit
 */
export const handleApiError = (error: unknown, defaultMessage: string) => {
  console.error(defaultMessage, error);
  
  let message = defaultMessage;
  
  if (error && typeof error === 'object') {
    const err = error as ErrorWithResponse;
    message = err?.response?.data?.detail || err?.message || defaultMessage;
  }
  
  toast.error(message);
};

/*
 * HANDLE API SUCCESS - MENAXHUESI I SUKSESIT
 * 
 * Shfaq mesazh suksesi për operacionet e suksesshme.
 * Përdor toast.success për UI feedback pozitiv.
 */
export const handleApiSuccess = (message: string) => {
  toast.success(message);
};

/*
 * WITH ERROR HANDLING - WRAPPER PËR ERROR HANDLING
 * 
 * Higher-order function që wrap-on operacionet async me error handling.
 * Automatikisht menaxhon gabimet dhe mesazhet e suksesit.
 * 
 * Parametrat:
 * - operation: Funksioni async që do të ekzekutohet
 * - errorMessage: Mesazhi i gabimit
 * - successMessage: Mesazhi i suksesit (opsional)
 * 
 * Return:
 * - Rezultatin e operacionit nëse sukses
 * - null nëse ka gabim
 * 
 * Raste përdorimi:
 * - API calls në komponente
 * - Form submissions
 * - Async operations që kanë nevojë për user feedback
 */
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