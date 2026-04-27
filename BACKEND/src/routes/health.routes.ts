// Simple health check for local dev and deployment probes.
import { Router } from "express";
import { APP_NAME } from "../config.js";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.json({
    ok: true,
    service: `${APP_NAME}-backend`,
    timestamp: new Date().toISOString()
  });
});
