/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

function parseRoute({
  host = '.*',
  path = '.*',
  excludePath = null,
  method = ['.*'],
  handler,
  protocol = '.*',
  handlerName,
  headers = {},
  data,
}) {
  const hostVariables = [];
  const pathVariables = [];

  const hostRegexpString = host
    // Replace any variables in the host
    .replace(/(:([^.]+))/g, ($1, $2, $3) => {
      hostVariables.push($3);
      return '([^.]+)';
    });

  // Then parse the variables in the path
  const pathRegexpString = path.replace(/(:([^/]+))/g, ($1, $2, $3) => {
    // Check for wildcard parameters
    if ($3.slice(-1) === '*') {
      pathVariables.push($3.slice(0, $3.length - 1));
      return '(.*)';
    }

    pathVariables.push($3);
    return '([^/]*)';
  });

  const hostRegex = new RegExp(`^${hostRegexpString}$`, 'i');
  const pathRegex = new RegExp(`^${pathRegexpString}$`, 'i');
  const excludePathRegex = excludePath ? new RegExp(`^${excludePath}$`, 'i') : null;
  const methodRegex = new RegExp(`^${method.join('|')}$`, 'i');
  const protocolRegex = new RegExp(`^${protocol}$`, 'i');

  return {
    hostVariables,
    pathVariables,
    host: hostRegex,
    path: pathRegex,
    excludePath: excludePathRegex,
    method: methodRegex,
    protocol: protocolRegex,
    handler,
    handlerName,
    headers,
    data,
  };
}

function instanceToJson(instance) {
  return [...instance].reduce((obj, item) => {
    const prop = {};
    // eslint-disable-next-line prefer-destructuring
    prop[item[0]] = item[1];
    return { ...obj, ...prop };
  }, {});
}

async function streamToString(readable, maxSize = 1024 * 1024) {
  const results = [];
  const reader = readable.getReader();
  // eslint-disable-next-line no-undef
  const textDecoder = new TextDecoder();
  let bytesCount = 0;

  while (maxSize && bytesCount < maxSize) {
    // eslint-disable-next-line no-await-in-loop
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    bytesCount += value.byteLength;
    results.push(textDecoder.decode(value));
  }

  const result = results.join('');
  if (maxSize) {
    return result.substring(0, maxSize);
  }
  return result;
}

function parseRequest(request) {
  const url = new URL(request.url);

  const query = instanceToJson(url.searchParams);
  const headers = instanceToJson(request.headers);

  if (headers.host) {
    url.hostname = headers.host;
  }

  return {
    body: request.body,
    headers,
    host: url.host,
    hostname: url.hostname,
    href: url.href,
    json: async (maxSize) => JSON.parse(await streamToString(request.body, maxSize)),
    method: request.method,
    origin: `${url.protocol}//${url.host}`,
    path: url.pathname,
    protocol: url.protocol.slice(0, -1), // Remove the semicolon at the end
    query,
    querystring: url.search.slice(1),
    search: url.search,
    text: async (maxSize) => {
      const bodyText = await streamToString(request.body, maxSize);
      if (request.headers.get('content-type') === 'application/x-www-form-urlencoded') {
        return decodeURIComponent(bodyText);
      }
      return bodyText;
    },
  };
}
module.exports = {
  parseRoute,
  parseRequest,
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const Router = __webpack_require__(2);

const router = new Router();

router.get('/', async (ctx) => {
  ctx.body = 'Hello World';
  ctx.status = 200;
});

addEventListener('fetch', (event) => {
  event.respondWith(router.resolve(event));
});


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const parser = __webpack_require__(0);
const resolver = __webpack_require__(3);
const constants = __webpack_require__(4);
const Context = __webpack_require__(5);

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


/***/ }),
/* 3 */
/***/ (function(module, exports) {

function getParams(req, route) {
  const params = {};

  const hostParamsMatch = route.host.exec(req.host);
  route.hostVariables.forEach((name, index) => {
    params[name] = hostParamsMatch[index + 1];
  });

  const pathParamsMatch = route.path.exec(req.path);
  route.pathVariables.forEach((name, index) => {
    params[name] = pathParamsMatch[index + 1];
  });

  return params;
}

function testHeaders(route, request) {
  let result = true;

  Object.keys(route.headers).forEach((key) => {
    if (request.headers[key] !== route.headers[key]) {
      result = false;
    }
  });

  return result;
}

function testProtocol(route, request) {
  return route.protocol.test(request.protocol);
}

/**
 * Checks if the route is valid for a request
 * @param {route} route
 * @param {*} request
 */
function testPath(route, request) {
  // Check the method and path
  return (
    // Stupid prettier rules..
    // eslint-disable-next-line operator-linebreak
    route.method.test(request.method) &&
    // eslint-disable-next-line operator-linebreak
    route.host.test(request.host) &&
    // eslint-disable-next-line operator-linebreak
    route.path.test(request.path) &&
    // eslint-disable-next-line operator-linebreak
    testHeaders(route, request) &&
    // eslint-disable-next-line operator-linebreak
    testProtocol(route, request) &&
    (!route.excludePath || !route.excludePath.test(request.path))
  );
}

async function recurseRoutes(ctx, routes) {
  const [route, ...nextRoutes] = routes;
  if (!route) {
    // eslint-disable-next-line
    return new Response('NOT_FOUND', {
      status: 404,
    });
  }

  if (!testPath(route, ctx.request)) {
    return recurseRoutes(ctx, nextRoutes);
  }

  ctx.state.handlers = ctx.state.handlers || [];
  // Use the provided name and fall back to the name of the function
  ctx.state.handlers.push(route.handlerName || route.handler.name);
  ctx.params = getParams(ctx.request, route);

  try {
    return route.handler(ctx, async (result) => recurseRoutes(result, nextRoutes));
  } catch (err) {
    err.route = route.handler.name;
    throw err;
  }
}

module.exports = {
  recurseRoutes,
};


/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = {
  methods: {
    DELETE: 'DELETE',
    GET: 'GET',
    HEAD: 'HEAD',
    OPTIONS: 'OPTIONS',
    PATCH: 'PATCH',
    POST: 'POST',
  },
  statusMessages: {
    404: 'Not found',
    429: 'Rate limited',
  },
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

const parser = __webpack_require__(0);

module.exports = class Context {
  constructor(event) {
    this.request = parser.parseRequest(event.request);
    this.event = event;
    this.state = {};
    this.cloned = false;
    this.response = {
      headers: {},
    };
    this.body = '';
    this.status = 404;

    // Shortcuts directly on the context
    this.query = this.request.query;
  }

  /**
   * Gets a header from the request
   * @param {string} key
   */
  header(key) {
    return this.request.headers[key];
  }

  /**
   * Set a header on the response
   * @param {string} key
   * @param {string} value
   */
  set(key, value) {
    this.response.headers[key] = value;
  }

  /**
   * Creates a cloned context
   */
  clone() {
    const clonedContext = new Context(this.event);
    clonedContext.cloned = true;

    return clonedContext;
  }
};


/***/ })
/******/ ]);