const Router = require('../src');

const router = new Router();
router.get('/', async (ctx) => {
  ctx.body = 'Hello world!';
  ctx.status = 200;
});

router.get('/hello', async (ctx) => {
  ctx.body = `Hello ${ctx.query.get('name')}!`;
  ctx.status = 200;
});

router.get('/hello/:name', async (ctx) => {
  ctx.body = `Hello ${ctx.params.name}!`;
  ctx.status = 200;
});

router.get('/headers', async (ctx) => {
  ctx.body = JSON.stringify(ctx.request.headers);
  // Set a response header

  ctx.set('X-Foo', 'Bar');
  ctx.status = 200;
});

router.get('/query', async (ctx) => {
  ctx.body = JSON.stringify(ctx.request.query);
  ctx.status = 200;
});

router.get('/wildcard/:file*', async (ctx) => {
  ctx.body = ctx.params.file;
  ctx.status = 200;
});

router.get('/event', async (ctx) => {
  ctx.body = JSON.stringify(ctx.event);
  ctx.status = 200;
});

router.get('/ctx', async (ctx) => {
  ctx.body = JSON.stringify(ctx);
  ctx.status = 200;
});

/**
 * Fetch and log a given request object
 * @param {Request} options
 */
async function handler(event) {
  return router.resolve(event);
}

module.exports = handler;
