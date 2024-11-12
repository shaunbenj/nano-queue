import MemoryDatabase from "./db/memory_database";

export default class Cache {
  constructor(server, database = new MemoryDatabase()) {
    this.db = database;
    this.server = server;
    this.add_middlewares();
  }

  get_key(req, res, queryParams) {
    const val = this.db.get(queryParams["key"]);
    this.server.respond_json(res, { data: val });
  }

  set_key(req, res, queryParams) {
    if (
      queryParams.hasOwnProperty("key") &&
      queryParams.hasOwnProperty("value")
    ) {
      this.server.respond_json(res, { data: `Set ${queryParams["key"]}` });
    } else {
      this.server.handleError(`Missing required params key & value`);
    }
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
