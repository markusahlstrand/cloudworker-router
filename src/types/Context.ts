import { Params } from 'tiny-request-router';

export type Context = {
  request: Request;
  params: Params;
  query: URLSearchParams;
};
