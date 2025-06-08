import queueAPI from "./queue_api.js";

// Adds routes to a BaseServer instance.
// NOTE: Wrap callbacks in arrow functions to preserve this
export default function addRoutes(server) {
  server.add_route("POST", "/create", async (req, res, params) => {
    queueAPI.createQueue(req, res, params);
  });

  server.add_route("POST", "/pushItem", async (req, res, params) => {
    queueAPI.pushItem(req, res, params);
  });

  server.add_route("POST", "/popItem", async (req, res, params) => {
    queueAPI.popItem(req, res, params);
  });

  server.add_route("POST", "/deleteItem", async (req, res, params) => {
    queueAPI.deleteItem(req, res, params);
  });
}
