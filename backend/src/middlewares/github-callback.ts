interface GitHubUser {
  login: string;
  email?: string;
  id: number;
  node_id: string;
  avatar_url: string;
  name?: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

export default () => {
  return async (ctx, next) => {
    await next();

    // Only handle GitHub callback responses
    if (ctx.url.startsWith('/api/connect/github/callback') && ctx.status === 302) {
      try {
        // Extract access token from the redirect URL
        const redirectUrl = new URL(ctx.response.get('Location'));
        const access_token = redirectUrl.searchParams.get('access_token');

        if (!access_token) {
          console.log('No access token found in redirect URL');
          return;
        }

        // Get user data from GitHub
        const githubUserResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Accept': 'application/json',
          },
        });
        
        const githubUser = await githubUserResponse.json() as GitHubUser;

        // Get user's emails from GitHub
        const emailsResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Accept': 'application/json',
          },
        });

        const emails = await emailsResponse.json() as GitHubEmail[];
        const primaryEmail = emails.find(email => email.primary)?.email;

        if (!primaryEmail) {
          console.log('No primary email found in GitHub user data');
          return;
        }

        // Find or create user
        const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
          where: { email: primaryEmail },
        });

        // Get authenticated role
        const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({
          where: { type: 'authenticated' },
        });

        const userData = {
          username: githubUser.login,
          email: primaryEmail,
          provider: 'github',
          confirmed: true,
          blocked: false,
          role: authenticatedRole.id,
        };

        let user;
        if (!existingUser) {
          user = await strapi.query('plugin::users-permissions.user').create({
            data: userData,
          });
        } else {
          user = await strapi.query('plugin::users-permissions.user').update({
            where: { id: existingUser.id },
            data: userData,
          });
        }

        // Generate JWT token
        const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
          id: user.id,
        });

        // Update redirect URL with JWT
        redirectUrl.searchParams.set('jwt', jwt);
        ctx.set('Location', redirectUrl.toString());
      } catch (error) {
        console.error('GitHub callback middleware error:', error);
      }
    }
  };
}; 