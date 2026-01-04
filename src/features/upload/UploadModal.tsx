import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { X, UploadCloud, Loader2, Image as ImageIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { uploadPlant } from "../../store/plantsSlice";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((state) => state.plants.loading);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

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

    const resultAction = await dispatch(uploadPlant({ file: fileToUpload }));

    if (uploadPlant.fulfilled.match(resultAction)) {
      onClose();
      setPreview(null);
      setFileToUpload(null);
    } else {
      alert("Upload failed: " + resultAction.payload);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in duration-200">
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
                  ? "border-farm-500 bg-farm-50"
                  : "border-gray-300 hover:border-farm-400"
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-farm-100 rounded-full text-farm-600">
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
          <div className="relative rounded-lg overflow-hidden border border-gray-200">
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
              className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!fileToUpload || isLoading}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-white transition-all
              ${
                !fileToUpload || isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-farm-600 hover:bg-farm-700 shadow-md hover:shadow-lg"
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
