import addMiddlewares from "./middleware.js";
import addRoutes from "./routes.js";
import BaseServer from "../lib/base_server.js";

const cacheServer = new BaseServer();

addRoutes(cacheServer);
addMiddlewares(cacheServer);

cacheServer.listen(3001, () => {
  console.log("Listening on 3001");
});
