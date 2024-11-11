const { queryObjects } = require("v8");
const BaseServer = require("../lib/base-server/base_server");
const MemoryDatabase = require("../db/memory_database");
const json_stringify = require("../lib/json_util");
const { json } = require("stream/consumers");

class NanoCache extends BaseServer {
  constructor() {
    super();
    this.db = new MemoryDatabase();
    this.add_routes();
    this.add_middlewares();
  }

  add_routes() {
    // Get key
    this.add_route("GET", "/get", (req, res, queryParams) => {
      const val = this.db.get(queryParams["key"]);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(json_stringify({ data: val }));
    });

    // Set key val
    this.add_route("POST", "/set", (req, res, queryParams) => {
      this.db.set(queryParams["key"], queryParams["value"]);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        json_stringify({
          data: `Set ${queryParams["key"]} successfully`,
        })
      );
    });
  }

  add_middlewares() {
    this.add_middleware(async (req, res, next) => {
      await new Promise((resolve) => {
        setTimeout(() => {
          console.log(`Processing ${req.url}`);
          resolve();
        }, 1000);
      });

      next();
    });
  }
}

const my_cache = new NanoCache();

my_cache.listen(3001, () => {
  console.log("Listening on 3001");
});
