// Simulates a 1s processing delay
async function simulate_delay(req, res, next) {
  console.log(`Sleep 1s`);

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });

  next();
}

// Adds middlewares to a BaseServer instance
export default function addMiddlewares(server) {
  server.add_middleware(simulate_delay);
}
