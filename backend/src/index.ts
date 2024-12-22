// File: /src/index.ts (or .js)
export default {
  async register(/*{ strapi }*/) {
    // This runs before the bootstrap below, but after 
    // every plugin has been loaded.
  },

  async bootstrap({ strapi }) {
    const pluginStore = await strapi.store({
      type: 'plugin',
      name: 'users-permissions',
      key: 'grant',
    });

    const grantConfig = await pluginStore.get();

    // Configure GitHub OAuth
    if (!grantConfig.github) {
      grantConfig.github = {};
    }

    grantConfig.github.enabled = true;
    grantConfig.github.key = process.env.GITHUB_CLIENT_ID || 'myDefaultKey';
    grantConfig.github.secret = process.env.GITHUB_CLIENT_SECRET || 'myDefaultSecret';
    grantConfig.github.callbackUrl = 'api/auth/github/callback';
    grantConfig.github.redirectUri = 'http://localhost:1337/api/connect/github/callback';
    grantConfig.github.scope = ['repo', 'user', 'user:email'];

    await pluginStore.set({ value: grantConfig });
    strapi.log.info('> Updated GitHub provider scope + enabled in the plugin store!');
  },
};