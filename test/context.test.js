const { expect } = require('chai');

const Context = require('../src/context');

describe('context', () => {
  describe('headers', () => {
    it('should get a header from the request', () => {
      const request = new Request('http://example.com', {
        headers: {
          'X-FOO': 'bar',
        },
      });

      const ctx = new Context({ request });

      expect(ctx.header('x-foo')).to.equal('bar');
    });
  });

  describe('querystring', () => {
    it('should add the querystring parameters to the query property', () => {
      const request = new Request('http://example.com?foo=bar');

      const ctx = new Context({ request });

      expect(ctx.query.foo).to.equal('bar');
    });
  });

  describe('request', () => {
    it('should add the full url to the request object as href', () => {
      const request = new Request('http://example.com?foo=bar');

      const ctx = new Context({ request });

      // Note: it adds a trailing slash to the url..
      expect(ctx.request.href).to.equal('http://example.com/?foo=bar');
    });

    it('should add the protocol to the request object', () => {
      const request = new Request('http://example.com?foo=bar');

      const ctx = new Context({ request });

      // Note: it adds a trailing slash to the url..
      expect(ctx.request.protocol).to.equal('http');
    });

    it('should add the host to the request object', () => {
      const request = new Request('http://example.com:3000?foo=bar');

      const ctx = new Context({ request });

      // Note: it adds a trailing slash to the url..
      expect(ctx.request.host).to.equal('example.com:3000');
    });

    it('should add the hostname to the request object', () => {
      const request = new Request('http://example.com:3000?foo=bar');

      const ctx = new Context({ request });

      // Note: it adds a trailing slash to the url..
      expect(ctx.request.hostname).to.equal('example.com');
    });

    it('should add the origin to the request object', () => {
      const request = new Request('http://example.com:3000?foo=bar');

      const ctx = new Context({ request });

      // Note: it adds a trailing slash to the url..
      expect(ctx.request.origin).to.equal('http://example.com:3000');
    });

    it('should add the querystring to the request object', () => {
      const request = new Request('http://example.com:3000?foo=bar');

      const ctx = new Context({ request });

      // Note: it adds a trailing slash to the url..
      expect(ctx.request.querystring).to.equal('foo=bar');
    });
  });
});
