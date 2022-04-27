import makeServiceWorkerEnv from 'service-worker-mock';
import { Router } from '../src/Router';

declare var global: any;

function createEvent(request: Request): FetchEvent {
  // @ts-ignore Sadly the typing seem to be off here, creating a FetchEvent is valid in a test environment.
  return new FetchEvent('fetch', { request });
}

describe('get', () => {
  beforeEach(() => {
    Object.assign(global, makeServiceWorkerEnv());
    jest.resetModules();
  });

  it('should return a 200 for a successful get request', async () => {
    const router = new Router();

    router.get('/', async (ctx) => {
      return new Response('Hello');
    });

    const request = new Request('/', { method: 'GET', body: 'hello' });
    const fetchEvent: FetchEvent = createEvent(request);

    const response = await router.handle(fetchEvent);

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
    const fetchEvent: FetchEvent = createEvent(request);

    const response = await router.handle(fetchEvent);

    expect(response.status).toBe(204);
    expect(response.headers.get('allow')).toBe('OPTIONS, GET, HEAD');
  });

  describe('head requests', () => {
    it('should respond to head requets', async () => {
      const router = new Router();

      router.get('/', async (ctx) => {
        return new Response('Hello');
      });

      router.use(router.allowedMethods());

      const request = new Request('/', { method: 'HEAD' });
      const fetchEvent: FetchEvent = createEvent(request);

      const response = await router.handle(fetchEvent);
      const body = await response.text();

      expect(response.status).toBe(200);
      expect(body).toBe('');
    });
  });
});
