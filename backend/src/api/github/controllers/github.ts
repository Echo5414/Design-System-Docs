interface CreateRepoBody {
  name: string;
  description?: string;
  private?: boolean;
  auto_init?: boolean;
}

interface GitHubErrorResponse {
  message: string;
  documentation_url?: string;
}

interface GitHubSuccessResponse {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
}

export default {
  async createRepo(ctx) {
    try {
      // Verify user is authenticated
      if (!ctx.state.user) {
        return ctx.unauthorized('You must be logged in');
      }

      // Get the GitHub token from request header
      const githubToken = ctx.request.header['github-token'];
      console.log('Received GitHub token:', githubToken ? 'present' : 'missing');
      console.log('User:', ctx.state.user);
      
      if (!githubToken) {
        return ctx.unauthorized('No GitHub token provided');
      }

      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ctx.request.body as CreateRepoBody),
      });

      const data = await response.json() as GitHubErrorResponse | GitHubSuccessResponse;

      if (!response.ok) {
        return ctx.badRequest('message' in data ? data.message : 'Failed to create repository');
      }

      return { data };
    } catch (error) {
      console.error('Controller error:', error);
      return ctx.badRequest(error instanceof Error ? error.message : 'Unknown error');
    }
  },
}; 