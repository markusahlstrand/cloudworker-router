import { Params } from './Params';

export type Context = {
  request: Request;
  params: Params;
  query: URLSearchParams;
  // For convinience
  headers: Headers;
  // To keep state for the current request
  state: { [key: string]: any };
  // The raw event
  event: FetchEvent;
};
