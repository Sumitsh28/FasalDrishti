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
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { uploadPlant } from "../../store/plantsSlice";
import type { Plant } from "../../types";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HEALTH_OPTIONS = [
  {
    id: "healthy",
    label: "Healthy",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-700 border-green-200",
    ring: "ring-green-500",
  },
  {
    id: "pest",
    label: "Pest",
    icon: Bug,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    ring: "ring-yellow-500",
  },
  {
    id: "disease",
    label: "Disease",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-700 border-red-200",
    ring: "ring-red-500",
  },
  {
    id: "water-stress",
    label: "Water",
    icon: Droplets,
    color: "bg-blue-100 text-blue-700 border-blue-200",
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileToUpload(file);
      setPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png"] },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!fileToUpload) return;

    const resultAction = await dispatch(
      uploadPlant({
        file: fileToUpload,
        healthStatus,
      })
    );

    if (uploadPlant.fulfilled.match(resultAction)) {
      onClose();
      setPreview(null);
      setFileToUpload(null);
      setHealthStatus("healthy");
    } else {
      alert("Upload failed: " + resultAction.payload);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add New Plant</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {!preview ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-green-400"
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-green-100 rounded-full text-green-600">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-gray-600">
                {isDragActive
                  ? "Drop the plant image here"
                  : "Click or drag image to upload"}
              </p>
              <p className="text-xs text-gray-400">JPG or PNG (Max 10MB)</p>
            </div>
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm">
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
              className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="mt-6">
          <label className="text-sm font-semibold text-gray-700 mb-3 block">
            Crop Health Status
          </label>
          <div className="grid grid-cols-2 gap-3">
            {HEALTH_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setHealthStatus(option.id as any)}
                className={`
                  flex items-center gap-2 p-3 rounded-lg border transition-all
                  ${
                    healthStatus === option.id
                      ? `${option.color} border-transparent ring-2 ${option.ring}`
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }
                `}
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
            className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!fileToUpload || isLoading}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-white transition-all
              ${
                !fileToUpload || isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl active:scale-95"
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ImageIcon className="w-5 h-5" />
                Upload Plant
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
