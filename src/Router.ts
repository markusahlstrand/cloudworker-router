import { Router as TinyRequestRouter, Method } from 'tiny-request-router';
import { Context } from './types/Context';

// Let the router know that handlers are async functions returning a Response
type Handler = (ctx: Context) => Promise<Response>;

export class Router extends TinyRequestRouter<Handler> {
  async handleRequest(request: Request): Promise<Response> {
    const { pathname, searchParams } = new URL(request.url);
    const match = this.match(request.method as Method, pathname);
    if (match) {
      const ctx = {
        request,
        params: match.params,
        query: searchParams,
      };

      // Call the async function of that match
      return match.handler(ctx);
    }

    return new Response('Not Found', {
      status: 404,
    });
  }
}
