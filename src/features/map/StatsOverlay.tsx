import { useMemo, useState } from "react";
import { useAppSelector } from "../../store/hooks";
import { selectAllPlants } from "../../store/plantsSlice";
import {
  CloudUpload,
  Activity,
  TrendingUp,
  BarChart3,
  X,
  PieChart,
  Sprout,
  Leaf,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = {
  healthy: "#16a34a",
  pest: "#eab308",
  disease: "#dc2626",
  "water-stress": "#2563eb",
};

export default function StatsOverlay() {
  const plants = useAppSelector(selectAllPlants);
  const [isOpen, setIsOpen] = useState(false);

  const { timelineData, cropData, healthData, stats } = useMemo(() => {
    if (plants.length === 0)
      return { timelineData: [], cropData: [], healthData: [], stats: {} };

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

    const tData = Object.entries(groups).map(([label, count]) => ({
      label,
      count,
    }));
    if (tData.length === 1) tData.unshift({ label: "Start", count: 0 });

    const cropCounts: Record<string, number> = {};
    plants.forEach((p) => {
      const name = p.detectedPlant || "Unknown";
      cropCounts[name] = (cropCounts[name] || 0) + 1;
    });
    const cData = Object.entries(cropCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const healthCounts: Record<string, number> = {
      healthy: 0,
      pest: 0,
      disease: 0,
      "water-stress": 0,
    };
    plants.forEach((p) => {
      const status = p.healthStatus || "healthy";
      if (healthCounts[status] !== undefined) healthCounts[status]++;
    });
    const hData = Object.entries(healthCounts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));

    const pending = plants.filter((p) => p.syncStatus !== "synced").length;
    const dominantCrop = cData.length > 0 ? cData[0].name : "N/A";

    return {
      timelineData: tData,
      cropData: cData,
      healthData: hData,
      stats: { total: plants.length, pending, dominantCrop },
    };
  }, [plants]);

  if (plants.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-3 rounded-lg shadow-xl">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
            {label}
          </p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {payload[0].value} Plants
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="absolute top-[440px] left-[10px] z-20">
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Show Farm Analytics"
          className="
    relative group inline-flex items-center justify-center
    h-9 w-9 rounded-md
    border border-gray-200 shadow-sm
    bg-white text-gray-700
    hover:bg-gray-50 hover:border-gray-300
    transition-colors transition-shadow duration-200
    dark:bg-slate-800 dark:text-gray-200 dark:border-slate-700
    dark:hover:bg-slate-700 dark:hover:border-slate-600
  "
        >
          <BarChart3 className="w-4 h-4" />

          <span
            className="
      pointer-events-none absolute top-1/2 left-full ml-2 -translate-y-1/2
      whitespace-nowrap rounded-md px-2 py-1
      text-xs font-medium
      bg-gray-900 text-white
      opacity-0 scale-95
      group-hover:opacity-100 group-hover:scale-100
      transition-all duration-200
      dark:bg-gray-100 dark:text-gray-900
    "
          >
            Show Farm Analytics
          </span>
        </button>
      </div>

      {/* 2. FULL SCREEN MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[2000] bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-6 h-6 text-green-600" />
                  Farm Analytics
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Real-time insights across {stats.total} data points
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-200 dark:bg-green-800 rounded-lg text-green-800 dark:text-green-100">
                      <Sprout className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-green-800 dark:text-green-300">
                      Total Plants
                    </span>
                  </div>
                  <p className="text-3xl font-black text-green-900 dark:text-green-100">
                    {stats.total}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg text-blue-800 dark:text-blue-100">
                      <Leaf className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                      Dominant Crop
                    </span>
                  </div>
                  <p className="text-3xl font-black text-blue-900 dark:text-blue-100">
                    {stats.dominantCrop}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-200 dark:bg-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-100">
                      <CloudUpload className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                      Pending Sync
                    </span>
                  </div>
                  <p className="text-3xl font-black text-yellow-900 dark:text-yellow-100">
                    {stats.pending}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <PieChart className="w-4 h-4" /> Health Distribution
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={healthData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {healthData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                COLORS[entry.name as keyof typeof COLORS] ||
                                "#94a3b8"
                              }
                              strokeWidth={0}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Top Crops
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={cropData}
                        layout="vertical"
                        margin={{ left: 10, right: 10 }}
                      >
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          width={80}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={{ fill: "transparent" }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#3b82f6"
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="md:col-span-2 bg-gray-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Activity Trend
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={timelineData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
                          stroke="#e2e8f0"
                          strokeOpacity={0.3}
                        />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 12, fill: "#94a3b8" }}
                          axisLine={false}
                          tickLine={false}
                          dy={10}
                        />
                        <YAxis
                          tick={{ fontSize: 12, fill: "#94a3b8" }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#16a34a"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorCount)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
