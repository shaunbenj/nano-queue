import addMiddlewares from "./middlewares.js";
import addRoutes from "./routes.js";
import BaseServer from "../../../lib/base_server.js";
import "dotenv/config";

const server = new BaseServer();

addRoutes(server);
addMiddlewares(server);

server.listen(process.env.MEM_DB_PORT, () => {
  console.log(
    `Memory database service listening on ${process.env.MEM_DB_PORT}`
  );
});
