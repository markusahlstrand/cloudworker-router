function getParams(req, route) {
  const params = {};

  const hostParamsMatch = route.host.exec(req.host);
  route.hostVariables.forEach((name, index) => {
    params[name] = hostParamsMatch[index + 1];
  });

  const pathParamsMatch = route.path.exec(req.path);
  route.pathVariables.forEach((name, index) => {
    params[name] = pathParamsMatch[index + 1];
  });

  return params;
}

/**
 * Checks if the route is valid for a request
 * @param {route} route
 * @param {*} request
 */
function testPath(route, request) {
  // Check the method and path
  return (
    route.method.test(request.method)
    && route.host.test(request.host)
    && route.path.test(request.path)
  );
}

async function recurseRoutes(ctx, routes) {
  const [route, ...nextRoutes] = routes;
  if (!route) {
    // eslint-disable-next-line
    return new Response("NOT_FOUND", {
      status: 404,
    });
  }

  if (!testPath(route, ctx.request)) {
    return recurseRoutes(ctx, nextRoutes);
  }

  ctx.params = getParams(ctx.request, route);

  try {
    return route.handler(ctx, async result => recurseRoutes(result, nextRoutes));
  } catch (err) {
    err.route = route.handler.name;
    throw err;
  }
}

module.exports = {
  recurseRoutes,
};
