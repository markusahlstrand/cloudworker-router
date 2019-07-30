const ncw = require('node-cloudworker');
const Router = require('../src');

ncw.applyShims();

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

ncw.start(async (event) => {
    return await router.resolve(event);
});