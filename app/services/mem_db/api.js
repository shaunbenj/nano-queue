import MemDB from "./mem_db.js";
import { errorResponse, jsonResponse } from "../../../lib/response_util.js";

class MemDBApi {
  constructor(database = new MemDB()) {
    this.db = database;
  }

  getKey(req, res, params) {
    const val = this.db.get(params["key"]);

    jsonResponse(res, { data: val });
  }

  setKey(req, res, params) {
    if (params.hasOwnProperty("key") && params.hasOwnProperty("value")) {
      this.db.set(params["key"], params["value"]);

      jsonResponse(res, { data: `Set ${params["key"]} to ${params["value"]}` });
    } else {
      errorResponse(res, `Missing required params key & value`);
    }
  }
}

const memDBApi = new MemDBApi();
export default memDBApi;
