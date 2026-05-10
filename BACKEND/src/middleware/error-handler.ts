// Route errors flow through here so handlers can stay small.
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { RequestWithId } from "./request-logger.js";
import { ApiError } from "../utils/api-error.js";
import { log } from "../utils/logger.js";

export const notFoundHandler = (_request: Request, response: Response) => {
  response.status(404).json({
    message: "Route not found"
  });
};

export const errorHandler = (
  error: Error,
  request: Request,
  response: Response,
  _next: NextFunction
) => {
  const requestWithId = request as RequestWithId;

  if (error instanceof multer.MulterError) {
    log("warn", "request.multer_error", {
      requestId: requestWithId.requestId,
      code: error.code,
      message: error.message,
      path: request.originalUrl
    });
    response.status(400).json({
      message: error.code === "LIMIT_FILE_SIZE"
        ? "Uploaded image is too large."
        : error.message,
      requestId: requestWithId.requestId
    });
    return;
  }

  if (error instanceof ApiError) {
    log("warn", "request.api_error", {
      requestId: requestWithId.requestId,
      statusCode: error.statusCode,
      message: error.message,
      path: request.originalUrl
    });
    response.status(error.statusCode).json({
      message: error.message,
      requestId: requestWithId.requestId
    });
    return;
  }

  log("error", "request.unexpected_error", {
    requestId: requestWithId.requestId,
    path: request.originalUrl,
    error
  });
  response.status(500).json({
    message: error.message || "Unexpected server error",
    requestId: requestWithId.requestId
  });
};
