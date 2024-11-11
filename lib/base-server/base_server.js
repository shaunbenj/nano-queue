const http = require("node:http");

class BaseServer {
  constructor() {
    this.routes = {};
    this.middlewares = [];
    this.server = http.createServer();
    this.server.on("request", (req, res) => {
      this.#handleRequest(req, res);
    });
  }

  listen(port, callback) {
    this.server.listen(port, callback);
  }

  add_route(method, pathname, callback) {
    this.routes[pathname] ||= {};
    this.routes[pathname][method] = callback;
  }

  add_middleware(callback) {
    this.middlewares.push(callback);
  }

  async #handleRequest(req, res) {
    // Parse the URL for the pathname and query params.
    const parsedUrl = new URL(
      `http://${process.env.HOST ?? "localhost"}${req.url}`
    );
    const pathname = parsedUrl.pathname;
    const queryParams = Object.fromEntries(parsedUrl.searchParams);

    // Check if this route has been registered.
    if (this.routes[pathname] && this.routes[pathname][req.method]) {
      // Run each middleware in order.
      await this.run_middlewares(req, res);

      // Process the request.
      await this.routes[pathname][req.method](req, res, queryParams);

      console.log("Done handling request");
    } else {
      console.log(`No route defined for ${pathname} ${req.method}`);
      res.writeHead(404);
    }
  }

  async run_middlewares(req, res, i = 0) {
    if (this.middlewares.size == i) {
      return;
    }

    await this.middlewares[i](req, res, () => {
      this.run_middlewares[i + 1];
    });
  }
}

module.exports = BaseServer;
