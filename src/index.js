const parser = require('./parser');
const resolver = require('./resolver');
const constants = require('./constants');

module.exports = class Router {
    constructor() {
        this.routes = [];
        // this.routes = rules.map(parser.parseRoute);
        // // Merge the defaultHandlers with any custom handlers
        // this.handlers = Object.assign({}, defaultHandlers, handlers);    
    }

    get(path, handler) {
        const route = parser.parseRoute({
            method: [constants.methods.GET, constants.methods.HEAD],
            path,
            handler,
        });

        this.routes.push(route);
    }

    post(path, handler) {
        const route = parser.parseRoute({
            method: ['POST'],
            path,
            handler,
        });

        this.routes.push(route);
    }

    add({
        host,
        path,
        method,
    }, handler) {
        const route = parser.parseRoute({
            method,
            host,
            path,
            handler
        });

        this.routes.push(route);
    }

    async resolve(event) {
        const req = await parser.parseRequest(event.request);

        // This is the context passed between resolvers
        const ctx = {
            req,
            event,
            state: {},
        };

        try {
            await resolver.recurseRoutes(ctx, this.routes);

            return new Response(ctx.body, {
                status: ctx.status,
                headers: ctx.headers,
            });
        } catch (err) {
            return new Response(err.message, {
                status: 500,
            });
        }
    }
}