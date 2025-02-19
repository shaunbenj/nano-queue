import http from "node:http";
import { errorResponse } from "./response_util.js";

const MAX_BODY_LENGTH = 4000;

// Reusable framework for a server.
export default class BaseServer {
  constructor(server = http.createServer()) {
    this.routes = {};
    this.middlewares = [];
    this.server = server;
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
    const [pathname, queryParams] = this.parseRequest(req);

    // Collect the body
    const body = await this.collectBody(req);
    req.parsedBody = body;

    // Check if this route has been registered.
    if (this.routes[pathname] && this.routes[pathname][req.method]) {
      console.log(`Start processing ${pathname} ${req.method}`);

      try {
        // Run each middleware in order.
        await this.run_middlewares(req, res);

        // Process the request.
        await this.routes[pathname][req.method](req, res, queryParams);
      } catch (error) {
        errorResponse(res, `${error.name} ${error.message}`);
      }

      console.log(`Done processing ${pathname} ${req.method}`);
    } else {
      console.log(`No route defined for ${pathname} ${req.method}`);

      errorResponse(res, `No route defined for ${pathname} ${req.method}`, 404);
    }
  }

  async run_middlewares(req, res, i = 0) {
    if (this.middlewares.length == i) {
      return;
    }

    await this.middlewares[i](req, res, () => {
      this.run_middlewares[i + 1];
    });
  }

  parseRequest(req) {
    const parsedUrl = new URL(
      `http://${process.env.HOST ?? "localhost"}${req.url}`
    );
    const pathname = parsedUrl.pathname;
    const queryParams = Object.fromEntries(parsedUrl.searchParams);
    return [pathname, queryParams];
  }

  collectBody(req) {
    let body = "";

    return new Promise((resolve, reject) => {
      req.on("data", (chunk) => {
        body += chunk;

        if (this.byteLength > MAX_BODY_LENGTH) {
          reject("Body too large");
        }
      });

      req.on("end", () => {
        if (req.headers["content-type"] == "application/json") {
          resolve(JSON.parse(body));
        } else {
          resolve(body);
        }
      });

      req.on("error", reject);
    });
  }

  byteLength(str, encoding = "utf8") {
    return Buffer.byteLength(str, encoding);
  }
}
