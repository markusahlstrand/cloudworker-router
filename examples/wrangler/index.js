const Router = require('../../src');

const router = new Router();

router.get('/', async (ctx) => {
  ctx.body = 'Hello World';
  ctx.status = 200;
});

addEventListener('fetch', (event) => {
  event.respondWith(router.resolve(event));
});
