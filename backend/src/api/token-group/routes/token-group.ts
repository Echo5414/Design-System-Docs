export default {
  routes: [
    {
      method: 'GET',
      path: '/token-groups',
      handler: 'token-group.find',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/token-groups/:id',
      handler: 'token-group.findOne',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/token-groups',
      handler: 'token-group.create',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/token-groups/:id',
      handler: 'token-group.update',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/token-groups/:id',
      handler: 'token-group.delete',
      config: {
        policies: [],
      },
    },
  ],
};
