export default {
  routes: [
    {
      method: 'POST',
      path: '/github/create-repo',
      handler: 'github.createRepo',
      config: {
        auth: {
          enabled: true,
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/github/repos',
      handler: 'github.listRepos',
      config: {
        auth: {
          enabled: true,
        },
        policies: [],
        middlewares: [],
      },
    },
  ],
};