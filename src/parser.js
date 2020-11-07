function parseRoute({
  host = '.*',
  path = '.*',
  excludePath = null,
  method = ['.*'],
  handler,
  protocol = '.*',
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
  const excludePathRegex = excludePath ? new RegExp(`^${excludePath}$`, 'i') : null;
  const methodRegex = new RegExp(`^${method.join('|')}$`, 'i');
  const protocolRegex = new RegExp(`^${protocol}$`, 'i');

  return {
    hostVariables,
    pathVariables,
    host: hostRegex,
    path: pathRegex,
    excludePath: excludePathRegex,
    method: methodRegex,
    protocol: protocolRegex,
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

async function streamToString(readable, maxSize = 1024 * 1024) {
  const results = [];
  const reader = readable.getReader();
  // eslint-disable-next-line no-undef
  const textDecoder = new TextDecoder();
  let bytesCount = 0;

  while (maxSize && bytesCount < maxSize) {
    // eslint-disable-next-line no-await-in-loop
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    bytesCount += value.byteLength;
    results.push(textDecoder.decode(value));
  }

  const result = results.join('');
  if (maxSize) {
    return result.substring(0, maxSize);
  }
  return result;
}

function parseRequest(request) {
  const url = new URL(request.url);

  const query = instanceToJson(url.searchParams);
  const headers = instanceToJson(request.headers);

  if (headers.host) {
    url.hostname = headers.host;
  }

  let bodyText;
  let requestedBodyLength;

  async function getBodyText(maxSize) {
    if (requestedBodyLength >= maxSize) {
      return bodyText.substring(0, maxSize);
    }

    const clonedRequest = request.clone();
    bodyText = await streamToString(clonedRequest.body, maxSize);

    return bodyText;
  }

  return {
    body: request.body,
    headers,
    host: url.host,
    hostname: url.hostname,
    href: url.href,
    json: async (maxSize) => JSON.parse(getBodyText(maxSize)),
    method: request.method,
    origin: `${url.protocol}//${url.host}`,
    path: url.pathname,
    protocol: url.protocol.slice(0, -1), // Remove the semicolon at the end
    query,
    querystring: url.search.slice(1),
    search: url.search,
    text: async (maxSize) => {
      if (request.headers.get('content-type') === 'application/x-www-form-urlencoded') {
        return decodeURIComponent(await getBodyText(maxSize));
      }
      return getBodyText(maxSize);
    },
  };
}
module.exports = {
  parseRoute,
  parseRequest,
};
