import { Context, Next } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContextWithBody<Env = any> = Context<Env> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  files?: any;
};

const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'];

export async function bodyparser(ctx: ContextWithBody, next: Next) {
  const contentype = ctx.headers.get('content-type');

  if (!METHODS_WITH_BODY.includes(ctx.request.method)) {
    return next();
  }

  try {
    if (contentype?.startsWith('application/json')) {
      ctx.body = await ctx.request.json();
    } else if (contentype?.startsWith('application/x-www-form-urlencoded')) {
      ctx.body = Object.fromEntries(await ctx.request.formData());
    } else if (contentype?.startsWith('text')) {
      ctx.body = await ctx.request.text();
    }
    return next();
  } catch (err) {
    return new Response('Invalid body format', {
      status: 400,
      headers: {
        'content-type': 'text/plain',
      },
    });
  }
}
