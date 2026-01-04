import { useEffect, useState } from "react";
import Map, {
  NavigationControl,
  GeolocateControl,
  Marker,
  Popup,
} from "react-map-gl";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchPlants,
  processSyncQueue,
  selectAllPlants,
} from "../../store/plantsSlice";
import type { Plant } from "../../types";
import { Sprout, Clock } from "lucide-react";

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
    if (plants.length === 0) {
      dispatch(fetchPlants());
    }
  }, [dispatch, plants.length]);

  return (
    <div className="w-full h-full relative bg-slate-100">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <GeolocateControl position="top-left" />
        <NavigationControl position="top-left" />

        {plants.map((plant) => {
          const isPending = plant.syncStatus !== "synced";

          return (
            <Marker
              key={plant._id || plant.imageName}
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
                relative p-2 rounded-full border-2 shadow-lg transition-all cursor-pointer hover:scale-110
                ${
                  isPending
                    ? "bg-gray-500/80 border-gray-300 animate-pulse"
                    : "bg-farm-500 border-white"
                }
              `}
              >
                <Sprout
                  className={`w-5 h-5 ${
                    isPending ? "text-gray-200" : "text-white"
                  }`}
                />

                {isPending && (
                  <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5 border border-white shadow-sm">
                    <Clock className="w-2 h-2 text-yellow-900" />
                  </div>
                )}
              </div>
            </Marker>
          );
        })}

        {selectedPlant && (
          <Popup
            latitude={selectedPlant.latitude}
            longitude={selectedPlant.longitude}
            anchor="top"
            onClose={() => setSelectedPlant(null)}
            closeOnClick={false}
          >
            <div className="p-2 max-w-xs">
              {selectedPlant.syncStatus !== "synced" && (
                <div className="flex flex-col gap-2 mb-2">
                  <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full inline-flex items-center gap-1 w-fit">
                    <Clock className="w-3 h-3" /> Pending Sync
                  </div>
                  <button
                    onClick={() => dispatch(processSyncQueue())}
                    className="bg-blue-600 text-white text-xs px-3 py-1 rounded shadow hover:bg-blue-700 transition-colors"
                  >
                    Force Sync Now
                  </button>
                </div>
              )}
              <img
                src={selectedPlant.imageUrl}
                alt="Plant"
                className="w-full h-32 object-cover rounded mb-2 bg-gray-100"
              />
              <div className="text-sm text-gray-800">
                <p>
                  <span className="font-bold">Lat:</span>{" "}
                  {selectedPlant.latitude.toFixed(5)}
                </p>
                <p>
                  <span className="font-bold">Lng:</span>{" "}
                  {selectedPlant.longitude.toFixed(5)}
                </p>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
