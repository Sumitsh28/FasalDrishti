# 🌾 FasalDrishti

> **An Offline-First, AI-Powered Geospatial Intelligence Platform for Precision Agriculture.**

**FasalDrishti** is a mission-critical tool designed for farmers and agronomists operating in low-connectivity environments. It combines satellite imagery, localized field data, and AI diagnosis into a single "Command Center" for crop health.

_The FasalDrishti Command Center showing 10,000+ data points clustered for performance._

Demo Video: https://youtu.be/GtsG8Un8qfw
---

## 🚀 Key Features

### 📡 Core Connectivity & Sync

- **Offline-First Architecture:** Continue working without internet. Data is queued in IndexedDB and syncs automatically when connection is restored.
- **Optimistic UI:** Instant feedback. Markers appear immediately ("Ghost Markers") while uploading in the background.
- **Real-Time Collaboration:** "Live Mode" uses short-polling (SWR strategy) to sync data between multiple farmers working on the same field.

### 🗺️ Advanced Geospatial Analysis

- **High-Performance Mapping:** Renders **10,000+ plant markers** at 60fps using Supercluster aggregation.
- **Geofencing & Polygon Analysis:** Draw field boundaries to calculate localized crop statistics using **Turf.js**.
- **Time-Travel Engine:** Scroll through historical data to visualize crop evolution over seasons.

_Geofencing a specific field to analyze crop density and health within the boundary._

### 🧠 AI & Diagnostics

- **On-Device Pre-processing:** Images are compressed and resized in the browser (using Web Workers) before upload.
- **AI Diagnosis:** Integrated AI analysis to auto-detect crop type (Corn, Wheat, etc.) and health status (Pest, Disease, Water Stress).
- **Split-View Comparison:** "Before & After" slider to compare the exact same geocoordinate across different dates.

_Comparing crop health before and after treatment using the historical slider._

---

## 🏗️ Architectural Decisions & Engineering Impact

We didn’t just build features; we solved engineering constraints. Below is the breakdown of our technical strategy:

| Challenge                                              | Architectural Decision              | Implementation Detail                                                                                                                                                             | Quantifiable Impact                                                              |
| ------------------------------------------------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Network Instability** _(Farms have poor 4G)_         | **Offline-First Queue (IndexedDB)** | Custom Redux middleware intercepts failed `500`/network errors and serializes actions to IndexedDB. A background listener flushes the queue when `navigator.onLine` becomes true. | **0% data loss.** Users can map an entire field in airplane mode and sync later. |
| **Rendering Bottlenecks** _(Map lag with 1k+ markers)_ | **Supercluster Aggregation**        | Uses a K-D tree (Supercluster) to aggregate points based on zoom level and viewport bounds instead of rendering individual DOM nodes.                                             | **60 FPS rendering.** Reduced DOM nodes by **~95%** at zoom level 4.             |
| **List Performance** _(Sidebar lagging)_               | **Windowing / Virtualization**      | Implemented `react-window` to render only the visible ~10 list items and recycle DOM nodes during scroll.                                                                         | **O(1) memory usage** regardless of list size (10 vs 10,000 items).              |
| **User-Perceived Latency**                             | **Optimistic Updates**              | Redux store updates immediately on user action; state is rolled back only if the server rejects the final sync.                                                                   | **< 50 ms interaction time.** Uploads feel instant despite 2–3 s server latency. |
| **Large Image Uploads**                                | **Client-Side Compression**         | `browser-image-compression` runs off the main thread to resize 4K images into optimized web assets before upload.                                                                 | **~80% bandwidth savings.** Reduced payload from ~5 MB to ~800 KB.               |

---

## 🛠️ Technology Stack

### Frontend Core

- **Framework:** React 18 + Vite (Fast HMR)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + Shadcn/ui (Radix Primitives)

### State & Data

- **State Management:** Redux Toolkit (Slices, Thunks, EntityAdapter)
- **Data Fetching:** Axios + Custom Retry Logic
- **Persistence:** Redux Persist + LocalForage (IndexedDB wrapper)

### Geospatial Engine

- **Map Rendering:** Mapbox GL JS (Vector Tiles)
- **Spatial Math:** Turf.js (Polygon intersection, distance calculation)
- **Clustering:** Supercluster (K-D Tree implementation)

### Performance & Tools

- **Virtualization:** React-Window
- **Charts:** Recharts (Responsive SVG charts)
- **Testing:** Vitest (Unit) + React Testing Library

---

## 🔌 API Integration Logic

FasalDrishti integrates with the Alumnx Hackathon API to persist geospatial data. The sync engine handles the following endpoints:

