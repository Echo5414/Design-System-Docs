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

      // Get the GitHub token from request header or cookie
      // Note: In Strapi, cookies are accessed via ctx.cookies.get
      const githubToken = ctx.request.header['github-token'] ||
        ctx.cookies.get('github') ||
        ctx.cookies.get('github_token');

      console.log('--- Debug Create Repo ---');
      console.log('Auth Header:', ctx.request.header.authorization ? 'Present' : 'Missing');
      console.log('GitHub Token Header:', ctx.request.header['github-token'] ? 'Present' : 'Missing');
      console.log('GitHub Cookie:', ctx.cookies.get('github') ? 'Present' : 'Missing');
      console.log('GitHub Token Cookie:', ctx.cookies.get('github_token') ? 'Present' : 'Missing');
      console.log('User:', ctx.state.user ? ctx.state.user.username : 'No User');
      console.log('-------------------------');

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

  async listRepos(ctx) {
    try {
      // Verify user is authenticated
      if (!ctx.state.user) {
        return ctx.unauthorized('You must be logged in');
      }

      // Get the GitHub token from request header or cookie
      const githubToken = ctx.request.header['github-token'] ||
        ctx.cookies.get('github') ||
        ctx.cookies.get('github_token');

      if (!githubToken) {
        return ctx.unauthorized('No GitHub token provided');
      }

      // Fetch user's repositories from GitHub
      const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      const repos = await response.json() as any[];

      if (!response.ok) {
        return ctx.badRequest('Failed to fetch repositories');
      }

      // Return simplified repo data with owner and default_branch
      const simplifiedRepos = repos.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        html_url: repo.html_url,
        description: repo.description,
        private: repo.private,
        updated_at: repo.updated_at,
        owner: {
          login: repo.owner.login
        },
        default_branch: repo.default_branch || 'main'
      }));

      return { data: simplifiedRepos };
    } catch (error) {
      console.error('List repos error:', error);
      return ctx.badRequest(error instanceof Error ? error.message : 'Unknown error');
    }
  },
};