import React, { useState } from "react";
import { X, Download, Loader2 } from "lucide-react";
import { useDownloadLocationQRs } from "@/features/locations/locations.queries";
import toast from "react-hot-toast";

const QRDownloadOptionsModal = ({ isOpen, onClose, location }) => {
  const [downloadType, setDownloadType] = useState("both");
  const { mutate: downloadQRs, isPending } = useDownloadLocationQRs();

  if (!isOpen || !location) return null;

  const handleDownload = () => {
    downloadQRs(
      { id: location.id, downloadType, name: location.name },
      {
        onSuccess: () => {
          toast.success("QR codes downloaded successfully!");
          onClose();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to download QR codes");
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-md rounded-2xl p-6 shadow-xl"
        style={{
          background: "var(--washroom-surface)",
          border: "1px solid var(--washroom-border)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: "var(--washroom-title)" }}>
            Download QR Codes
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} style={{ color: "var(--washroom-subtitle)" }} />
          </button>
        </div>

        <p className="mb-6 text-sm" style={{ color: "var(--washroom-subtitle)" }}>
          Select what you want to download for <strong>{location.name}</strong>:
        </p>

        <div className="space-y-3 mb-8">
          <label className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                 style={{ borderColor: downloadType === 'both' ? 'var(--washroom-primary)' : 'var(--washroom-border)' }}>
            <input 
              type="radio" 
              name="downloadType" 
              value="both"
              checked={downloadType === "both"}
              onChange={() => setDownloadType("both")}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="font-semibold" style={{ color: "var(--washroom-text)" }}>Download Both (ZIP)</div>
              <div className="text-xs" style={{ color: "var(--washroom-subtitle)" }}>Main washroom QR and all usage category QRs</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                 style={{ borderColor: downloadType === 'washroom_only' ? 'var(--washroom-primary)' : 'var(--washroom-border)' }}>
            <input 
              type="radio" 
              name="downloadType" 
              value="washroom_only"
              checked={downloadType === "washroom_only"}
              onChange={() => setDownloadType("washroom_only")}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="font-semibold" style={{ color: "var(--washroom-text)" }}>Main Washroom Only (PNG)</div>
              <div className="text-xs" style={{ color: "var(--washroom-subtitle)" }}>Single QR code for the main washroom</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                 style={{ borderColor: downloadType === 'usage_category_only' ? 'var(--washroom-primary)' : 'var(--washroom-border)' }}>
            <input 
              type="radio" 
              name="downloadType" 
              value="usage_category_only"
              checked={downloadType === "usage_category_only"}
              onChange={() => setDownloadType("usage_category_only")}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="font-semibold" style={{ color: "var(--washroom-text)" }}>Usage Categories Only (ZIP)</div>
              <div className="text-xs" style={{ color: "var(--washroom-subtitle)" }}>Only individual unit QR codes (e.g. wc_1, indian_2)</div>
            </div>
          </label>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold transition-colors"
            style={{ 
              color: "var(--washroom-text)", 
              background: "transparent",
              border: "1px solid var(--washroom-border)"
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
            style={{ background: "var(--washroom-primary)" }}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isPending ? "Downloading..." : "Download"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRDownloadOptionsModal;
