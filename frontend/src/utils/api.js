// API utility for handling backend calls
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  import.meta.env.PROD ? '/api' : 'http://localhost:5001/api'
);

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, defaultOptions);
    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export const getFileUrl = (filePath) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL 
    ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') 
    : 'http://localhost:5001';
  return `${baseUrl}/${filePath}`;
};

export default apiCall;