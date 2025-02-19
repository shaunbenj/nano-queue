import axios from "axios";

export default class DatabaseClient {
  constructor(url = process.env.MEM_DB_URL, port = process.env.MEM_DB_PORT) {
    this.apiClient = axios.create({
      baseURL: `${url}:${port}`,
      timeout: 1000, // 1s timeout
    });
  }

  async execute(script) {
    try {
      const response = await this.apiClient.post("/api/execute", script);

      return response.data;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }
}
