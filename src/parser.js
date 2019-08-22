function parseRoute({ host = '.*', path = '.*', method = ['.*'], handler, data }) {
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
    data,
  };
}

/**
 * Convert a map to json object
 * @param {*} map
 */
function mapToObject(map) {
  const obj = {};
  map.forEach((value, key) => {
    obj[key] = value;
  });

  return obj;
}

function parseRequest(request) {
  const url = new URL(request.url);

  const headers = mapToObject(request.headers);
  const query = mapToObject(url.searchParams);

  return {
    headers,
    href: request.url,
    host: url.host,
    hostname: url.hostname,
    method: request.method,
    origin: `${url.protocol}//${url.host}`,
    path: url.pathname,
    protocol: url.protocol.slice(0, -1), // Remove the semicolon at the end
    query,
  };
}
module.exports = {
  parseRoute,
  parseRequest,
};
