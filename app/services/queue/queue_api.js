import { errorResponse, jsonResponse } from "../../../lib/response_util.js";
import QueueService from "./queue_service.js";

class QueueApi {
  constructor(queueService = new QueueService()) {
    this.queueService = queueService;
  }

  async createQueue(req, res, params) {
    const queueName = req.parsedBody.queueName;

    try {
      await this.queueService.createQueue(queueName);

      jsonResponse(res, { data: `Successfully created queue ${queueName}` });
    } catch (error) {
      errorResponse(res, error.message);
    }
  }

  async pushItem(req, res, params) {
    const queueName = req.parsedBody.queueName;
    const payload = req.parsedBody.payload;

    try {
      const id = await this.queueService.pushItem(queueName, payload);

      jsonResponse(res, { id: `${id}` });
    } catch (error) {
      errorResponse(res, error.message);
    }
  }

  async popItem(req, res, params) {
    const queueName = req.parsedBody.queueName;

    try {
      const item = await this.queueService.popItem(queueName);

      jsonResponse(res, { item: item });
    } catch (error) {
      errorResponse(res, error.message);
    }
  }

  async deleteItem(req, res, params) {
    const queueName = req.parsedBody.queueName;
    const id = req.parsedBody.id;

    try {
      const data = await this.queueService.deleteItem(queueName, id);

      jsonResponse(res, { data: data });
    } catch (error) {
      errorResponse(res, error.message);
    }
  }
}

const queueAPI = new QueueApi();
export default queueAPI;
