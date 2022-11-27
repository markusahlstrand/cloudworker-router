import makeServiceWorkerEnv from 'service-worker-mock';
import { Context, Router } from '../src/Router';

interface Env {
  dummy: string;
}

function createExecutionContext(): ExecutionContext {
  return {
    waitUntil: () => Promise.resolve(),
    passThroughOnException: jest.fn(),
  };
}

function createFetcher(): Fetcher {
  return {
    fetch: jest.fn(),
    connect: jest.fn(),
  };
}

describe('get', () => {
  beforeEach(() => {
    Object.assign(globalThis, makeServiceWorkerEnv());
    jest.resetModules();
  });

  it('should return a 200 for a successful get request', async () => {
    const router = new Router();

    router.get('/', async (ctx) => {
      return new Response('Hello');
    });

    const request = new Request('/', { method: 'GET', body: 'hello' });

    const response = await router.handle(request, {}, createExecutionContext());

    expect(response.status).toBe(200);
  });

  it('should use strictly typed env', async () => {
    interface MyEnv {
      test: string;
      bindingService: Fetcher;
    }
    const router = new Router<MyEnv>();

    router.get('/', async (ctx) => {
      return new Response(ctx.env.test);
    });
    const request = new Request('/', { method: 'GET', body: 'hello' });
    const response = await router.handle(
      request,
      { test: 'testValue', bindingService: createFetcher() },
      createExecutionContext(),
    );
    const body = await response.text();

    expect(body).toBe('testValue');
  });
});

describe('routing', () => {
  it('should support regExp routing', async () => {
    const router = new Router();

    router.get(/test\d/i, async (ctx) => {
      return new Response('Hello');
    });

    const request = new Request('/test5', { method: 'GET', body: 'hello' });

    const response = await router.handle(request, {}, createExecutionContext());

    expect(response.status).toBe(200);
  });
});

describe('allow headers', () => {
  it('should return to a options request', async () => {
    const router = new Router();

    router.get('/', async (ctx) => {
      return new Response('Hello');
    });

    router.use(router.allowedMethods());

    const request = new Request('/', { method: 'OPTIONS' });

    const response = await router.handle(request, {}, createExecutionContext());

    expect(response.status).toBe(204);
    expect(response.headers.get('allow')).toBe('OPTIONS, GET, HEAD');
  });
});

describe('head requests', () => {
  it('should respond to head requets', async () => {
    const router = new Router();

    router.get('/', async (ctx) => {
      return new Response('Hello');
    });

    const request = new Request('/', { method: 'HEAD' });

    const response = await router.handle(request, {}, createExecutionContext());
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toBe('');
  });
});

describe('middlewares', () => {
  beforeEach(() => {
    Object.assign(globalThis, makeServiceWorkerEnv());
    jest.resetModules();
  });

  it('should pass through an empty middleware', async () => {
    const router = new Router<Env>();

    router.use(async (ctx: Context<Env>, next: () => Promise<Response | undefined>) => {
      return await next();
    });

    router.get('/', async (ctx) => {
      return new Response('handler');
    });

    const request = new Request('/', { method: 'GET' });

    const response = await router.handle(request, { dummy: '' }, createExecutionContext());
    const body = await response.text();

    expect(body).toBe('handler');
  });

  it('should rewrite response in middleware', async () => {
    const router = new Router<Env>();

    router.use(async (ctx: Context<Env>, next: () => Promise<Response | undefined>) => {
      await next();

      return new Response('middleware');
    });

    router.get('/', async (ctx) => {
      return new Response('handler');
    });

    const request = new Request('/', { method: 'GET' });

    const response = await router.handle(request, { dummy: '' }, createExecutionContext());
    const body = await response.text();

    expect(body).toBe('middleware');
  });

  it('should handle errors in middleware', async () => {
    const router = new Router();

    async function errorHandler(ctx, next) {
      try {
        await next();
      } catch (err) {
        return new Response('Error', {
          status: 500,
        });
      }
    }

    router.use(errorHandler);

    router.get('/', async (ctx) => {
      throw new Error('test');
    });

    const request = new Request('/', { method: 'GET' });

    const response = await router.handle(request, {}, createExecutionContext());
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(body).toBe('Error');
  });

  it('should pass a middleware when declaring a route', async () => {
    const router = new Router();

    async function middleware(ctx, next): Promise<Response> {
      ctx.state.order = 'A';

      await next(ctx);
      ctx.state.order += 'C';

      // Overwrite the response with the state to check the order
      return new Response(ctx.state.order);
    }

    router.get('/', middleware, async (ctx) => {
      ctx.state.order += 'B';
      return new Response('handler');
    });

    const request = new Request('/', { method: 'GET' });

    const response = await router.handle(request, {}, createExecutionContext());
    const body = await response.text();

    expect(body).toBe('ABC');
  });
});
