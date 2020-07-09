# Cloudworker Router

A small (3,36KB) koajs-router-style router for cloudflare workers.

- Express style routing with router.get, router.post ..
- Named URL paramters
- Route based on hosts, path, headers and protocol
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

const router = new Router();

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
    path: '/hello', // Defaults to .*
    protocol: 'http', // Defaults to .*
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

As Cloudflare adds country codes to the request headers it's possible to route the request based on geo or any other header passed by the client:

```
router.add({
    path: '/hello',
    method: ['GET'],
    headers: {
      'cf-ipcountry': 'SE'
    }
}, async (ctx) => {
    ctx.status = 200;
    ctx.body = 'Hello Sweden!!';
});
```

### Excluding paths

It's possible to excluding certain paths from the path matching by specifying the exceptPath property of a route. This can for instance be useful if a authentication middleware shouldn't be executed for a webhook.

```
router.add({
    path: '/.*',
    excludePath: '/public',
    method: ['GET'],
}, async (ctx) => {
    ctx.status = 403;
    ctx.body = 'Forbidden...`';
});
```

### Context

The context encapsulates the request and the response object.

A new context instance are created for each request.

An example of a context object created for a request:

```
{
  request: {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
      accept-encoding: "gzip",
      accept-language: "en-GB,en-US;q=0.9,en;q=0.8,es;q=0.7",
      cf-connecting-ip: "88.0.193.153",
      cf-ipcountry: "ES",
      cf-ray: "50ac448ca95ed685",
      cf-visitor: "{"scheme":"http"}",
      connection: "Keep-Alive",
      cookie: "__cfduid=dee52228d3848ca5abc16f5c6be4640981565603001",
      host: "router.ahlstrand.es",
      upgrade-insecure-requests: "1",
      user-agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.87 Safari/537.36",
      x-forwarded-proto: "http",
      x-real-ip: "88.0.193.153"
    },
    href: "http://router.ahlstrand.es/ctx?foo=bar",
    host: "router.ahlstrand.es",
    hostname: "router.ahlstrand.es",
    method: "GET",
    origin: "http://router.ahlstrand.es",
    path: "/ctx",
    protocol: "http",
    query: {
      foo: "bar"
    },
    querystring: "foo=bar",
    search: "?foo=bar
  },
  event: {
    request: {
      cf: {
        tlsVersion: "",
        httpProtocol: "HTTP/1.1",
        tlsCipher: "",
        asn: 3352,
        requestPriority: "",
        clientTrustScore: 91,
        country: "ES",
        tlsClientAuth: {
          certIssuerDNLegacy: "",
          certIssuerDN: "",
          certIssuerDNRFC2253: "",
          certSubjectDNLegacy: "",
          certVerified: "NONE",
          certNotAfter: "",
          certSubjectDN: "",
          certFingerprintSHA1: "",
          certNotBefore: "",
          certSerial: "",
          certPresented: "0",
          certSubjectDNRFC2253: ""
        },
        colo: "MAD"
      },
      fetcher: {

      },
      redirect: "manual",
      headers: {

      },
      url: "http://router.ahlstrand.es/ctx?foo=bar",
      method: "GET",
      bodyUsed: false,
      body: null
    },
    type: "fetch"
  },
  state: {
    handlers: []
  },
  response: {
    headers: {

    }
  },
  body: "",
  status: 404,
  query: {
    foo: "bar"
  },
  params: {}
}
```

The name all invoced handlers is stored in an array in the state for debugging purposes.

The context provides the async methods text() and json() that can read the body either as a string or as a json document.

## Cloudflare specifics

### Chunked encoding

By default cloudflare uses chunked encoding. Content-Length headers are not allowed in chunked responses according to the http-spec so they are automatically removed by cloudflare. If the worker respondes directly with a buffer rather than streaming the response cloudflare will automatically add/overwrite with a correct Content-Length header.

### Head requests

If a worker respondes with a body to a head request cloudflare will remove the body and set the correct Content-Length headers. From a router perspective the head requests are handled just like get requests.
