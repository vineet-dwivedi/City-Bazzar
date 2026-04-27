import { NextFunction, Request, Response } from "express";

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
  response.status(500).json({
    message: error.message || "Unexpected server error"
  });
};
