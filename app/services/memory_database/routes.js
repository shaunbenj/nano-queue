import memoryDataBaseApi from "./api.js";

// Adds routes to a BaseServer instance.
// NOTE: Wrap callbacks in arrow functions to preserve this
export default function addRoutes(server) {
  // Memory database API routes.
  server.add_route("GET", "/api/get", (req, res, params) => {
    memoryDataBaseApi.getKey(req, res, params);
  });
  server.add_route("POST", "/api/set", (req, res, params) => {
    memoryDataBaseApi.setKey(req, res, params);
  });
}
