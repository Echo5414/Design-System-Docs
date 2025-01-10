export default {
  routes: [
    {
      method: 'GET',
      path: '/auth/logout',
      handler: 'auth.logout',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 