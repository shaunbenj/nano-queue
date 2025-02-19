import BaseServer from "../../../lib/base_server.js";
import "dotenv/config";
import addRoutes from "./routes.js";

const server = new BaseServer();

addRoutes(server);

server.listen(process.env.QUEUE_PORT, () => {
  console.log(`Queue service listening on ${process.env.QUEUE_PORT}`);
});
