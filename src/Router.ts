import { Key as TokenKey, pathToRegexp } from 'path-to-regexp';
import { Context } from './types/Context';
import { RouteCallback } from './types/RouteCallback';
import { Params } from './types/Params';

// https://basarat.gitbooks.io/typescript/docs/tips/barrel.html
export { pathToRegexp };
export { Context };

/** Valid HTTP methods for matching. */
export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
export type MethodWildcard = 'ALL';

// Let the router know that handlers are async functions returning a Response
type Handler<Env> = (ctx: Context<Env>) => Promise<Response | RouteCallback | undefined>;

export interface Route<Handler> {
  method: Method | MethodWildcard;
  path: string;
  regexp: RegExp;
  keys: Keys;
  handler: Handler;
}

/**
 * The object returned when a route matches.
 *
 * The handler can then be used to execute the relevant function.
 *
 * @example
 * {
 *   params: Params
 *   matches?: RegExpExecArray
 *   method: Method | MethodWildcard
 *   path: string
 *   regexp: RegExp
 *   options: RouteOptions
 *   keys: Keys
 *   handler: Handler
 * }
 */
export interface RouteMatch<Handler> extends Route<Handler> {
  params: Params;
  matches?: RegExpExecArray;
}

export type Key = TokenKey;
export type Keys = Array<Key>;
/**
 * Cloudworkder-router
 *
 * @example
 * import { Router, Method, Params } from 'cloudworker-router'
 *
 * const router = new Router<Handler>()
 */
export class Router<
  Env = { [key: string]: string | DurableObjectNamespace | KVNamespace | Fetcher },
> {
  /** List of all registered routes. */
  public routes: Array<Route<Handler<Env>>> = [];

  /** Add a route that matches any method. */
  public all(path: string, handler: Handler<Env>) {
    return this.push('ALL', path, handler);
  }

  /** Add a route that matches the GET method. */
  public get(path: string | RegExp, ...handlers: Handler<Env>[]) {
    handlers.forEach((handler) => {
      this.push('GET', path, handler).push('HEAD', path, handler);
    });
    return this;
  }

  /** Add a route that matches the POST method. */
  public post(path: string | RegExp, ...handlers: Handler<Env>[]) {
    handlers.forEach((handler) => {
      this.push('POST', path, handler);
    });
    return this;
  }

  /** Add a route that matches the PUT method. */
  public put(path: string | RegExp, ...handlers: Handler<Env>[]) {
    handlers.forEach((handler) => {
      this.push('PUT', path, handler);
    });
    return this;
  }

  /** Add a route that matches the PATCH method. */
  public patch(path: string | RegExp, ...handlers: Handler<Env>[]) {
    handlers.forEach((handler) => {
      this.push('PATCH', path, handler);
    });
    return this;
  }

  /** Add a route that matches the DELETE method. */
  public delete(path: string | RegExp, ...handlers: Handler<Env>[]) {
    handlers.forEach((handler) => {
      this.push('DELETE', path, handler);
    });
    return this;
  }

  /** Add a route that matches the HEAD method. */
  public head(path: string | RegExp, ...handlers: Handler<Env>[]) {
    handlers.forEach((handler) => {
      this.push('HEAD', path, handler);
    });
    return this;
  }

  /** Add a route that matches the OPTIONS method. */
  public options(path: string | RegExp, ...handlers: Handler<Env>[]) {
    handlers.forEach((handler) => {
      this.push('OPTIONS', path, handler);
    });
    return this;
  }

  /** Add a middlewares handler */
  public use(handler: Handler<Env>) {
    return this.push('ALL', '*', handler);
  }

  /** Add a middlewares for handling options requets */
  public allowedMethods(): Handler<Env> {
    return async (ctx: Context<Env>) => {
      const url = new URL(ctx.request.url);
      const allow: { [key: string]: boolean } = {
        OPTIONS: true,
      };

      this.routes.forEach((route) => {
        // Skip catch all
        if (route.method === 'ALL') {
          return;
        }

        const matches = route.regexp.exec(url.pathname);

        if (!matches || !matches.length) {
          return;
        }

        allow[route.method] = true;
      });

      return new Response(null, {
        status: 204,
        headers: {
          allow: Object.keys(allow).join(', '),
        },
      });
    };
  }

  public *matches(method: Method, path: string): IterableIterator<RouteMatch<Handler<Env>> | null> {
    for (const route of this.routes) {
      // Skip immediately if method doesn't match
      if (route.method !== method && route.method !== 'ALL') continue;
      // Speed optimizations for catch all wildcard routes
      if (route.path === '(.*)') {
        yield { ...route, params: { '0': route.path } };
      }
      const matches = route.regexp.exec(path);
      if (!matches || !matches.length) continue;
      yield { ...route, matches, params: keysToParams(matches, route.keys) };
    }

    return null;
  }

  public async handle(request: Request, env: Env, context: ExecutionContext): Promise<Response> {
    const { pathname, searchParams } = new URL(request.url);
    const matches = this.matches(request.method as Method, pathname);
    const callbacks: RouteCallback[] = [];

    const ctx = {
      request,
      query: searchParams,
      headers: request.headers,
      params: {},
      state: {},
      env,
      event: context,
    };

    for await (const match of matches) {
      if (match) {
        // Update the params for the currenct match
        ctx.params = match.params;

        let error: Error | null = null;
        let result: Response | RouteCallback | undefined;

        // Call the async function of that match
        try {
          result = await match.handler(ctx);
        } catch (err) {
          error = err as Error;
          // Set a default error response
          result = new Response('Server Error', { status: 500 });
        }

        if (result instanceof Response) {
          for await (const callback of callbacks) {
            try {
              result = await callback(result, error);
            } catch (err) {
              error = err as Error;
            }
          }

          // Remove the body for head requests
          if (request.method === 'HEAD') {
            return new Response('', result);
          }

          return result;
        } else if (result instanceof Function) {
          callbacks.push(result);
        }
      }
    }

    return new Response('Not Found', {
      status: 404,
    });
  }

  private push(method: Method | MethodWildcard, path: string | RegExp, handler: Handler<Env>) {
    const keys: Keys = [];
    if (path === '*') {
      path = '(.*)';
    }

    const regexp = pathToRegexp(path, keys);
    this.routes.push({ method, path: path.toString(), handler, keys, regexp });
    return this;
  }
}

// Convert an array of keys and matches to a params object
const keysToParams = (matches: RegExpExecArray, keys: Keys): Params => {
  const params: Params = {};
  for (let i = 1; i < matches.length; i++) {
    const key = keys[i - 1];
    const prop = key.name;
    const val = matches[i];
    if (val !== undefined) {
      params[prop] = val;
    }
  }
  return params;
};
