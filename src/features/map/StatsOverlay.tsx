import { useAppSelector } from "../../store/hooks";
import { selectAllPlants } from "../../store/plantsSlice";
import { Sprout, CloudUpload, Clock, Activity } from "lucide-react";

export default function StatsOverlay() {
  const plants = useAppSelector(selectAllPlants);

  const totalPlants = plants.length;
  const pendingCount = plants.filter((p) => p.syncStatus !== "synced").length;

  const lastUpload = plants
    .map((p) => p.createdAt)
    .sort()
    .reverse()[0];

  const formattedDate = lastUpload
    ? new Date(lastUpload).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  if (totalPlants === 0) return null;

  return (
    <div className="absolute top-4 left-16 z-[500] flex flex-col gap-3 pointer-events-none">
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/50 pointer-events-auto min-w-[200px]">
        <div className="flex items-center gap-2 mb-3 border-b border-gray-200 pb-2">
          <Activity className="w-4 h-4 text-green-600" />
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Farm Insights
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-md">
                <Sprout className="w-4 h-4 text-green-700" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Total Crop
              </span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              {totalPlants}
            </span>
          </div>

          {pendingCount > 0 && (
            <div className="flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-yellow-100 rounded-md">
                  <CloudUpload className="w-4 h-4 text-yellow-700" />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  Syncing
                </span>
              </div>
              <span className="text-lg font-bold text-yellow-600">
                {pendingCount}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">Last Activity</span>
            </div>
            <span className="text-xs font-mono font-medium text-gray-600">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
