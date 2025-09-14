// API client with automatic 401 handling
let authContextInstance = null;
let navigateInstance = null;

// Set auth context reference (called from AuthProvider)
export const setAuthContext = (authContext) => {
  authContextInstance = authContext;
};

// Set navigate function reference (called from App component)
export const setNavigate = (navigate) => {
  navigateInstance = navigate;
};

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

/**
 * Enhanced fetch wrapper that automatically handles 401 errors
 * @param {string} url - API endpoint (relative to base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export const apiClient = async (url, options = {}) => {
  // Get token from localStorage (same as AuthContext does)
  const getToken = () => {
    try {
      const stored = localStorage.getItem('auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.token;
      }
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
    }
    return null;
  };

  // Build full URL
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  // Get current token
  const token = getToken();
  
  // Merge headers with authorization if token exists
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Make the request
  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized responses
  if (response.status === 401) {
    console.log('API returned 401 - logging out user');
    
    // Clear authentication data
    localStorage.removeItem('auth');
    
    // Call logout from auth context if available
    if (authContextInstance && authContextInstance.logout) {
      authContextInstance.logout();
    }
    
    // Redirect to login page if navigate function is available
    if (navigateInstance) {
      navigateInstance('/login', { replace: true });
    } else {
      // Fallback: use window.location if navigate is not available
      window.location.href = '/login';
    }
    
    // Return the response for the calling code to handle
    return response;
  }

  return response;
};

/**
 * GET request wrapper
 */
export const get = (url, options = {}) => {
  return apiClient(url, {
    method: 'GET',
    ...options,
  });
};

/**
 * POST request wrapper
 */
export const post = (url, data, options = {}) => {
  return apiClient(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    ...options,
  });
};

/**
 * PUT request wrapper
 */
export const put = (url, data, options = {}) => {
  return apiClient(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    ...options,
  });
};

/**
 * DELETE request wrapper
 */
export const del = (url, options = {}) => {
  return apiClient(url, {
    method: 'DELETE',
    ...options,
  });
};

export default apiClient; 