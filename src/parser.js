function parseRoute({
    host = '.*',
    path = '.*',
    method = ['.*'],
    handler,
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
        } else {
            pathVariables.push($3);
            return '([^/]*)';
        }
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

async function parseRequest(request) {
    const { url, headers = [], method } = request;

    const urlObj = new URL(url);

    const headersObj = [...headers].reduce((obj, item) => {
        const header = {};
        // eslint-disable-next-line prefer-destructuring
        header[item[0]] = item[1];
        return Object.assign({}, obj, header);
    }, {});

    return {
        headers: headersObj,
        host: urlObj.hostname,
        method,
        path: urlObj.pathname,
    }
}

module.exports = {
    parseRoute,
    parseRequest,
}