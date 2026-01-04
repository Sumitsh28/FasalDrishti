import type { DBSchema } from "idb";
import { openDB } from "idb";

interface FarmDB extends DBSchema {
  "sync-queue": {
    key: string;
    value: {
      id: string;
      plantId: string;
      file: File;
      timestamp: number;
    };
  };
}

const DB_NAME = "farm-geotag-db";

export const dbPromise = openDB<FarmDB>(DB_NAME, 2, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      db.createObjectStore("sync-queue", { keyPath: "id" });
    }
  },
});

export const offlineService = {
  addToQueue: async (file: File, plantId: string) => {
    const db = await dbPromise;
    const id = crypto.randomUUID();
    await db.add("sync-queue", { id, plantId, file, timestamp: Date.now() });
    return id;
  },
  getQueue: async () => {
    const db = await dbPromise;
    return db.getAll("sync-queue");
  },
  removeFromQueue: async (id: string) => {
    const db = await dbPromise;
    await db.delete("sync-queue", id);
  },
};
