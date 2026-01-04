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
      className={`
        w-[29px] h-[29px] rounded-md shadow-[0_0_0_2px_rgba(0,0,0,0.1)] 
        flex items-center justify-center transition-all duration-300
        ${
          isLive
            ? "bg-red-50 text-red-600 shadow-red-200 ring-1 ring-red-400"
            : "bg-white dark:bg-slate-800 text-gray-400 hover:bg-gray-50"
        }
      `}
      title={isLive ? "Stop Live Sync" : "Go Live"}
    >
      {isLive ? (
        <Radio className="w-4 h-4 animate-pulse" />
      ) : (
        <WifiOff className="w-4 h-4" />
      )}
    </button>
  );
}
