// Simulates a 1s processing delay
async function simulate_delay(req, res, next) {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 10);
  });

  next();
}

// Adds middlewares to a BaseServer instance
export default function addMiddlewares(server) {
  server.add_middleware(simulate_delay);
}
