// src/App.tsx
import MapBoard from "./features/map/MapBoard";

function App() {
  return (
    <div className="w-full h-screen overflow-hidden">
      <MapBoard />

      <div className="absolute top-4 right-4 z-10">
        <button className="bg-white p-3 rounded-lg shadow-xl font-bold text-farm-700 hover:bg-farm-50">
          + Add Plant
        </button>
      </div>
    </div>
  );
}

export default App;
