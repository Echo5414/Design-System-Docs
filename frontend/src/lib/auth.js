export async function refreshToken() {
  const jwt = localStorage.getItem('jwt');
  if (!jwt) return;

  try {
    const response = await fetch('http://localhost:1337/api/token/refresh', {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('jwt', data.jwt);
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
} 