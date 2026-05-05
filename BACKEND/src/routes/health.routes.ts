// Simple health check for local dev and deployment probes.
import { Router } from "express";
import { APP_NAME } from "../config.js";
import { getStoreStatus } from "../services/store.js";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.json({
    ok: true,
    service: `${APP_NAME}-backend`,
    timestamp: new Date().toISOString()
  });
});

healthRouter.get("/ready", (_request, response) => {
  const store = getStoreStatus();
  const ready = store.initialized;

  response.status(ready ? 200 : 503).json({
    ok: ready,
    service: `${APP_NAME}-backend`,
    store,
    timestamp: new Date().toISOString()
  });
});
