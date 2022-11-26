import { Context, Next } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContextWithBody<Env = any> = Context<Env> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  files?: any;
};

export async function bodyparser(ctx: ContextWithBody, next: Next) {
  const contentype = ctx.headers.get('content-type');

  if (contentype?.startsWith('application/json')) {
    ctx.body = await ctx.request.json();
  }

  return next();
}
