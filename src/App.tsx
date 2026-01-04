// src/App.tsx
import { useState } from "react";
import MapBoard from "./features/map/MapBoard";
import UploadModal from "./features/upload/UploadModal";
import { Plus } from "lucide-react";

function App() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="w-full h-screen overflow-hidden relative">
      <MapBoard />

      <div className="absolute bottom-8 right-8 z-50">
        <button
          onClick={() => setIsUploadOpen(true)}
          className="bg-green-600 text-white p-4 rounded-full shadow-xl hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-6 h-6" />
          <span className="font-bold">Add Plant</span>
        </button>
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
}

export default App;
