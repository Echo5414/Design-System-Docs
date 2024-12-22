export default {
  async bootstrap({ strapi }) {
    const pluginStore = strapi.store({
      type: 'plugin',
      name: 'users-permissions',
      key: 'grant',
    });

    const grantConfig = await pluginStore.get() || {};

    // Remove the entire "github" section so it doesn't override code-based config
    if (grantConfig.github) {
      delete grantConfig.github;
    }
    
    await pluginStore.set({ value: grantConfig });

    strapi.log.info('> Deleted GitHub from plugin store — now code config will be used exclusively!');
  },
};
