// Pick the active data store once so the rest of the app stays store-agnostic.
import { MemoryDataStore } from "../data/memory-store.js";
import { MongoDataStore } from "../data/mongo-store.js";
import { DataStore } from "../data/store.types.js";

const mode = process.env.DATA_STORE_MODE === "mongo" ? "mongo" : "memory";

export const dataStore: DataStore =
  mode === "mongo" ? new MongoDataStore() : new MemoryDataStore();

export const initializeDataStore = async () => {
  await dataStore.initialize();
};
