import http from "node:http";
import json_stringify from "./lib/json_util";

// Reusable framework for a server.
export default class BaseServer {
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
    const queryParams = this.parseQueryParams(req);

    // Check if this route has been registered.
    if (this.routes[pathname] && this.routes[pathname][req.method]) {
      try {
        // Run each middleware in order.
        await this.run_middlewares(req, res);

        // Process the request.
        await this.routes[pathname][req.method](req, res, queryParams);
      } catch (error) {
        this.handleError(res, `${error.name} ${error.message}`);
      }
      console.log("Done handling request");
    } else {
      console.log(`No route defined for ${pathname} ${req.method}`);
      this.handleError(
        res,
        `No route defined for ${pathname} ${req.method}`,
        404
      );
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

  handleError(res, message, code = 500) {
    res.setHeader("Connection", "close");
    res.statusCode = code;
    res.end(JSON.stringify(message));
  }

  parseQueryParams(req) {
    const parsedUrl = new URL(
      `http://${process.env.HOST ?? "localhost"}${req.url}`
    );
    const pathname = parsedUrl.pathname;
    return Object.fromEntries(parsedUrl.searchParams);
  }

  respond_json(res, data) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(json_stringify(data));
  }
}
