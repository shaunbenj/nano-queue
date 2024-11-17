import json_stringify from "./json_util.js";

// Respond with an error message and default code of 500
export function errorResponse(res, message, code = 500) {
  res.setHeader("Connection", "close");
  res.statusCode = code;
  res.end(JSON.stringify(message));
}

// Respond with a JSON string
export function jsonResponse(res, data) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(json_stringify(data));
}
