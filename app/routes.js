import cacheAPI from "./api/cache.js";

// Adds routes to a BaseServer instance.
// NOTE: Wrap callbacks in arrow functions to preserve this
export default function addRoutes(server) {
  // Cache API routes.
  server.add_route("GET", "/api/get", (req, res, params) => {
    cacheAPI.getKey(req, res, params);
  });
  server.add_route("POST", "/api/set", (req, res, params) => {
    cacheAPI.setKey(req, res, params);
  });
}
