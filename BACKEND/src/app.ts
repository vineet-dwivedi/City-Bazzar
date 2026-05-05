// Central Express app setup. Each route group stays focused on one feature area.
import cors from "cors";
import express from "express";
import { env } from "./env.js";
import { authRouter } from "./routes/auth.routes.js";
import { catalogRouter } from "./routes/catalog.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { onboardingRouter } from "./routes/onboarding.routes.js";
import { ownerRouter } from "./routes/owner.routes.js";
import { pickupRouter } from "./routes/pickup.routes.js";
import { searchRouter } from "./routes/search.routes.js";
import { shopRouter } from "./routes/shops.routes.js";
import { uploadRouter } from "./routes/upload.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { securityHeaders } from "./middleware/security.middleware.js";
import { APP_LABEL } from "./config.js";
import { uploadService } from "./services/upload.service.js";

export const app = express();

app.disable("x-powered-by");

if (env.trustProxy) {
  app.set("trust proxy", 1);
}

app.use(securityHeaders);
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes("*") || env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  }
}));
app.use(express.json({ limit: `${env.requestBodyLimitMb}mb` }));
app.use(express.urlencoded({ extended: true, limit: `${env.requestBodyLimitMb}mb` }));
app.use("/uploads", express.static(uploadService.getUploadDir()));

app.get("/", (_request, response) => {
  // Keep the root response tiny so local testing is easy.
  response.json({
    name: `${APP_LABEL} API`,
    version: "0.1.0",
    endpoints: [
      "/api/health",
      "/api/health/ready",
      "/api/auth",
      "/api/owner",
      "/api/owner/analytics",
      "/api/shops",
      "/api/pickup-intents",
      "/api/catalog",
      "/api/catalog/search",
      "/api/search/products",
      "/api/uploads/product-image",
      "/api/onboarding/analyze",
      "/api/onboarding/confirm"
    ]
  });
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/shops", shopRouter);
app.use("/api/pickup-intents", pickupRouter);
app.use("/api/catalog", catalogRouter);
app.use("/api/search", searchRouter);
app.use("/api/uploads", uploadRouter);
app.use("/api/onboarding", onboardingRouter);

app.use(notFoundHandler);
app.use(errorHandler);
