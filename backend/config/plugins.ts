export default {
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '7d',
      },
      providers: {
        github: {
          enabled: true,
          icon: 'github',
          key: process.env.GITHUB_CLIENT_ID,
          secret: process.env.GITHUB_CLIENT_SECRET,
          callback: '/api/connect/github/callback',
          scope: ['read:user', 'user:email', 'repo'],
          redirectUri: process.env.FRONTEND_URL,
        },
      },
    },
  },
};
