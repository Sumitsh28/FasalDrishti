import { Play, Pause, CalendarDays, History, RotateCcw } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";

interface TimeSliderProps {
  minDate: number;
  maxDate: number;
  currentDate: number;
  onChange: Dispatch<SetStateAction<number>>;
}

export default function TimeSlider({
  minDate,
  maxDate,
  currentDate,
  onChange,
}: TimeSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (currentDate >= maxDate && isPlaying) {
      setIsPlaying(false);
    }
  }, [currentDate, maxDate, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        onChange((prevDate: number) => {
          const range = maxDate - minDate;
          const step = Math.max(range / 50, 8640000);

          const nextDate = prevDate + step;

          if (nextDate >= maxDate) {
            setIsPlaying(false);
            return maxDate;
          }
          return nextDate;
        });
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, maxDate, minDate, onChange]);

  if (minDate === maxDate) return null;

  const handlePlayToggle = () => {
    if (currentDate >= maxDate) {
      onChange(minDate);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[400] w-[90%] max-w-xl animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/50 dark:border-slate-700 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayToggle}
              className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-transform active:scale-95 shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : currentDate >= maxDate ? (
                <RotateCcw className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-1" />
              )}
            </button>
            <div>
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-xs uppercase tracking-wider">
                <History className="w-3 h-3" />
                <span>Time Travel</span>
              </div>
              <p className="text-lg font-black text-gray-800 dark:text-gray-100 tabular-nums">
                {new Date(currentDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Season Range
            </span>
            <p className="text-xs font-bold text-gray-600 dark:text-gray-400">
              {new Date(minDate).toLocaleDateString()} —{" "}
              {new Date(maxDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <input
          type="range"
          min={minDate}
          max={maxDate}
          value={currentDate}
          onChange={(e) => {
            setIsPlaying(false);
            onChange(Number(e.target.value));
          }}
          className="
            w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer
            accent-green-600 hover:accent-green-500
          "
        />
      </div>
    </div>
  );
}
