import {
  X,
  Calendar,
  MapPin,
  CheckCircle2,
  CloudOff,
  RefreshCw,
  AlertCircle,
  Bug,
  AlertTriangle,
  Droplets,
  Activity,
  Sparkles,
} from "lucide-react";
import type { Plant } from "../../types";
import { useAppDispatch } from "../../store/hooks";
import { processSyncQueue } from "../../store/plantsSlice";

interface PlantSidebarProps {
  plant: Plant | null;
  onClose: () => void;
}

const getHealthConfig = (status?: string) => {
  switch (status) {
    case "pest":
      return {
        icon: Bug,
        label: "Pest Detected",
        color: "text-yellow-700 bg-yellow-50 border-yellow-200",
        iconColor: "text-yellow-600",
      };
    case "disease":
      return {
        icon: AlertTriangle,
        label: "Disease Detected",
        color: "text-red-700 bg-red-50 border-red-200",
        iconColor: "text-red-600",
      };
    case "water-stress":
      return {
        icon: Droplets,
        label: "Water Stress",
        color: "text-blue-700 bg-blue-50 border-blue-200",
        iconColor: "text-blue-600",
      };
    case "healthy":
    default:
      return {
        icon: CheckCircle2,
        label: "Healthy Crop",
        color: "text-green-700 bg-green-50 border-green-200",
        iconColor: "text-green-600",
      };
  }
};

export default function PlantSidebar({ plant, onClose }: PlantSidebarProps) {
  const dispatch = useAppDispatch();

  if (!plant) return null;

  const isSynced = plant.syncStatus === "synced";
  const isError = plant.syncStatus === "error";

  const health = getHealthConfig(plant.healthStatus);
  const HealthIcon = health.icon;

  return (
    <div className="absolute top-4 left-4 bottom-4 w-80 bg-white rounded-xl shadow-2xl z-[1000] overflow-hidden flex flex-col animate-in slide-in-from-left duration-300">
      <div className="p-4 border-b flex items-center justify-between bg-gray-50">
        <h2 className="font-bold text-lg text-gray-800">Plant Details</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="relative aspect-square w-full bg-gray-100">
          <img
            src={plant.imageUrl}
            alt={plant.imageName}
            className="w-full h-full object-cover"
          />

          <div className="absolute top-2 right-2">
            {isSynced ? (
              <span className="bg-white/90 backdrop-blur text-green-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-green-200">
                <CheckCircle2 className="w-3 h-3" /> Synced
              </span>
            ) : isError ? (
              <span className="bg-white/90 backdrop-blur text-red-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-red-200">
                <AlertCircle className="w-3 h-3" /> Failed
              </span>
            ) : (
              <span className="bg-white/90 backdrop-blur text-yellow-700 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-yellow-200">
                <CloudOff className="w-3 h-3" /> Pending
              </span>
            )}
          </div>
        </div>

        {!isSynced && (
          <div className="p-4 pb-0">
            <button
              onClick={() => dispatch(processSyncQueue())}
              className={`w-full text-white text-sm font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                isError
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              {isError ? "Retry Failed Upload" : "Force Sync Now"}
            </button>
          </div>
        )}

        <div className="p-5 space-y-6">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
              Health Status
            </label>
            <div
              className={`p-3 rounded-lg border flex items-center gap-3 ${health.color}`}
            >
              <div className={`p-1.5 bg-white/60 rounded-full`}>
                <HealthIcon className={`w-5 h-5 ${health.iconColor}`} />
              </div>
              <span className="font-bold text-sm">{health.label}</span>
            </div>
          </div>

          {plant.aiDiagnosis && (
            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-white rounded-md shadow-sm">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                </div>
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  AI Agronomist
                </span>
                {plant.confidence && (
                  <span className="ml-auto text-[10px] font-medium text-indigo-500 bg-white px-1.5 py-0.5 rounded-full">
                    {plant.confidence}% Conf.
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-indigo-800">
                  Detected:{" "}
                  <span className="text-indigo-900">
                    {plant.detectedPlant || "Unknown Crop"}
                  </span>
                </p>
                <p className="text-xs text-indigo-700 leading-relaxed italic">
                  "{plant.aiDiagnosis}"
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              File Name
            </label>
            <p className="text-sm font-medium text-gray-900 break-all leading-relaxed">
              {plant.imageName}
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Location
              </label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="text-[10px] text-gray-500 block">Lat</span>
                  <p className="text-sm font-mono font-medium">
                    {plant.latitude.toFixed(6)}
                  </p>
                </div>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="text-[10px] text-gray-500 block">Lng</span>
                  <p className="text-sm font-mono font-medium">
                    {plant.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Captured On
              </label>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {new Date(plant.createdAt || Date.now()).toLocaleDateString(
                  "en-IN",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
