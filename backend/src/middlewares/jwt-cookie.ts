export default (config, { strapi }) => {
    return async (ctx, next) => {
        // If there is no Authorization header but there is a jwt cookie
        if (!ctx.request.header.authorization && ctx.cookies.get('jwt')) {
            const token = ctx.cookies.get('jwt');
            ctx.request.header.authorization = `Bearer ${token}`;
        }
        await next();
    };
};
