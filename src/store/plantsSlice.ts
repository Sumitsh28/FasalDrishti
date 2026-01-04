import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import type { Plant } from "../types";
import { uploadImageToCloudinary } from "../services/cloudinary";
import { api } from "../services/api";
import { offlineService } from "../services/db";
import { parsePlantFilename } from "../utils/fileParser";
import { toast } from "sonner";

const plantsAdapter = createEntityAdapter<Plant, string>({
  selectId: (plant) =>
    plant._id ?? plant.imageName?.split("_")[0] ?? `temp-${Date.now()}`,
  sortComparer: (a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
});

export const fetchPlants = createAsyncThunk(
  "plants/fetchPlants",
  async (_, { rejectWithValue }) => {
    try {
      const plants = await api.getPlants("farmer@gmail.com");

      const plantsWithStatus = plants.map((p) => ({
        ...p,
        syncStatus: "synced" as const,
        healthStatus: p.healthStatus || "healthy",
      }));

      return plantsWithStatus;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch plants"
      );
    }
  }
);

export const processSyncQueue = createAsyncThunk(
  "plants/processSyncQueue",
  async (_, { dispatch }) => {
    const queue = await offlineService.getQueue();
    if (queue.length === 0) return;

    toast.info(`Syncing ${queue.length} offline items...`);

    for (const item of queue) {
      try {
        await dispatch(
          uploadPlant({
            file: item.file,
            isSyncing: true,
            tempIdToRemove: item.plantId,
            healthStatus: "healthy",
          })
        ).unwrap();
        await offlineService.removeFromQueue(item.id);
      } catch (e) {
        console.error("Sync failed for item", item.id);
      }
    }

    toast.success("Offline sync complete!");
  }
);

export const uploadPlant = createAsyncThunk(
  "plants/uploadPlant",
  async (
    {
      file,
      isSyncing = false,
      healthStatus = "healthy",
    }: {
      file: File;
      isSyncing?: boolean;
      tempIdToRemove?: string;
      healthStatus?: Plant["healthStatus"];
    },
    { dispatch, rejectWithValue }
  ) => {
    const meta = parsePlantFilename(file.name);
    const plantId = meta.isValid ? meta.plantId : `temp-${Date.now()}`;

    const tempPlant: Plant = {
      id: plantId,
      emailId: "farmer@gmail.com",
      imageName: file.name,
      imageUrl: URL.createObjectURL(file),
      latitude: meta.isValid ? meta.latitude : 0,
      longitude: meta.isValid ? meta.longitude : 0,
      syncStatus: navigator.onLine || isSyncing ? "extracting" : "pending",
      healthStatus: healthStatus,
      createdAt: new Date().toISOString(),
      _id: undefined,
    };

    if (!isSyncing) {
      dispatch(plantsSlice.actions.optimisticUpsert(tempPlant));
    }

    if (!navigator.onLine && !isSyncing) {
      await offlineService.addToQueue(file, plantId);
      toast.warning("Offline. Saved to queue.");
      return { ...tempPlant, syncStatus: "pending" as const };
    }

    try {
      const cloudUrl = await uploadImageToCloudinary(file);
      const extractRes = await api.extractLocation(
        tempPlant.emailId,
        file.name,
        cloudUrl
      );
      const saveRes = await api.savePlantData({
        ...tempPlant,
        imageUrl: cloudUrl,
        latitude: extractRes.data.latitude,
        longitude: extractRes.data.longitude,
      });

      if (!isSyncing) toast.success("Plant uploaded!");

      return {
        ...saveRes.data,
        syncStatus: "synced" as const,
        healthStatus: healthStatus,
      };
    } catch (error: any) {
      if (!isSyncing) await offlineService.addToQueue(file, plantId);
      toast.error("Upload failed. Saved to draft queue.");
      return rejectWithValue(error.message || "Upload failed");
    }
  }
);

const plantsSlice = createSlice({
  name: "plants",
  initialState: plantsAdapter.getInitialState({
    loading: false,
    error: null as string | null,
    queueSize: 0,
  }),
  reducers: {
    optimisticUpsert: plantsAdapter.upsertOne,
    addPlant: plantsAdapter.addOne,
    updatePlant: plantsAdapter.updateOne,
    removePlant: plantsAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlants.fulfilled, (state, action) => {
        state.loading = false;
        plantsAdapter.setAll(state, action.payload);
      })
      .addCase(fetchPlants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadPlant.fulfilled, (state, action) => {
        plantsAdapter.upsertOne(state, action.payload);
      });
  },
});

export const { addPlant, updatePlant, removePlant, optimisticUpsert } =
  plantsSlice.actions;
export default plantsSlice.reducer;

export const { selectAll: selectAllPlants, selectById: selectPlantById } =
  plantsAdapter.getSelectors((state: { plants: any }) => state.plants);
