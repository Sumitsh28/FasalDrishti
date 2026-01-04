import { useEffect, useState } from "react";
import Map, {
  NavigationControl,
  GeolocateControl,
  Marker,
  Popup,
} from "react-map-gl";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchPlants, selectAllPlants } from "../../store/plantsSlice";
import type { Plant } from "../../types";
import { Sprout } from "lucide-react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapBoard() {
  const dispatch = useAppDispatch();
  const plants = useAppSelector(selectAllPlants);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  const [viewState, setViewState] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    zoom: 4,
  });

  useEffect(() => {
    dispatch(fetchPlants());
  }, [dispatch]);

  return (
    <div className="w-full h-screen bg-slate-100 relative">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <GeolocateControl position="top-left" />
        <NavigationControl position="top-left" />

        {plants.map((plant) => (
          <Marker
            key={plant._id || plant.tempId}
            latitude={plant.latitude}
            longitude={plant.longitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedPlant(plant);
            }}
          >
            <div
              className={`
              p-2 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 shadow-lg
              ${
                plant.syncStatus === "pending"
                  ? "bg-gray-400 border-gray-600"
                  : "bg-farm-500 border-white"
              }
            `}
            >
              <Sprout className="w-5 h-5 text-white" />
            </div>
          </Marker>
        ))}

        {selectedPlant && (
          <Popup
            latitude={selectedPlant.latitude}
            longitude={selectedPlant.longitude}
            anchor="top"
            onClose={() => setSelectedPlant(null)}
            closeOnClick={false}
          >
            <div className="p-2 max-w-xs">
              <img
                src={selectedPlant.imageUrl}
                alt="Plant"
                className="w-full h-32 object-cover rounded mb-2 bg-gray-100"
              />
              <p className="font-bold text-sm text-gray-800">
                Lat: {selectedPlant.latitude.toFixed(4)}
              </p>
              <p className="font-bold text-sm text-gray-800">
                Lng: {selectedPlant.longitude.toFixed(4)}
              </p>
              <span className="text-xs text-gray-500">
                Uploaded:{" "}
                {new Date(selectedPlant.uploadedAt || "").toLocaleDateString()}
              </span>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
