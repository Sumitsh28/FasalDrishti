export interface GeoJSONPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface Plant {
  id: string;
  _id?: string;
  tempId?: string;
  emailId: string;
  imageName: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  location?: GeoJSONPoint;
  uploadedAt?: string;
  createdAt?: string;
  updatedAt?: string;

  syncStatus?: "synced" | "pending" | "failed" | "extracting" | "error";
  healthStatus?: "healthy" | "pest" | "disease" | "water-stress";
}

export interface FetchPlantsResponse {
  success: boolean;
  message: string;
  count: number;
  data: Plant[];
}

export interface SavePlantResponse {
  success: boolean;
  message: string;
  isUpdate: boolean;
  data: Plant;
}

export interface ExtractGeoResponse {
  success: boolean;
  data: {
    imageName: string;
    latitude: number;
    longitude: number;
  };
}
