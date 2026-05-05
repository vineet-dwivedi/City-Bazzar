import { NextFunction, Request, Response } from "express";

// Small shared headers give safer defaults without extra framework weight.
export const securityHeaders = (request: Request, response: Response, next: NextFunction) => {
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Permissions-Policy", "camera=(), microphone=()");

  if (request.secure || request.header("x-forwarded-proto") === "https") {
    response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  next();
};
