export default {
    routes: [
        {
            method: 'POST',
            path: '/design-system/connect',
            handler: 'design-system.connect',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
