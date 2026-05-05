// Boot the app after the selected data store is ready.
import "dotenv/config";
import { app } from "./app.js";
import { APP_LABEL } from "./config.js";
import { env, validateEnv } from "./env.js";
import { dataStore, initializeDataStore } from "./services/store.js";

validateEnv();

await initializeDataStore();

app.listen(env.port, () => {
  console.log(`${APP_LABEL} backend listening on port ${env.port} using ${dataStore.mode} store`);
});
