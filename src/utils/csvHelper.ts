import type { Plant } from "../types";

export const downloadPlantsCSV = (
  plants: Plant[],
  filename = "farm-data.csv"
) => {
  if (!plants || plants.length === 0) {
    return;
  }

  const headers = [
    "Plant ID",
    "Date Captured",
    "Latitude",
    "Longitude",
    "Health Status",
    "AI Detected Crop",
    "AI Diagnosis",
    "Confidence Score",
    "Image URL",
  ];

  const rows = plants.map((p) => [
    p.id,
    p.createdAt ? new Date(p.createdAt).toLocaleString() : "N/A",
    p.latitude,
    p.longitude,
    p.healthStatus || "Unknown",
    p.detectedPlant || "N/A",
    `"${(p.aiDiagnosis || "").replace(/"/g, '""')}"`,
    p.confidence ? `${p.confidence}%` : "N/A",
    p.imageUrl,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n"
  );

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
