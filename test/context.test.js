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
});