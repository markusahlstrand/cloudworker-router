const parser = require('./parser');

module.exports = class Context {
    constructor(event) {
        this.request = parser.parseRequest(event.request);
        this.event = event;
        this.state = {};
        this.response = {
            headers: new Map(),
        };
        this.body = '';
        this.status = 404;
    }

    /**
     * Gets a header from the request
     * @param {string} key 
     */
    header(key) {
        return this.request.headers.get(key);
    }
    
    set(key, value) {
        this.response.headers.set(key, value);
    }
}