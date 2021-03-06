const Router = require('../src');

const router = new Router();

async function wait() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('done');
    }, 100);
  });
}

router.get('/', async (ctx) => {
  ctx.body = 'Hello world!';
  ctx.status = 200;
});

router.add(
  {
    method: ['GET'],
    handlerName: 'TestHandler',
    path: '/test-handlername',
  },
  async (ctx) => {
    ctx.body = 'Test for handler names';
    ctx.status = 200;
  },
);

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

router.get('/wait', async (ctx) => {
  ctx.body = await wait();
  ctx.status = 200;
});

router.post('/hello', async (ctx) => {
  try {
    const body = await ctx.request.json();
    ctx.body = JSON.stringify(body);
    ctx.status = 200;
  } catch (error) {
    console.log(error.message);
    ctx.status = 400;
  }
});

router.get('/event', async (ctx) => {
  ctx.body = JSON.stringify(ctx.event);
  ctx.status = 200;
});

router.get('/ctx', async (ctx) => {
  ctx.body = JSON.stringify(ctx);
  ctx.status = 200;
});

router.del('/test-delete', async (ctx) => {
  ctx.body = 'Deleted';
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
