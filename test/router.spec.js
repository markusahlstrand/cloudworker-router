import { Router } from '../src/Router';

describe('dummy', () => {
  it('should pass', () => {
    const router = new Router();

    router.get('/', async (ctx) => {
      return new Response('Hello');
    });

    const event = new FetchEvent();
    const response = router.handle(event);
  });
});
