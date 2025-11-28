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

    // Grant createRepo permission to authenticated role
    try {
      const roleService = strapi.plugin('users-permissions').service('role');
      const authenticatedRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' }
      });

      if (authenticatedRole) {
        const permissionAction = 'api::github.github.createRepo';
        const existingPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
          where: {
            action: permissionAction,
            role: authenticatedRole.id
          }
        });

        if (!existingPermission) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              action: permissionAction,
              role: authenticatedRole.id
            }
          });
          strapi.log.info(`> Granted ${permissionAction} permission to Authenticated role`);
        } else {
          strapi.log.info(`> Permission ${permissionAction} already exists for Authenticated role`);
        }
      }
    } catch (error) {
      strapi.log.error('> Failed to update permissions:', error);
    }

    // DEBUG: List all roles to see what's available
    try {
      const roles = await strapi.db.query('plugin::users-permissions.role').findMany();
      strapi.log.info('> Available roles:', roles.map(r => `${r.name} (${r.type})`).join(', '));

      const authRole = roles.find(r => r.type === 'authenticated');
      if (authRole) {
        const permissionAction = 'api::github.github.createRepo';
        const existingPermission = await strapi.db.query('plugin::users-permissions.permission').findOne({
          where: {
            action: permissionAction,
            role: authRole.id
          }
        });

        if (!existingPermission) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              action: permissionAction,
              role: authRole.id
            }
          });
          strapi.log.info(`> RETRY: Granted ${permissionAction} permission to Authenticated role`);
        }
      }
    } catch (e) {
      strapi.log.error('> Error listing roles:', e);
    }
  },
};