import { Params } from './Params';

export type Context = {
  request: Request;
  params: Params;
  query: URLSearchParams;
  // For convinience
  headers: Headers;
  // To keep state for the current request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: { [key: string]: any };
  // The raw event
  event: FetchEvent;
};
