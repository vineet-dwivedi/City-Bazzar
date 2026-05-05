// Route errors flow through here so handlers can stay small.
import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ApiError } from "../utils/api-error.js";

export const notFoundHandler = (_request: Request, response: Response) => {
  response.status(404).json({
    message: "Route not found"
  });
};

export const errorHandler = (
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    response.status(400).json({
      message: error.code === "LIMIT_FILE_SIZE"
        ? "Uploaded image is too large."
        : error.message
    });
    return;
  }

  if (error instanceof ApiError) {
    response.status(error.statusCode).json({
      message: error.message
    });
    return;
  }

  response.status(500).json({
    message: error.message || "Unexpected server error"
  });
};
