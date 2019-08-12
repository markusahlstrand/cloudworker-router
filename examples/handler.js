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

/**
 * Fetch and log a given request object
 * @param {Request} options
 */
async function handler(event) {
  return router.resolve(event);
}

module.exports = handler;
