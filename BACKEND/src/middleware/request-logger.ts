import { randomUUID } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import { log } from "../utils/logger.js";

export interface RequestWithId extends Request {
  requestId?: string;
}

// Each request gets a small trace id and one completion log line.
export const requestLogger = (request: RequestWithId, response: Response, next: NextFunction) => {
  const startedAt = Date.now();
  const requestId = request.header("x-request-id") || randomUUID();

  request.requestId = requestId;
  response.setHeader("x-request-id", requestId);

  response.on("finish", () => {
    log("info", "request.completed", {
      requestId,
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs: Date.now() - startedAt,
      ip: request.ip
    });
  });

  next();
};
