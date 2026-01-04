import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import axios from "axios";
import type { Plant, FetchPlantsResponse } from "../types";

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
  selectId: (plant) => plant._id || plant.tempId || "unknown",
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
      });
  },
});

export const { addPlant, updatePlant, removePlant } = plantsSlice.actions;
export default plantsSlice.reducer;

export const { selectAll: selectAllPlants, selectById: selectPlantById } =
  plantsAdapter.getSelectors((state: { plants: any }) => state.plants);
