import axios from "axios";
import type { Plant, ExtractGeoResponse, SavePlantResponse } from "../types";

const API_BASE = "https://api.alumnx.com/api/hackathons";

export const api = {
  extractLocation: async (
    emailId: string,
    imageName: string,
    imageUrl: string
  ) => {
    const response = await axios.post<ExtractGeoResponse>(
      `${API_BASE}/extract-latitude-longitude`,
      { emailId, imageName, imageUrl }
    );
    return response.data;
  },

  savePlantData: async (plantData: Partial<Plant>) => {
    const payload = {
      emailId: plantData.emailId,
      imageName: plantData.imageName,
      imageUrl: plantData.imageUrl,
      latitude: plantData.latitude,
      longitude: plantData.longitude,
    };

    const response = await axios.post<SavePlantResponse>(
      `${API_BASE}/save-plant-location-data`,
      payload
    );
    return response.data;
  },
};
