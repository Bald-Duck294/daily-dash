import React, { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { X, Upload, Edit3, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function ModifyScoreModal({
  isOpen,
  onClose,
  currentScore,
  onSave,
  isSaving,
}) {
  const [score, setScore] = useState(currentScore || 0);
  const [comment, setComment] = useState("");
  const [signatureMode, setSignatureMode] = useState("draw"); // "draw" | "upload"
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);

  const sigCanvasRef = useRef(null);

  if (!isOpen) return null;

  const handleClearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSignatureFile(file);
      setSignaturePreview(URL.createObjectURL(file));
    }
  };

  const dataURLtoBlob = (dataurl) => {
    let arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleSubmit = () => {
    if (score < 0 || score > 10) {
      return toast.error("Score must be between 0 and 10.");
    }
    if (!comment.trim()) {
      return toast.error("Modification comment is required.");
    }

    let signatureToUpload = null;

    if (signatureMode === "draw") {
      if (sigCanvasRef.current && sigCanvasRef.current.isEmpty()) {
        return toast.error("Signature is required.");
      }
      const dataURL = sigCanvasRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
      signatureToUpload = dataURLtoBlob(dataURL);
    } else {
      if (!signatureFile) {
        return toast.error("Signature image is required.");
      }
      signatureToUpload = signatureFile;
    }

    onSave(score, comment, signatureToUpload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg bg-[var(--cleaner-surface)] rounded-xl shadow-lg border border-[var(--cleaner-border)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--cleaner-border)]">
          <h2 className="text-lg font-bold text-[var(--cleaner-title)]">
            Modify Score
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--cleaner-subtitle)] hover:bg-[var(--cleaner-input-bg)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Score Input */}
          <div>
            <label className="block text-sm font-medium text-[var(--cleaner-title)] mb-1">
              New Score (0-10) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full p-2 rounded-lg text-sm bg-[var(--cleaner-input-bg)] border border-[var(--cleaner-input-border)] text-[var(--cleaner-input-text)] outline-none"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-[var(--cleaner-title)] mb-1">
              Reason for modification <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explain why the score is being changed..."
              className="w-full p-2 rounded-lg text-sm bg-[var(--cleaner-input-bg)] border border-[var(--cleaner-input-border)] text-[var(--cleaner-input-text)] outline-none resize-none"
            />
          </div>

          {/* Signature */}
          <div>
            <label className="block text-sm font-medium text-[var(--cleaner-title)] mb-2">
              Signature <span className="text-red-500">*</span>
            </label>

            {/* Tabs */}
            <div className="flex gap-2 mb-3 bg-[var(--cleaner-input-bg)] p-1 rounded-lg">
              <button
                onClick={() => setSignatureMode("draw")}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition ${
                  signatureMode === "draw"
                    ? "bg-[var(--cleaner-primary-bg)] text-[var(--cleaner-primary-text)]"
                    : "text-[var(--cleaner-subtitle)]"
                }`}
              >
                <Edit3 size={14} /> Draw
              </button>
              <button
                onClick={() => setSignatureMode("upload")}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition ${
                  signatureMode === "upload"
                    ? "bg-[var(--cleaner-primary-bg)] text-[var(--cleaner-primary-text)]"
                    : "text-[var(--cleaner-subtitle)]"
                }`}
              >
                <Upload size={14} /> Upload
              </button>
            </div>

            {/* Content */}
            {signatureMode === "draw" ? (
              <div className="space-y-2">
                <div className="border border-[var(--cleaner-input-border)] bg-[var(--cleaner-input-bg)] rounded-lg overflow-hidden relative">
                  <SignatureCanvas
                    ref={sigCanvasRef}
                    penColor="black"
                    canvasProps={{
                      className: "w-full h-40 bg-white cursor-crosshair",
                    }}
                  />
                </div>
                <button
                  onClick={handleClearSignature}
                  className="text-xs text-red-500 font-medium hover:underline"
                >
                  Clear Signature
                </button>
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-[var(--cleaner-input-border)] rounded-lg p-6 flex flex-col items-center justify-center gap-2 overflow-hidden hover:bg-[var(--cleaner-input-bg)] transition-colors">
                {signaturePreview ? (
                  <div className="relative w-full flex justify-center">
                    <img
                      src={signaturePreview}
                      alt="Signature Preview"
                      className="h-32 object-contain rounded"
                    />
                    <button
                      onClick={() => {
                        setSignatureFile(null);
                        setSignaturePreview(null);
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload
                      size={24}
                      className="text-[var(--cleaner-subtitle)]"
                    />
                    <p className="text-sm text-[var(--cleaner-subtitle)]">
                      Click to upload signature
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--cleaner-border)] flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--cleaner-input-bg)] text-[var(--cleaner-title)] border border-[var(--cleaner-border)] hover:bg-[var(--cleaner-border)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--cleaner-primary-bg)] text-[var(--cleaner-primary-text)] flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            {isSaving ? (
              <span className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"></span>
            ) : (
              <Save size={16} />
            )}
            {isSaving ? "Saving..." : "Save Score"}
          </button>
        </div>
      </div>
    </div>
  );
}
