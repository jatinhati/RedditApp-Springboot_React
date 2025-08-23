// Utility functions for safe localStorage operations

export const clearAuthData = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

export const getAuthData = () => {
  try {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData || userData === 'undefined' || userData === 'null') {
      return { token: null, user: null };
    }
    
    const parsedUser = JSON.parse(userData);
    return { token, user: parsedUser };
  } catch (error) {
    console.error('Error parsing auth data:', error);
    clearAuthData();
    return { token: null, user: null };
  }
};

export const setAuthData = (token, user) => {
  try {
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error setting auth data:', error);
    return false;
  }
};

// Clean up any invalid data on app start
export const cleanupInvalidData = () => {
  try {
    const userData = localStorage.getItem('user');
    if (userData === 'undefined' || userData === 'null') {
      clearAuthData();
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
    clearAuthData();
  }
};