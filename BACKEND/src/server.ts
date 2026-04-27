// Boot the app after the selected data store is ready.
import "dotenv/config";
import { app } from "./app.js";
import { APP_LABEL } from "./config.js";
import { dataStore, initializeDataStore } from "./services/store.js";

const port = Number(process.env.PORT ?? 4000);

await initializeDataStore();

app.listen(port, () => {
  console.log(`${APP_LABEL} backend listening on port ${port} using ${dataStore.mode} store`);
});
