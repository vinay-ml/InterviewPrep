import { jwtDecode } from 'jwt-decode';

export const getStoredJwtToken = () => {
  const tokenData = localStorage.getItem('token');
  if (!tokenData) return '';

  try {
    const parsed = JSON.parse(tokenData);
    if (parsed && typeof parsed === 'object' && typeof parsed.token === 'string') {
      return parsed.token;
    }
  } catch (_) {
    // Ignore parse errors and treat value as a raw token string.
  }

  return tokenData;
};

export const getDecodedAuthToken = () => {
  const jwtToken = getStoredJwtToken();
  if (!jwtToken) return {};

  try {
    return jwtDecode(jwtToken);
  } catch (error) {
    console.error('Invalid token:', error);
    return {};
  }
};
