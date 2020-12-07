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
    });

    this.routes.push(route);
  }

  options(path, handler) {
    const route = parser.parseRoute({
      method: [constants.methods.OPTIONS],
      path,
      handler,
    });

    this.routes.push(route);
  }

  post(path, handler) {
    const route = parser.parseRoute({
      method: [constants.methods.POST],
      path,
      handler,
    });

    this.routes.push(route);
  }

  patch(path, handler) {
    const route = parser.parseRoute({
      method: [constants.methods.PATCH],
      path,
      handler,
    });

    this.routes.push(route);
  }

  del(path, handler) {
    const route = parser.parseRoute({
      method: [constants.methods.DELETE],
      path,
      handler,
    });

    this.routes.push(route);
  }

  allowMethods() {
    this.options('.*', (ctx) => {
      const matchingRoutes = resolver
        .matchRoutePaths(ctx.request, this.routes)
        .filter((route) => !route.middleware);

      const headers = {};
      matchingRoutes.forEach((route) => {
        route.method.forEach((method) => {
          headers[method] = true;
        });
      });

      ctx.status = 204;
      ctx.set('Access-Control-Allow-Method', Object.keys(headers).join(', '));
    });
  }

  /**
   * Adds a middleware
   * @param {*} handler
   */
  use(handler) {
    const route = parser.parseRoute({
      handler,
      // This flag can be used when responding to OPTIONS requests,
      // which is outside the scope of this project
      middleware: true,
    });

    this.routes.push(route);
  }

  /**
   * Adds a route with all possible parameters
   * @param {*} param0
   * @param {*} handler
   */
  add({ host, path, excludePath, method, handlerName, headers, protocol }, handler) {
    const route = parser.parseRoute({
      method,
      host,
      path,
      excludePath,
      handler,
      headers,
      handlerName,
      protocol,
    });

    this.routes.push(route);
  }

  /**
   *
   * @param {*} event
   */
  async resolve(event) {
    const ctx = new Context(event);

    try {
      await resolver.recurseRoutes(ctx, this.routes);

      // eslint-disable-next-line no-undef
      return new Response(ctx.body, {
        status: ctx.status,
        headers: ctx.response.headers,
      });
    } catch (err) {
      // eslint-disable-next-line no-undef
      return new Response(err.message, {
        status: 500,
      });
    }
  }
};
