import { Params } from 'tiny-request-router';

export type Context = {
  request: Request;
  params: Params;
  query: URLSearchParams;
  // To keep executing after the response was returned
  waitUntil: (promise: Promise<any>) => void;
  // For convinience
  headers: Headers;
  // To keep state for the current request
  state: { [key: string]: object };
};
