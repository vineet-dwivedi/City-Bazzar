// Pick the active data store once so the rest of the app stays store-agnostic.
import { MemoryDataStore } from "../data/memory-store.js";
import { MongoDataStore } from "../data/mongo-store.js";
import { DataStore } from "../data/store.types.js";
import { env } from "../env.js";

const createStore = () =>
  env.dataStoreMode === "mongo" ? new MongoDataStore() : new MemoryDataStore();

export let dataStore: DataStore = createStore();
let initialized = false;

export const initializeDataStore = async () => {
  await dataStore.initialize();
  initialized = true;
};

export const getStoreStatus = () => ({
  mode: dataStore.mode,
  initialized
});

export const resetDataStoreForTests = async () => {
  dataStore = createStore();
  initialized = false;
  await initializeDataStore();
};
