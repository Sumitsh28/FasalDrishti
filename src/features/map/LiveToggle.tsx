import { useEffect, useState } from "react";
import { Radio, Wifi, WifiOff } from "lucide-react";
import { useAppDispatch } from "../../store/hooks";
import { silentFetchPlants } from "../../store/plantsSlice";
import { toast } from "sonner";

export default function LiveToggle() {
  const dispatch = useAppDispatch();
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let interval: any;

    if (isLive) {
      toast.info("Live Mode Active", {
        description: "Syncing with farm server every 5s...",
        icon: <Wifi className="w-4 h-4 text-green-500 animate-pulse" />,
      });

      interval = setInterval(async () => {
        const result = await dispatch(silentFetchPlants());

        if (silentFetchPlants.fulfilled.match(result) && result.payload) {
          toast.success("New Farm Data!", {
            description: `${result.payload.newCount} new plants synced from team.`,
            duration: 4000,
          });
        }
      }, 5000);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isLive, dispatch]);

  return (
    <button
      onClick={() => setIsLive(!isLive)}
      aria-label={isLive ? "Stop Live Sync" : "Go Live"}
      className={`
    relative group inline-flex items-center justify-center
    h-9 w-9 rounded-md
    border shadow-sm
    transition-all duration-300
    ${
      isLive
        ? "bg-red-50 text-red-600 border-red-400 shadow-red-200 ring-1 ring-red-400 hover:bg-red-100"
        : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700 dark:hover:bg-slate-700 dark:hover:border-slate-600"
    }
  `}
    >
      {isLive ? (
        <Radio className="w-4 h-4 animate-pulse" />
      ) : (
        <WifiOff className="w-4 h-4" />
      )}

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
        {isLive ? "Stop Live Sync" : "Go Live"}
      </span>
    </button>
  );
}