### 1. Extract GPS Metadata

Used immediately after image selection to populate the "Add Plant" modal.

- **Endpoint:** `POST /api/hackathons/extract-latitude-longitude`
- **Purpose:** Parses EXIF data from the uploaded image.

### 2. Save Plant Data (Sync & Offline Queue)

This endpoint is triggered by the `uploadPlant` thunk. If offline, the payload is serialized to IndexedDB.

- **Endpoint:** `POST /api/hackathons/save-plant-location-data`
- **Payload:**

```json
{
  "emailId": "farmer@gmail.com",
  "imageName": "corn_field_01.jpg",
  "imageUrl": "https://res.cloudinary.com/...",
  "latitude": 15.97048,
  "longitude": 79.27811
}
```

### 3. Fetch Farm Data (Visualization)

Called on app initialization (`useEffect`) and periodic polling ("Live Mode").

- **Endpoint:** `POST /api/hackathons/get-plant-location-data`
- **Response:** Returns an array of GeoJSON-compatible plant objects.

---

## 📸 Usage Guide

### 1. The Map Board (Command Center)

- **Navigation:** Use the top-right controls to Zoom, Tilt, and Geolocate.
- **Clustering:** Zoom out to see grouped "bubbles." Click a cluster to zoom in.
  <img width="3358" height="2098" alt="image" src="https://github.com/user-attachments/assets/250de47f-8e87-42cf-904d-621525cab72d" />

- **Filtering:** Use the **Time Slider** at the bottom to filter crops by planting date.
<img width="3360" height="2100" alt="image" src="https://github.com/user-attachments/assets/0e33e61e-51f8-449b-aef1-9e7042880a72" />


### 2. Adding Data (Offline Capable)

1. Click the **"Upload Plant"** button (or drag & drop).
2. The AI will auto-analyze the image for pests/diseases.
3. Click **Upload**.

- _If Online:_ It syncs instantly.
- _If Offline:_ It enters the **Sync Queue** (Yellow Badge) and auto-uploads later.
<img width="3360" height="2100" alt="image" src="https://github.com/user-attachments/assets/21afb917-edef-4314-a251-15c25921c8f4" />
<img width="3360" height="2100" alt="image" src="https://github.com/user-attachments/assets/edca11e4-df26-4814-9126-a94de3d493eb" />



### 3. Analytics & Tools

- **Draw Tool:** Click the Hexagon icon to draw a field boundary. The app will calculate how many plants are inside that specific zone.
<img width="3360" height="2100" alt="image" src="https://github.com/user-attachments/assets/ba471e35-c09d-456e-a23c-17fcd7d43c69" />

- **Inventory:** Open the sidebar to see a virtualized list of all crops.
<img width="3352" height="2086" alt="image" src="https://github.com/user-attachments/assets/ec434cc4-a63a-4fc1-9b31-f605ab1d1819" />

- **Comparison:** Click a plant, then check "Location History" to launch the **Split-Screen Slider**.
<img width="3360" height="2100" alt="image" src="https://github.com/user-attachments/assets/f1d6556a-dc98-46db-b918-23455a5b7c6e" />

- **Stats & Analytics:** Open the dashboard to view real-time insights, including crop health distribution, top crops, and activity trends across your data points.
<img width="3360" height="2100" alt="image" src="https://github.com/user-attachments/assets/6aa2dfae-d197-4acb-9e30-13fa8248a7bf" />


---

## 🔧 Installation & Setup

1. **Clone the repository**

```bash
git clone https://github.com/your-username/fasal-drishti.git
cd fasal-drishti

```

2. **Install Dependencies**

```bash
npm install

```

3. **Environment Setup**
   Create a `.env` file in the root:

```env
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
VITE_API_URL=https://api.alumnx.com/api/hackathons

```

4. **Run Development Server**

```bash
npm run dev

```

5. **Run Tests**

```bash
npm test

```

---

## 📂 Project Structure

```bash
src/
├── components/        # Reusable UI (Buttons, Modals, Tooltips)
├── features/
│   ├── map/           # Core Map Logic (MapBoard, Clusters, Layers)
│   ├── inventory/     # List Views & Virtualization
│   └── analytics/     # Charts & Stats Overlay
├── services/          # API Layer (Axios interceptors)
├── store/             # Redux Slices, Thunks, & Middleware
├── types/             # TypeScript Interfaces (Plant, User, SyncStatus)
├── utils/             # Helpers (CSV Export, Date Formatting, Turf.js)
└── App.tsx            # Root Component

```

---
