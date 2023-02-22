import { Context } from './Context';
import { Next } from './Next';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Handler<Env> = (ctx: Context<Env>, next: Next) => Promise<Response | undefined>;
