import "dotenv/config";
import { app } from "./app.js";
import { authStore } from "./services/auth-store.js";
import { dataStore, initializeDataStore } from "./services/store.js";

const port = Number(process.env.PORT ?? 4000);

await initializeDataStore();
await authStore.initialize();

app.listen(port, () => {
  console.log(`City Bazaar backend listening on port ${port} using ${dataStore.mode} store`);
});
