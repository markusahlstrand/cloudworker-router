import { Params } from './Params';

export type Context<Env> = {
  request: Request;
  params: Params;
  query: URLSearchParams;
  hostname: string;
  host: string;
  ip: string | null;
  // For convinience
  headers: Headers;
  // To keep state for the current request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: { [key: string]: any };
  env: Env;
  event: ExecutionContext;
};
