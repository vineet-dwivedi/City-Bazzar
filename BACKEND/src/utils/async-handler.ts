// Wrap async Express handlers so thrown errors reach the error middleware.
import { NextFunction, Request, RequestHandler, Response } from "express";

export const asyncHandler = (
  handler: (request: Request, response: Response, next: NextFunction) => Promise<void>
): RequestHandler => {
  return (request, response, next) => {
    void handler(request, response, next).catch(next);
  };
};
