export type RouteCallback = (
  response: Response | undefined,
  error: Error | null,
) => Promise<Response>;
