import { Params } from './Params';

export type Context<Env = { [key: string]: string | DurableObjectNamespace | KVNamespace }> = {
  request: Request;
  params: Params;
  query: URLSearchParams;
  // For convinience
  headers: Headers;
  // To keep state for the current request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: { [key: string]: any };
  env: Env;
  event: ExecutionContext;
};
