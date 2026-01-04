import { useState, useRef, useEffect } from "react";
import { MoveHorizontal, X, Calendar } from "lucide-react";

interface CompareSliderProps {
  beforeImage: string;
  beforeDate: string;
  afterImage: string;
  afterDate: string;
  onClose: () => void;
}

export default function CompareSlider({
  beforeImage,
  beforeDate,
  afterImage,
  afterDate,
  onClose,
}: CompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (event: MouseEvent | TouchEvent) => {
    if (!isResizing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX =
      "touches" in event ? event.touches[0].clientX : event.clientX;

    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));

    setSliderPosition(percent);
  };

  const handleUp = () => setIsResizing(false);

  useEffect(() => {
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("touchmove", handleMove as any);
    document.addEventListener("mouseup", handleUp);
    document.addEventListener("touchend", handleUp);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("touchmove", handleMove as any);
      document.removeEventListener("mouseup", handleUp);
      document.removeEventListener("touchend", handleUp);
    };
  }, [isResizing]);

  return (
    <div className="fixed inset-0 z-[2000] bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl flex justify-between items-center mb-4 text-white">
        <div>
          <h2 className="text-xl font-bold">Evolution Analysis</h2>
          <p className="text-sm text-gray-400">
            Drag slider to compare changes
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative w-full max-w-4xl aspect-[4/3] rounded-xl overflow-hidden border border-white/20 shadow-2xl select-none"
        onMouseDown={() => setIsResizing(true)}
        onTouchStart={() => setIsResizing(true)}
      >
        <div className="absolute inset-0">
          <img
            src={afterImage}
            alt="After"
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white border border-white/20 flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            {new Date(afterDate).toLocaleDateString()} (Latest)
          </div>
        </div>

        <div
          className="absolute inset-0 border-r-2 border-white/50"
          style={{ width: `${sliderPosition}%`, overflow: "hidden" }}
        >
          <img
            src={beforeImage}
            alt="Before"
            className="absolute top-0 left-0 max-w-none h-full w-full object-cover"
            style={{
              width: containerRef.current?.offsetWidth,
              height: containerRef.current?.offsetHeight,
            }}
            draggable={false}
          />
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white border border-white/20 flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            {new Date(beforeDate).toLocaleDateString()} (Past)
          </div>
        </div>

        <div
          className="absolute inset-y-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg transform active:scale-95 transition-transform">
            <MoveHorizontal className="w-5 h-5 text-gray-900" />
          </div>
        </div>
      </div>
    </div>
  );
}
