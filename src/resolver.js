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

function testHeaders(route, request) {
  let result = true;

  Object.keys(route.headers).forEach((key) => {
    if (request.headers[key] !== route.headers[key]) {
      result = false;
    }
  });

  return result;
}

function testProtocol(route, request) {
  return route.protocol.test(request.protocol);
}

/**
 * Checks if the route is valid for a request
 * @param {route} route
 * @param {*} request
 */
function testPath(route, request) {
  // Check the method and path
  return (
    // Stupid prettier rules..
    // eslint-disable-next-line operator-linebreak
    route.method.test(request.method) &&
    // eslint-disable-next-line operator-linebreak
    route.host.test(request.host) &&
    // eslint-disable-next-line operator-linebreak
    route.path.test(request.path) &&
    // eslint-disable-next-line operator-linebreak
    testHeaders(route, request) &&
    // eslint-disable-next-line operator-linebreak
    testProtocol(route, request) &&
    (!route.excludePath || !route.excludePath.test(request.path))
  );
}

async function recurseRoutes(ctx, routes) {
  const [route, ...nextRoutes] = routes;
  if (!route) {
    // eslint-disable-next-line
    return new Response('NOT_FOUND', {
      status: 404,
    });
  }

  if (!testPath(route, ctx.request)) {
    return recurseRoutes(ctx, nextRoutes);
  }

  ctx.state.handlers = ctx.state.handlers || [];
  // Use the provided name and fall back to the name of the function
  ctx.state.handlers.push(route.handlerName || route.handler.name);
  ctx.params = getParams(ctx.request, route);

  try {
    return route.handler(ctx, async (result) => recurseRoutes(result, nextRoutes));
  } catch (err) {
    err.route = route.handler.name;
    throw err;
  }
}

module.exports = {
  recurseRoutes,
};
