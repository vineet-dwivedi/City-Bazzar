// Boot the app after the selected data store is ready.
import "dotenv/config";
import { app } from "./app.js";
import { APP_LABEL } from "./config.js";
import { env, validateEnv } from "./env.js";
import { dataStore, initializeDataStore } from "./services/store.js";
import { log } from "./utils/logger.js";

validateEnv();

process.on("unhandledRejection", (error) => {
  log("error", "process.unhandled_rejection", { error });
});

process.on("uncaughtException", (error) => {
  log("error", "process.uncaught_exception", { error });
});

await initializeDataStore();

app.listen(env.port, () => {
  log("info", "server.started", {
    app: APP_LABEL,
    port: env.port,
    dataStore: dataStore.mode,
    aiProvider: env.aiProvider,
    storageProvider: env.fileStorageProvider
  });
});
