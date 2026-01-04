import { useMemo, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { selectAllPlants } from "../../store/plantsSlice";
import { CloudUpload, Activity, TrendingUp, BarChart3, X } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function StatsOverlay() {
  const plants = useAppSelector(selectAllPlants);
  const [isOpen, setIsOpen] = useState(false);

  const chartData = useMemo(() => {
    if (plants.length === 0) return [];

    const sorted = [...plants].sort((a, b) =>
      (a.createdAt || "").localeCompare(b.createdAt || "")
    );
    const firstDate = new Date(sorted[0].createdAt || Date.now()).getDate();
    const lastDate = new Date(
      sorted[sorted.length - 1].createdAt || Date.now()
    ).getDate();
    const isSingleDay = firstDate === lastDate;
    const groups: Record<string, number> = {};

    sorted.forEach((p) => {
      const dateObj = new Date(p.createdAt || Date.now());
      let key = "";
      if (isSingleDay) {
        key = `${dateObj.getHours()}:00`;
      } else {
        key = dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
      groups[key] = (groups[key] || 0) + 1;
    });

    const data = Object.entries(groups).map(([label, count]) => ({
      label,
      count,
    }));
    if (data.length === 1) data.unshift({ label: "Start", count: 0 });
    return data;
  }, [plants]);

  const totalPlants = plants.length;
  const pendingCount = plants.filter((p) => p.syncStatus !== "synced").length;

  if (totalPlants === 0) return null;

  return (
    <>
      <div className="absolute top-[220px] left-[10px] z-[500]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-[29px] h-[29px] bg-white rounded-md shadow-[0_0_0_2px_rgba(0,0,0,0.1)] 
            flex items-center justify-center transition-all hover:bg-gray-50
            ${
              isOpen
                ? "text-green-600 bg-green-50 ring-2 ring-green-500"
                : "text-gray-700"
            }
          `}
          title="Show Farm Analytics"
        >
          {isOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <BarChart3 className="w-4 h-4" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-[10px] left-[50px] z-[500] animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/50 w-[300px] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <Activity className="w-4 h-4 text-green-700" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Farm Pulse
                  </h3>
                  <p className="text-sm font-bold text-gray-900">
                    {totalPlants} Crops Tracked
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4">
              {pendingCount > 0 && (
                <div className="mb-4 flex items-center justify-between bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                  <div className="flex items-center gap-2">
                    <CloudUpload className="w-3 h-3 text-yellow-600 animate-bounce" />
                    <span className="text-[10px] font-bold text-yellow-800 uppercase">
                      Syncing
                    </span>
                  </div>
                  <span className="text-xs font-bold text-yellow-700">
                    {pendingCount} pending
                  </span>
                </div>
              )}

              <div className="h-32 w-full">
                <div className="flex items-center gap-1 mb-2">
                  <TrendingUp className="w-3 h-3 text-gray-400" />
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">
                    Activity Trend
                  </span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorCount"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#16a34a"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#16a34a"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      itemStyle={{
                        color: "#16a34a",
                        fontWeight: "bold",
                        fontSize: "12px",
                      }}
                      labelStyle={{ fontSize: "10px", color: "#6b7280" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#16a34a"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
