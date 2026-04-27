// Central Express app setup. Each route group stays focused on one feature area.
import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth.routes.js";
import { catalogRouter } from "./routes/catalog.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { onboardingRouter } from "./routes/onboarding.routes.js";
import { ownerRouter } from "./routes/owner.routes.js";
import { pickupRouter } from "./routes/pickup.routes.js";
import { searchRouter } from "./routes/search.routes.js";
import { shopRouter } from "./routes/shops.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { APP_LABEL } from "./config.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_request, response) => {
  // Keep the root response tiny so local testing is easy.
  response.json({
    name: `${APP_LABEL} API`,
    version: "0.1.0",
    endpoints: [
      "/api/health",
      "/api/auth",
      "/api/owner",
      "/api/owner/analytics",
      "/api/shops",
      "/api/pickup-intents",
      "/api/catalog",
      "/api/catalog/search",
      "/api/search/products",
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
app.use("/api/onboarding", onboardingRouter);

app.use(notFoundHandler);
app.use(errorHandler);
