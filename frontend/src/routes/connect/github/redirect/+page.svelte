<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  async function handleCallback() {
    try {
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');
      
      if (error) {
        console.error('GitHub auth error:', error);
        goto('/');
        return;
      }

      const accessToken = params.get('access_token');
      
      if (!accessToken) {
        console.error('No access token received');
        goto('/');
        return;
      }

      // Exchange the GitHub access token for a Strapi JWT
      const response = await fetch(`http://localhost:1337/api/auth/github/callback?access_token=${accessToken}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Response status:', response.status);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Auth response:', data);

      if (data.jwt) {
        localStorage.setItem('jwt', data.jwt);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        console.error('No JWT in response');
        goto('/');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      goto('/');
    }
  }

  onMount(() => {
    handleCallback();
  });
</script>

<div class="loading">
  <p>Authenticating with GitHub...</p>
</div>

<style>
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
</style> 