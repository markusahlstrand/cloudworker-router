const parser = require('./parser');

module.exports = class Context {
  constructor(event) {
    this.request = parser.parseRequest(event.request);
    this.event = event;
    this.state = {};
    this.cloned = false;
    this.response = {
      headers: {},
    };
    this.body = '';
    this.status = 404;

    // Shortcuts directly on the context
    this.query = this.request.query;
  }

  /**
   * Gets a header from the request
   * @param {string} key
   */
  header(key) {
    return this.request.headers[key];
  }

  /**
   * Set a header on the response
   * @param {string} key
   * @param {string} value
   */
  set(key, value) {
    this.response.headers[key] = value;
  }

  /**
   * Creates a cloned context
   */
  clone() {
    const clonedContext = new Context(this.event);
    clonedContext.request = parser.parseRequest(event.request.clone());
    clonedContext.cloned = true;

    return clonedContext;
  }
};
