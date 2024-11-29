import BaseServer from "../../../lib/base_server.js";

const server = new BaseServer();

server.listen(3010, () => {
  console.log("Queue service listening on 3010");
});
