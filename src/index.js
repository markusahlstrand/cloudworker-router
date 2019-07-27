const parser = require('./parser');
const resolver = require('./resolver');
const constants = require('./constants');
const Context = require('./context');

module.exports = class Router {
    constructor() {
        this.routes = [];
    }

    get(path, handler) {
        const route = parser.parseRoute({
            method: [constants.methods.GET, constants.methods.HEAD],
            path,
            handler,
            allowOptions: true,
        });

        this.routes.push(route);
    }

    post(path, handler) {
        const route = parser.parseRoute({
            method: [constants.methods.POST],
            path,
            handler,
            allowOptions: true,
        });

        this.routes.push(route);
    }

    patch(path, handler) {
        const route = parser.parseRoute({
            method: [constants.methods.PATCH],
            path,
            handler,
            allowOptions: true,
        });

        this.routes.push(route);
    }

    del(path, handler) {
        const route = parser.parseRoute({
            method: [constants.methods.DEL],
            path,
            handler,
            allowOptions: true,
        });

        this.routes.push(route);
    }

    use(handler) {
        const route = parser.parseRoute({
            handler,
            allowOptions: false,
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
        const ctx = new Context(event);

        try {
            await resolver.recurseRoutes(ctx, this.routes);

            return new Response(ctx.body, {
                status: ctx.status,
                headers: ctx.response.headers,
            });
        } catch (err) {
            return new Response(err.message, {
                status: 500,
            });
        }
    }
}