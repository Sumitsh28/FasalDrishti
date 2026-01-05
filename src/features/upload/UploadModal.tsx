import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  X,
  UploadCloud,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  Bug,
  AlertTriangle,
  Droplets,
  Sparkles,
  ScanEye,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { uploadPlant } from "../../store/plantsSlice";
import { analyzePlantWithAI } from "../../services/openai";
import type { Plant } from "../../types";
import { toast } from "sonner";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HEALTH_OPTIONS = [
  {
    id: "healthy",
    label: "Healthy",
    icon: CheckCircle2,
    color:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    ring: "ring-green-500",
  },
  {
    id: "pest",
    label: "Pest",
    icon: Bug,
    color:
      "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    ring: "ring-yellow-500",
  },
  {
    id: "disease",
    label: "Disease",
    icon: AlertTriangle,
    color:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    ring: "ring-red-500",
  },
  {
    id: "water-stress",
    label: "Water",
    icon: Droplets,
    color:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    ring: "ring-blue-500",
  },
] as const;

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.plants.loading);

  const [preview, setPreview] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [healthStatus, setHealthStatus] =
    useState<Plant["healthStatus"]>("healthy");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<string | null>(null);
  const [detectedPlant, setDetectedPlant] = useState<string | null>(null);
  const [aiConfidence, setAiConfidence] = useState<number>(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileToUpload(file);
      setPreview(URL.createObjectURL(file));
      setAiDiagnosis(null);
      setDetectedPlant(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
    maxFiles: 1,
  });

  const handleAIAnalyze = async () => {
    if (!fileToUpload) return;

    setIsAnalyzing(true);
    setAiDiagnosis(null);

    try {
      const result = await analyzePlantWithAI(fileToUpload);

      if (result.healthStatus !== "error") {
        setHealthStatus(result.healthStatus);
        setDetectedPlant(result.plantName);
        setAiDiagnosis(result.diagnosis);
        setAiConfidence(result.confidence);
        toast.success(`Detected: ${result.plantName}`, {
          description: `AI Confidence: ${result.confidence}%`,
        });
      } else {
        toast.error("Could not identify a plant in this image.");
      }
    } catch (error) {
      console.error(error);
      toast.error("AI Analysis failed. Please select manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpload = async () => {
    if (!fileToUpload) return;

    const resultAction = await dispatch(
      uploadPlant({
        file: fileToUpload,
        healthStatus,
        detectedPlant: detectedPlant || undefined,
        aiDiagnosis: aiDiagnosis || undefined,
        confidence: aiConfidence,
      })
    );

    if (uploadPlant.fulfilled.match(resultAction)) {
      onClose();
      setPreview(null);
      setFileToUpload(null);
      setHealthStatus("healthy");
      setAiDiagnosis(null);
      setDetectedPlant(null);
      setAiConfidence(0);
    } else {
      alert("Upload failed: " + resultAction.payload);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Add New Plant
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {!preview ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-gray-300 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-500 hover:bg-gray-50 dark:hover:bg-slate-800/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Click or drag image to upload
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 shadow-sm group">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                  setFileToUpload(null);
                }}
                className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-black/50 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:text-white shadow-sm transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {!aiDiagnosis && !isAnalyzing && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleAIAnalyze}
                    className="bg-black/75 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-black transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    Analyze with AI
                  </button>
                </div>
              )}
            </div>

            {(isAnalyzing || aiDiagnosis) && (
              <div
                className={`p-4 rounded-lg border ${
                  aiDiagnosis
                    ? "bg-indigo-50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800"
                    : "bg-gray-50 border-gray-100 dark:bg-slate-800 dark:border-slate-700"
                }`}
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium animate-pulse">
                      Analyzing leaf patterns...
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                      <span className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                        AI Analysis Complete
                      </span>
                    </div>
                    <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed">
                      <span className="font-semibold text-indigo-900 dark:text-indigo-100">
                        Detected {detectedPlant}:
                      </span>{" "}
                      {aiDiagnosis}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Crop Health Status
            </label>
            {fileToUpload && !aiDiagnosis && !isAnalyzing && (
              <button
                onClick={handleAIAnalyze}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:underline"
              >
                <ScanEye className="w-3 h-3" /> Auto-Detect
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {HEALTH_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setHealthStatus(option.id as any)}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                  healthStatus === option.id
                    ? `${option.color} border-transparent ring-2 ${option.ring}`
                    : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700"
                }`}
              >
                <option.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleUpload}
            disabled={!fileToUpload || isLoading || isAnalyzing}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-white transition-all ${
              !fileToUpload || isLoading || isAnalyzing
                ? "bg-gray-400 dark:bg-slate-700 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl active:scale-95"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5" />
                <span>Upload Plant</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
