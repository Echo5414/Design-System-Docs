export interface User {
    id: string;
    username: string;
    email: string;
  }
  
  export async function refreshToken() {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      console.log('No JWT found in storage for refresh');
      return null;
    }
  
    try {
      console.log('Refreshing token...');
      const response = await fetch('http://localhost:1337/api/auth/refresh', {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token refresh failed:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        return null;
      }
      
      const data = await response.json();
      localStorage.setItem('jwt', data.jwt);
      console.log('Token refreshed successfully');
      return data.jwt;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }
  
  export async function getUser(): Promise<User | null> {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      console.log('No JWT found in storage for user fetch');
      return null;
    }
  
    try {
      console.log('Fetching user data...');
      const response = await fetch('http://localhost:1337/api/users/me', {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch user data:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        return null;
      }
      
      const userData = await response.json();
      console.log('User data fetched successfully:', userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }
  
  export async function exchangeToken(jwt: string) {
    if (!jwt) {
      console.error('No JWT provided for exchange');
      throw new Error('No JWT provided');
    }
  
    try {
      console.log('Storing JWT in localStorage...');
      localStorage.setItem('jwt', jwt);
      console.log('JWT stored successfully');
      return jwt;
    } catch (error) {
      console.error('Failed to store JWT:', error);
      throw error;
    }
  } 