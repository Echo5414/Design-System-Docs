<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  async function handleCallback() {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      
      if (!code) {
        console.error('No code received');
        goto('/');
        return;
      }

      // Let Strapi handle the GitHub OAuth flow
      const response = await fetch(`http://localhost:1337/api/auth/github/callback?code=${code}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Auth response:', data);

      if (data.jwt) {
        localStorage.setItem('jwt', data.jwt);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        throw new Error('No JWT received');
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