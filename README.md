# Cloudworker Router

A small (3,36KB) koajs-router-style router for cloudflare workers.

- Express style routing with router.get, router.post ..
- Named URL paramters
- Route based on host headers
- Multiple route middlewares
- ES7 async/await support

## Installation

```
npm install cloudworker-router --save
```

## Basic Usage

The idea is to make the router work as closely to the koajs-router as possible, partly because it's a tried and tested module but also to make the learning curve as flat as possible.

Basic example with GET request

```
const Router = require('cloudworker-router');

router.get('/', async (ctx) => {
    ctx.body = 'Hello World';
    ctx.status = 200;
});

addEventListener('fetch', event => {
  event.respondWith(router.resolve(event));
})
```

The router exposes get, post, patch and del methods as shorthands for the most common use cases. For examples of their usage, see the example folder. HEAD requests are handled automatically by the router.

For more examples on usage and deployment see the examples folder in the project.

### Defining paths

The paths are translated to regular expressions for matching. Query strings are not considred when matching requests.

Named router paramteres are captured and added to `ctx.params` :

```
router.get('/hello/:name', async (ctx) => {
    ctx.status = 200
    ctx.body = 'Hello ' + ctx.params.name;
});

router.get('/:wildcard*', async (ctx) => {
    ctx.status = 200;
    ctx.body = ctx.params.wildcard; // Will return the whole path
});

```

For routing on other properties than the method or the path the routes can be added using the router.add function:

```
router.add({
    host: 'test.example.com', // Defaults to .*
    path: '/hello', Defaults to .*
    method: ['GET', 'HEAD'], // Defaults to ['GET']
}, async (ctx) => {
    ctx.status = 200;
    ctx.body = 'Hello world';
});
```

Named parameters can be added to the host property as well and are the values are also added to ctx.params:

```
router.add({
    host: ':sub.example.com',
    path: '/hello',
    method: ['GET', 'HEAD'],
}, async (ctx) => {
    ctx.status = 200;
    ctx.body = ctx.params.sub; // Will contain the subdomain from the request
});
```

### Context

The context encapsulates the request and the response object.

A new context instance are created for each request.

## Cloudflare specifics

### Chunked encoding

By default cloudflare uses chunked encoding. Content-Length headers are not allowed in chunked responses according to the http-spec so they are automatically removed by cloudflare. If the worker respondes directly with a buffer rather than streaming the response cloudflare will automatically add/overwrite with a correct Content-Length header.

### Head requests

If a worker respondes with a body to a head request cloudflare will remove the body and set the correct Content-Length headers. From a router perspective the head requests are handled just like get requests.
