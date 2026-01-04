import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Map, { NavigationControl, GeolocateControl, Marker } from "react-map-gl";
import type { MapRef } from "react-map-gl";
import useSupercluster from "use-supercluster";
import type { BBox, FeatureCollection, Point } from "geojson";
import type { ClusterProperties } from "supercluster";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchPlants, selectAllPlants } from "../../store/plantsSlice";
import { pointsWithinPolygon } from "@turf/turf";
import type { Plant } from "../../types";
import {
  Sprout,
  Clock,
  Download,
  FileDown,
  History,
  List as ListIcon,
} from "lucide-react";
import DrawControl from "./DrawControl";
import { toast } from "sonner";
import { downloadPlantsCSV } from "../../utils/csvHelper";
import { useTheme } from "../../context/ThemeContext";
import { ThemeToggle } from "../../components/ThemeToggle";
import TimeSlider from "./TimeSlider";
import LiveToggle from "./LiveToggle";
import PlantInventory from "./PlantInventory";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface PlantProperties {
  cluster: boolean;
  plantId: string;
  category?: string;
  [key: string]: any;
}

interface MapBoardProps {
  onPlantSelect: (plant: Plant) => void;
}

export default function MapBoard({ onPlantSelect }: MapBoardProps) {
  const dispatch = useAppDispatch();
  const plants = useAppSelector(selectAllPlants);

  const { theme } = useTheme();

  const mapRef = useRef<MapRef>(null);
  const pointsRef = useRef<any[]>([]);

  const [bounds, setBounds] = useState<BBox | null>(null);
  const [viewState, setViewState] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    zoom: 4,
  });

  const [showTimeline, setShowTimeline] = useState(false);
  const [currentDate, setCurrentDate] = useState<number>(Date.now());
  const [dateRange, setDateRange] = useState<{ min: number; max: number }>({
    min: Date.now(),
    max: Date.now(),
  });
  const [showInventory, setShowInventory] = useState(false);

  useEffect(() => {
    if (plants.length === 0) {
      dispatch(fetchPlants());
    }
  }, [dispatch, plants.length]);

  useEffect(() => {
    if (plants.length > 0) {
      const timestamps = plants
        .map((p) => new Date(p.createdAt || Date.now()).getTime())
        .sort((a, b) => a - b);

      const min = timestamps[0];
      const max = timestamps[timestamps.length - 1];

      if (min !== dateRange.min || max !== dateRange.max) {
        setDateRange({ min, max });
        setCurrentDate(max);
      }
    }
  }, [plants]);

  const points = useMemo(() => {
    const filteredPlants = !showTimeline
      ? plants
      : plants.filter(
          (p) => new Date(p.createdAt || Date.now()).getTime() <= currentDate
        );

    const pts = filteredPlants.map((plant) => ({
      type: "Feature" as const,
      properties: {
        cluster: false,
        plantId: plant.id || plant._id || "",
        ...plant,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [plant.longitude, plant.latitude],
      },
    }));

    pointsRef.current = pts;
    return pts;
  }, [plants, currentDate, showTimeline]);

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds: bounds ? [bounds[0], bounds[1], bounds[2], bounds[3]] : undefined,
    zoom: viewState.zoom,
    options: { radius: 75, maxZoom: 20 },
  });

  const updateBounds = () => {
    if (mapRef.current) {
      const b = mapRef.current.getMap().getBounds()?.toArray().flat() as BBox;
      setBounds(b);
    }
  };

  const onUpdate = useCallback((e: any) => {
    const newFeature = e.features[0];
    if (!newFeature) return;

    const currentPoints = pointsRef.current;

    const searchWithin: FeatureCollection<Point> = {
      type: "FeatureCollection",
      features: currentPoints,
    };

    try {
      const ptsWithin = pointsWithinPolygon(searchWithin, newFeature);
      const count = ptsWithin.features.length;

      if (count > 0) {
        const selectedPlants = ptsWithin.features.map(
          (f) => f.properties as unknown as Plant
        );

        toast.success(`Found ${count} plants in this area!`, {
          description: "Data ready for export.",
          duration: 8000,
          action: {
            label: (
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" /> Export CSV
              </div>
            ),
            onClick: () => {
              downloadPlantsCSV(selectedPlants, `field-data-${Date.now()}.csv`);
              toast.dismiss();
            },
          },
        });
      } else {
        toast.info("No plants found in this specific area.");
      }
    } catch (err) {
      console.error("Turf calculation error:", err);
    }
  }, []);

  const onDelete = useCallback(() => {
    toast.dismiss();
  }, []);

  const handleDownloadAll = () => {
    if (plants.length === 0) {
      toast.error("No data to download yet.");
      return;
    }
    downloadPlantsCSV(plants, `full-farm-data-${Date.now()}.csv`);
    toast.success("Downloading full farm report...");
  };

  return (
    <div className="w-full h-full relative bg-slate-100">
      <Map
        {...viewState}
        ref={mapRef}
        onMove={(evt) => {
          setViewState(evt.viewState);
          updateBounds();
        }}
        onLoad={updateBounds}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle={
          theme === "dark"
            ? "mapbox://styles/mapbox/dark-v11"
            : "mapbox://styles/mapbox/satellite-streets-v12"
        }
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <GeolocateControl position="top-left" />
        <NavigationControl position="top-left" />

        <DrawControl
          position="top-left"
          displayControlsDefault={false}
          controls={{
            polygon: true,
            trash: true,
          }}
          onCreate={onUpdate}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />

        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } =
            (cluster.properties as ClusterProperties & PlantProperties) || {};

          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                latitude={latitude}
                longitude={longitude}
              >
                <div
                  className="bg-green-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center border-2 border-white shadow-xl cursor-pointer hover:scale-110 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    const expansionZoom = Math.min(
                      supercluster?.getClusterExpansionZoom(
                        Number(cluster.id)
                      ) ?? 20,
                      20
                    );
                    setViewState({
                      ...viewState,
                      latitude,
                      longitude,
                      zoom: expansionZoom,
                    });
                  }}
                >
                  {pointCount}
                </div>
              </Marker>
            );
          }

          const plant = cluster.properties as unknown as Plant;
          const isPending = plant.syncStatus !== "synced";
          const isError = plant.syncStatus === "error";

          let markerColor = "bg-green-600";
          if (plant.healthStatus === "pest") markerColor = "bg-yellow-500";
          if (plant.healthStatus === "disease") markerColor = "bg-red-500";
          if (plant.healthStatus === "water-stress")
            markerColor = "bg-blue-500";

          if (isError) markerColor = "bg-red-600";
          if (isPending) markerColor = "bg-gray-500/80";

          return (
            <Marker
              key={`plant-${plant.id || plant._id}`}
              latitude={latitude}
              longitude={longitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onPlantSelect(plant);
              }}
            >
              <div
                className={`
                relative p-2 rounded-full border-2 shadow-lg transition-all cursor-pointer hover:scale-110
                ${markerColor} border-white
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
      </Map>

      {showTimeline && plants.length > 1 && (
        <TimeSlider
          minDate={dateRange.min}
          maxDate={dateRange.max}
          currentDate={currentDate}
          onChange={setCurrentDate}
        />
      )}

      <div className="absolute top-[220px] left-[10px] z-[10] flex flex-col gap-2">
        <button
          onClick={handleDownloadAll}
          className="w-[29px] h-[29px] bg-white dark:bg-slate-800 dark:text-gray-200 rounded-md shadow-[0_0_0_2px_rgba(0,0,0,0.1)] flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
          title="Download Full Farm CSV"
        >
          <FileDown className="w-4 h-4" />
        </button>

        <ThemeToggle />

        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className={`
            w-[29px] h-[29px] rounded-md shadow-[0_0_0_2px_rgba(0,0,0,0.1)] flex items-center justify-center transition-colors
            ${
              showTimeline
                ? "bg-green-600 text-white shadow-green-200"
                : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
            }
          `}
          title="Toggle Time Travel"
        >
          <History className="w-4 h-4" />
        </button>

        <LiveToggle />

        <button
          onClick={() => setShowInventory(!showInventory)}
          className={`
        w-[29px] h-[29px] rounded-md shadow-[0_0_0_2px_rgba(0,0,0,0.1)] 
        flex items-center justify-center transition-colors
        ${
          showInventory
            ? "bg-blue-600 text-white shadow-blue-200"
            : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
        }
      `}
          title="Farm Inventory List"
        >
          <ListIcon className="w-4 h-4" />
        </button>
      </div>

      {showInventory && (
        <PlantInventory
          onClose={() => setShowInventory(false)}
          onSelect={(plant) => {
            onPlantSelect(plant);
            mapRef.current?.flyTo({
              center: [plant.longitude, plant.latitude],
              zoom: 18,
            });
          }}
        />
      )}
    </div>
  );
}
