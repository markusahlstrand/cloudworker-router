function parseRoute({
  host = '.*',
  path = '.*',
  method = ['.*'],
  handler,
  handlerName,
  headers = {},
  data,
}) {
  const hostVariables = [];
  const pathVariables = [];

  const hostRegexpString = host
    // Replace any variables in the host
    .replace(/(:([^.]+))/g, ($1, $2, $3) => {
      hostVariables.push($3);
      return '([^.]+)';
    });

  // Then parse the variables in the path
  const pathRegexpString = path.replace(/(:([^/]+))/g, ($1, $2, $3) => {
    // Check for wildcard parameters
    if ($3.slice(-1) === '*') {
      pathVariables.push($3.slice(0, $3.length - 1));
      return '(.*)';
    }

    pathVariables.push($3);
    return '([^/]*)';
  });

  const hostRegex = new RegExp(`^${hostRegexpString}$`, 'i');
  const pathRegex = new RegExp(`^${pathRegexpString}$`, 'i');
  const methodRegex = new RegExp(`^${method.join('|')}$`, 'i');

  return {
    hostVariables,
    pathVariables,
    host: hostRegex,
    path: pathRegex,
    method: methodRegex,
    handler,
    handlerName,
    headers,
    data,
  };
}

function instanceToJson(instance) {
  return [...instance].reduce((obj, item) => {
    const prop = {};
    // eslint-disable-next-line prefer-destructuring
    prop[item[0]] = item[1];
    return { ...obj, ...prop };
  }, {});
}

function parseRequest(request) {
  const url = new URL(request.url);

  const query = instanceToJson(url.searchParams);
  const headers = instanceToJson(request.headers);

  if (headers.host) {
    url.hostname = headers.host;
  }

  return {
    headers,
    href: url.href,
    host: url.host,
    hostname: url.hostname,
    method: request.method,
    origin: `${url.protocol}//${url.host}`,
    path: url.pathname,
    protocol: url.protocol.slice(0, -1), // Remove the semicolon at the end
    query,
    querystring: url.search.slice(1),
    search: url.search,
  };
}
module.exports = {
  parseRoute,
  parseRequest,
};
