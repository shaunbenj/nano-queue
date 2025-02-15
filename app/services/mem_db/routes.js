import memDBApi from "./api.js";

// Adds routes to a BaseServer instance.
// NOTE: Wrap callbacks in arrow functions to preserve this
export default function addRoutes(server) {
  // Memory database API routes.
  server.add_route("POST", "/api/execute", async (req, res, params) => {
    memDBApi.executeScript(req, res, params);
  });
}
