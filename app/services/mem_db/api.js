import { errorResponse, jsonResponse } from "../../../lib/response_util.js";
import ScriptExecutor from "./script_executor.js";

class MemDBApi {
  constructor(executor = new ScriptExecutor()) {
    this.executor = executor;
  }

  async executeScript(req, res, params) {
    const script = req.parsedBody;

    try {
      const result = await this.executor.execute(script);

      jsonResponse(res, { data: result });
    } catch (error) {
      errorResponse(res, error.message);
    }
  }
}

const memDBApi = new MemDBApi();
export default memDBApi;
