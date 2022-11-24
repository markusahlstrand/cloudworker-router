import { Context } from './Context';
import { Next } from './Next';

export type Handler<Env> = (ctx: Context<Env>, next: Next) => Promise<Response | undefined>;
