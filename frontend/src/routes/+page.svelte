<script lang="ts">
    import { onMount } from 'svelte';
  
    interface User {
        username: string;
        // Add other user properties as needed
    }
  
    let user: User | null = null;
    let loading = true;
    let isLoggingIn = false;
  
    const handleGitHubLogin = () => {
      isLoggingIn = true;
      console.log('Redirecting to GitHub login...');
      const loginUrl = 'http://localhost:1337/api/connect/github';
      window.location.href = loginUrl;
    };
  
    const handleLogout = () => {
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
      user = null;
    };
  
    onMount(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          user = JSON.parse(storedUser);
        } catch (e) {
          console.error('Error parsing stored user:', e);
          localStorage.removeItem('user');
        }
      }
      loading = false;
    });
  </script>
  
  <main class="container">
    <h1>Welcome to SvelteKit</h1>
    
    {#if loading}
      <p>Loading...</p>
    {:else if user}
      <div class="user-info">
        <p>Welcome, {user.username}!</p>
        <button class="logout-button" on:click={handleLogout}>
          Logout
        </button>
      </div>
    {:else}
      <button 
        class="github-button"
        on:click={handleGitHubLogin}
        disabled={isLoggingIn}
      >
        {isLoggingIn ? 'Connecting...' : 'Login with GitHub'}
      </button>
    {/if}
  </main>
  
  <style>
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }
  
    .github-button {
      background-color: #24292e;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 20px;
      transition: background-color 0.2s;
      text-decoration: none;
    }
  
    .github-button:hover {
      background-color: #2f363d;
    }
  
    .user-info {
      margin-top: 20px;
    }
  
    .logout-button {
      background-color: #dc3545;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }
  
    .logout-button:hover {
      background-color: #c82333;
    }
  </style>