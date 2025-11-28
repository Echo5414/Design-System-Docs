import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::design-system.design-system', ({ strapi }) => ({
    async connect(ctx) {
        const { repoName, repoOwner, branch = 'main' } = ctx.request.body;
        const user = ctx.state.user;

        if (!user) return ctx.unauthorized();
        if (!repoName || !repoOwner) return ctx.badRequest('Missing repo details');

        try {
            // Check if exists
            const existing = await strapi.db.query('api::design-system.design-system').findOne({
                where: { repo_name: repoName, repo_owner: repoOwner }
            });

            if (existing) {
                return { data: existing, created: false };
            }

            // Create new
            const name = `${repoOwner}/${repoName}`;
            const newSystem = await strapi.entityService.create('api::design-system.design-system', {
                data: {
                    name,
                    slug: name.replace(/\//g, '-').toLowerCase(),
                    repo_name: repoName,
                    repo_owner: repoOwner,
                    branch,
                }
            });

            // Create default collections
            const defaultCollections = [];
            for (const col of [
                { name: 'Colors', key: 'color', description: 'Color palette' },
                { name: 'Typography', key: 'typography', description: 'Text styles' },
                { name: 'Spacing', key: 'dimension', description: 'Spacing and layout' }
            ]) {
                const created = await strapi.entityService.create('api::token-collection.token-collection', {
                    data: {
                        ...col,
                        design_system: newSystem.id
                    }
                });
                defaultCollections.push(created);
            }

            // Return the system with its ID
            console.log('Created design system with ID:', newSystem.id);
            return {
                data: {
                    id: newSystem.id,
                    documentId: newSystem.documentId,
                    ...newSystem,
                    collections: defaultCollections
                },
                created: true
            };
        } catch (error) {
            console.error('Error connecting design system:', error);
            return ctx.internalServerError('Failed to connect design system');
        }
    }
}));
