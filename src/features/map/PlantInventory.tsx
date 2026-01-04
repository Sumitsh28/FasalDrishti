import { useState } from "react";
import { FixedSizeList as List } from "react-window";
import {
  X,
  Search,
  Sprout,
  AlertTriangle,
  Bug,
  Droplets,
  CheckCircle2,
} from "lucide-react";
import { useAppSelector } from "../../store/hooks";
import { selectAllPlants } from "../../store/plantsSlice";
import type { Plant } from "../../types";

interface PlantInventoryProps {
  onClose: () => void;
  onSelect: (plant: Plant) => void;
}

const Row = ({
  index,
  style,
  data,
}: {
  index: number;
  style: React.CSSProperties;
  data: { plants: Plant[]; onSelect: (p: Plant) => void };
}) => {
  const plant = data.plants[index];
  const { onSelect } = data;

  let Icon = CheckCircle2;
  let color = "text-green-600 bg-green-50";

  if (plant.healthStatus === "pest") {
    Icon = Bug;
    color = "text-yellow-600 bg-yellow-50";
  }
  if (plant.healthStatus === "disease") {
    Icon = AlertTriangle;
    color = "text-red-600 bg-red-50";
  }
  if (plant.healthStatus === "water-stress") {
    Icon = Droplets;
    color = "text-blue-600 bg-blue-50";
  }

  return (
    <div style={style} className="px-4 py-2">
      <button
        onClick={() => onSelect(plant)}
        className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg hover:border-green-500 transition-all group text-left shadow-sm"
      >
        <img
          src={plant.imageUrl}
          className="w-12 h-12 rounded-md object-cover bg-gray-200"
          loading="lazy"
          alt="plant"
        />

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <p className="font-bold text-gray-800 dark:text-gray-200 text-sm truncate">
              {plant.detectedPlant || "Unknown Crop"}
            </p>
            <span className="text-[10px] text-gray-400 font-mono">
              {new Date(plant.createdAt || "").toLocaleDateString()}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            ID: {plant.id}
          </p>
        </div>

        <div className={`p-2 rounded-full ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
};

export default function PlantInventory({
  onClose,
  onSelect,
}: PlantInventoryProps) {
  const allPlants = useAppSelector(selectAllPlants);
  const [search, setSearch] = useState("");

  // Filter Logic
  const filteredPlants = allPlants.filter(
    (p) =>
      p.detectedPlant?.toLowerCase().includes(search.toLowerCase()) ||
      p.healthStatus?.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="absolute top-4 left-4 bottom-4 w-80 bg-white dark:bg-slate-900 border-r dark:border-slate-800 rounded-xl shadow-2xl z-[1000] overflow-hidden flex flex-col animate-in slide-in-from-left duration-300">
      {/* Header */}
      <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between bg-gray-50 dark:bg-slate-950">
        <div className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-green-600" />
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">
            Farm Inventory
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="p-4 border-b dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search crop, ID, or health..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-gray-100"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 ml-1">
          Showing {filteredPlants.length} plants
        </p>
      </div>

      <div className="flex-1 bg-gray-50 dark:bg-slate-950">
        {filteredPlants.length > 0 ? (
          <List
            height={600}
            itemCount={filteredPlants.length}
            itemSize={88}
            width={"100%"}
            itemData={{ plants: filteredPlants, onSelect }}
          >
            {Row}
          </List>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Sprout className="w-12 h-12 mb-2 opacity-20" />
            <p>No plants found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
