const { expect } = require('chai');
const Router = require('../src');
const constants = require('../src/constants');
const responseUtils = require('./responseUtils');

describe('router', () => {

  describe('router.get', () => {
    it('should route a GET request to a test route', async () => {
      const router = new Router();
  
      router.get('/', async (ctx) => {
        ctx.body = 'test';
        ctx.status = 200;
      });
  
      const response = await router.resolve({
        request: new Request('http://localhost:3000/', {
          method: constants.methods.GET,
        }),
      });
  
      const body = await responseUtils.getBodyText(response.body);
  
      expect(body).to.equal('test');
    });  

    it('should route hanlde HEAD requests with the GET paths', async () => {
      const router = new Router();
  
      router.get('/', async (ctx) => {
        ctx.body = 'test';
        ctx.status = 200;
      });
  
      const response = await router.resolve({
        request: {
          url: 'http://localhost:3000/',
          method: constants.methods.HEAD,
        },
      });
  
      const body = await responseUtils.getBodyText(response.body);
  
      // The body is removed in cloudflare and the correct content-length headers set.
      expect(body).to.equal('test');
    });  
  });

  describe('router.post', () => {
    it('should route a POST request to a test route', async () => {
      const router = new Router();
  
      router.post('/', async (ctx) => {
        ctx.body = 'test';
        ctx.status = 200;
      });
  
      const response = await router.resolve({
        request: {
          url: 'http://localhost:3000/',
          method: constants.methods.POST,
        },
      });
  
      const body = await responseUtils.getBodyText(response.body);
  
      expect(body).to.equal('test');
    });  
  });

  describe('router.patch', () => {
    it('should route a PATCH request to a test route', async () => {
      const router = new Router();
  
      router.patch('/', async (ctx) => {
        ctx.body = 'test';
        ctx.status = 200;
      });
  
      const response = await router.resolve({
        request: {
          url: 'http://localhost:3000/',
          method: constants.methods.PATCH,
        },
      });
  
      const body = await responseUtils.getBodyText(response.body);
  
      expect(body).to.equal('test');
    });  
  });

  describe('router.del', () => {
    it('should route a DEL request to a test route', async () => {
      const router = new Router();
  
      router.del('/', async (ctx) => {
        ctx.body = 'test';
        ctx.status = 200;
      });
  
      const response = await router.resolve({
        request: {
          url: 'http://localhost:3000/',
          method: constants.methods.DEL,
        },
      });
  
      const body = await responseUtils.getBodyText(response.body);
  
      expect(body).to.equal('test');
    });  
  });

  describe('router.use', () => {
    it('should route all requests to a middleware', async () => {
      const router = new Router();

      router.use(async (ctx, next) => {
        ctx.set('foo', 'bar');
        next(ctx);
      });      
  
      router.get('/', async (ctx) => {
        ctx.body = 'test';
        ctx.status = 200;
      });
  
      const response = await router.resolve({
        request: {
          url: 'http://localhost:3000/',
          method: constants.methods.HEAD,
        },
      });
  
      const body = await responseUtils.getBodyText(response.body);
  
      // The body is removed in cloudflare and the correct content-length headers set.
      expect(body).to.equal('test');
    });
  });

  describe('options requests', () => {
    it.skip('should by default respond to OPTIONS requests when a matching GET route is found', async () => {
      const router = new Router();
  
      router.get('/', async (ctx) => {});
  
      const response = await router.resolve({
        request: {
          url: 'http://localhost:3000/',
          method: constants.methods.OPTIONS,
        },
      });
    
      expect(response.headers.get('allow')).to.equal('OPTIONS, GET');
    });
  });

  describe('router path matching', () => {
    it('should match on multiple params combined with static paths', async () => {
      const router = new Router();
      router.get('/foo/:foo/bar/:bar/test', async (ctx) => {
        ctx.body = ctx.params.foo + ctx.params.bar;
        ctx.status = 200;
      });
  
      const response = await router.resolve({
        request: {
          url: 'http://localhost:3000/foo/foo/bar/bar/test',
          method: constants.methods.GET,
        },
      });
  
      const body = await responseUtils.getBodyText(response.body);
  
      expect(body).to.equal('foobar');
    });

    it('should pass on the part of the path to wildcard param', async () => {
      const router = new Router();
      router.get('/some/:file*', async (ctx) => {
        ctx.body = ctx.params.file;
        ctx.status = 200;
      });
  
      const response = await router.resolve({
        request: {
          url: 'http://localhost:3000/some/deep/path',
          method: constants.methods.GET,
        },
      });
  
      const body = await responseUtils.getBodyText(response.body);
  
      expect(body).to.equal('deep/path');
    });

    it('should pass on the complete path to wildcard param', async () => {
      const router = new Router();
  
      router.get('/:file*', async (ctx) => {
        ctx.body = ctx.params.file;
        ctx.status = 200;
      });
  
      const response = await router.resolve({
        request: {
          url: 'http://localhost:3000/some/deep/path',
          method: constants.methods.GET,
        },
      });
  
      const body = await responseUtils.getBodyText(response.body);
  
      expect(body).to.equal('some/deep/path');
    });
  });


  describe('router host matching', () => {
    it('should match on multiple hosts', async () => {
      const router = new Router();
      router.add({
          host: '(foo|bar).example.com'
        },
        async (ctx) => {
          ctx.body = 'test';
          ctx.status = 200;
        }
      );
  
      const fooResponse = await router.resolve({
        request: {
          url: 'http://foo.example.com/dummy',
          method: constants.methods.GET,
        },
      });
      const barResponse = await router.resolve({
        request: {
          url: 'http://bar.example.com/dummy',
          method: constants.methods.GET,
        },
      });
  
      const fooBody = await responseUtils.getBodyText(fooResponse.body);
      const barBody = await responseUtils.getBodyText(barResponse.body);
  
      expect(fooBody).to.equal('test');
      expect(barBody).to.equal('test');
    });  

    it('should pass a parameter from the host', async () => {
      const router = new Router();
      router.add({
          host: ':sub.example.com'
        },
        async (ctx) => {
          ctx.body = ctx.params.sub;
          ctx.status = 200;
        }
      );
  
      const response = await router.resolve({
        request: {
          url: 'http://test.example.com/dummy',
          method: constants.methods.GET,
        },
      });
  
      const body = await responseUtils.getBodyText(response.body);
  
      expect(body).to.equal('test');
    });
  });

  describe('Rule order', () => {
    it('should route fallback to the second route if the first does not match', async () => {
      const router = new Router();

      router.get('/foo', async (ctx, next) => {
        ctx.body = 'foo';
        ctx.status = 200;
      });

      router.get('/bar', async (ctx) => {        
        ctx.body = 'bar';
        ctx.status = 200;
      });

      const response = await router.resolve({
        request: {
          url: 'http://test.example.com/bar',
          method: constants.methods.GET,
        },
      });

      const body = await responseUtils.getBodyText(response.body);

      expect(body).to.equal('bar');    
    });

    it('should fall through the first path if it calls next', async () => {
      const router = new Router();

      router.get('/.*', async (ctx, next) => {
        ctx.set('foo', 'bar');
        
        await next(ctx);
      });

      router.get('/hello', async (ctx) => {        
        ctx.body = 'test';
        ctx.status = 200;
      });

      const request = new Request('http://test.example.com/hello');

      const response = await router.resolve({request});

      const body = await responseUtils.getBodyText(response.body);
      
      expect(body).to.equal('test');
      expect(response.headers.get('foo')).to.equal('bar');
    });
  });  
});