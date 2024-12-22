import addMiddlewares from "./middlewares.js";
import addRoutes from "./routes.js";
import BaseServer from "../../../lib/base_server.js";

const server = new BaseServer();

addRoutes(server);
addMiddlewares(server);

server.listen(3001, () => {
  console.log("Memory database service listening on 3001");
});
