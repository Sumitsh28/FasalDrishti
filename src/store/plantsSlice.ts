import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import axios from "axios";
import type { Plant, FetchPlantsResponse } from "../types";
import { uploadImageToCloudinary } from "../services/cloudinary";
import { api } from "../services/api";

const API_BASE = "https://api.alumnx.com/api/hackathons";
const USER_EMAIL = "farmer@gmail.com";

export const fetchPlants = createAsyncThunk(
  "plants/fetchPlants",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post<FetchPlantsResponse>(
        `${API_BASE}/get-plant-location-data`,
        { emailId: USER_EMAIL }
      );
      const plantsWithStatus = response.data.data.map((p) => ({
        ...p,
        id: p._id ?? p.tempId!,
        syncStatus: "synced" as const,
      }));
      return plantsWithStatus;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch plants"
      );
    }
  }
);

const plantsAdapter = createEntityAdapter<Plant>({
  sortComparer: (a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""),
});

const plantsSlice = createSlice({
  name: "plants",
  initialState: plantsAdapter.getInitialState({
    loading: false,
    error: null as string | null,
  }),
  reducers: {
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
      .addCase(uploadPlant.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadPlant.fulfilled, (state, action) => {
        state.loading = false;
        plantsAdapter.addOne(state, action.payload);
      })
      .addCase(uploadPlant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const uploadPlant = createAsyncThunk(
  "plants/uploadPlant",
  async (file: File, { rejectWithValue }) => {
    try {
      const emailId = "farmer@gmail.com"; // Hardcoded for now
      const imageName = file.name;

      // Step 1: Upload Image
      const imageUrl = await uploadImageToCloudinary(file);

      // Step 2: Extract Geo Data
      const extractRes = await api.extractLocation(
        emailId,
        imageName,
        imageUrl
      );

      if (!extractRes.success) {
        throw new Error("Could not extract location from image");
      }

      // Step 3: Save to Database
      const saveRes = await api.savePlantData({
        emailId,
        imageName,
        imageUrl,
        latitude: extractRes.data.latitude,
        longitude: extractRes.data.longitude,
      });

      // Return the final saved plant object to Redux
      return {
        ...saveRes.data,
        syncStatus: "synced" as const,
      };
    } catch (error: any) {
      console.error("Upload flow failed:", error);
      return rejectWithValue(error.message || "Upload failed");
    }
  }
);

export const { addPlant, updatePlant, removePlant } = plantsSlice.actions;
export default plantsSlice.reducer;

export const { selectAll: selectAllPlants, selectById: selectPlantById } =
  plantsAdapter.getSelectors((state: { plants: any }) => state.plants);
