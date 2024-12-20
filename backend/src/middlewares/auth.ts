export default () => {
  return async (ctx, next) => {
    try {
      // Get the token from the authorization header
      const token = ctx.request.header.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return ctx.unauthorized('No token provided');
      }

      // Verify and decode the token
      const verified = await strapi.plugins['users-permissions'].services.jwt.verify(token);
      
      // Get the user from the database
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { id: verified.id },
      });

      if (!user) {
        return ctx.unauthorized('User not found');
      }

      // Add user to state
      ctx.state.user = user;

      await next();
    } catch (err) {
      ctx.unauthorized('Invalid token');
    }
  };
}; 