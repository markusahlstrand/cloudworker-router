# Cloudworker Router V3

With V3 of the router we now support wrangler V2 module, which required a change of the handle function signature.

This is a rewrite of the v1 router based on the [tiny-request-router](https://www.npmjs.com/package/tiny-request-router) that does the heavy lifting.

The router is based on [path-to-regexp](https://github.com/pillarjs/path-to-regexp) for the path matching, which is used by many other routers as well.

The goal is to make a battery included, opinionated typescript router for cloudflare workers.

- Express style routing with router.get, router.post ..
- Named URL paramters
- Multiple route middlewares
- Responds to OPTIONS requests with allowed methods
- HEAD request served automagically
- ES7 async/await support

## Installation

```bash
npm install cloudworker-router --save
```

## Basic Usage

The router handlers simply returns Response objects for basic handlers.

Basic example with GET request

```js
const Router = require('cloudworker-router');

const router = new Router();

router.get('/', async (ctx) => {
  return new Response('Hello World');
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return router.handle(request, env, ctx);
  },
};
```

The router exposes get, post, patch and del methods as shorthands for the most common use cases. For examples of their usage, see the example folder. HEAD requests are handled automatically by the router.

For more examples on usage and deployment see the examples folder in the project.

### Defining paths

The paths are translated to regular expressions for matching. Query strings are not considred when matching requests.

Named router paramteres are captured and added to `ctx.params` :

```js
router.get('/hello/:name', async (ctx) => {
  return new Response('Hello ' + ctx.params.name);
});

router.get('/:wildcard*', async (ctx) => {
  return new Response(ctx.params.wildcard; // Will return the whole path
});
```

### Middlewares

If a handler returns a function rather than a response it's considered a middlewares and will be triggered after the response as well. This makes it possible to make for instance request loggers and error handlers.

```js
router.use(async (ctx) => {
  // Maybe store the request start timestamp
  const start = new Date();

  return async (response: Response, error: Error | null) {
    // Log something?

    if(error) {
      // handle an error
      return new Response(error.message, {
        status: 500
      })
    }

    return response;
  }
});
```

### Context

The context encapsulates the request and the response object.

A new context instance are created for each request.

An example of a context object created for a request:

```js
{
  request: Request,
  event: ExecutionContext
  state: {},
  query: {
    foo: "bar"
  },
  params: {}
  env: {}
}
```

### Env

The Router is generic class that makes it possible to get strictly typed env.

```js
const Router = require('cloudworker-router');

interface MyEnv {
  test: string;
}
const router = new Router<MyEnv>();

router.get('/', async (ctx) => {
  return new Response(ctx.env.test);
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return router.handle(reuquest, env, ctx);
  },
};
```

### Allow headers

The router can match OPTIONS request against the registered routes to respond with the correct allowed headers.

To enable handling of OPTIONS requests call allowHeaders after all other routes:

```js
const router = new Router();

router.get('/', async (ctx) => {
  ctx.status = 200;
});

router.use(router.allowMethods());
```

## Cloudflare specifics

### Chunked encoding

By default cloudflare uses chunked encoding. Content-Length headers are not allowed in chunked responses according to the http-spec so they are automatically removed by cloudflare. If the worker respondes directly with a buffer rather than streaming the response cloudflare will automatically add/overwrite with a correct Content-Length header.

### Head requests

If a worker respondes with a body to a head request cloudflare will remove the body and set the correct Content-Length headers. From a router perspective the head requests are handled just like get requests.
