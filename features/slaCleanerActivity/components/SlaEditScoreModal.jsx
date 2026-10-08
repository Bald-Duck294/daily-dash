"use client";

import { useState, useRef } from "react";
import { X } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import toast from "react-hot-toast";

/**
 * Score override / edit modal for SLA cleaning activity attempts
 */
export default function SlaEditScoreModal({
  isOpen,
  attempt,
  onClose,
  onSubmit,
  isPending,
}) {
  const [newScore, setNewScore] = useState(
    attempt?.score !== null && attempt?.score !== undefined ? String(attempt.score) : ""
  );
  const [modificationComment, setModificationComment] = useState("");
  const [signatureType, setSignatureType] = useState("draw");
  const [signatureFile, setSignatureFile] = useState(null);
  const signatureCanvasRef = useRef(null);

  if (!isOpen || !attempt) return null;

  const handleSave = async () => {
    if (newScore === "" || isNaN(Number(newScore)) || Number(newScore) < 0 || Number(newScore) > 10) {
      toast.error("Please enter a valid score between 0 and 10.");
      return;
    }

    if (!modificationComment.trim()) {
      toast.error("Comment is required to update the score.");
      return;
    }

    let finalSignatureFile = null;

    if (signatureType === "draw") {
      if (!signatureCanvasRef.current || signatureCanvasRef.current.isEmpty()) {
        toast.error("Signature is required to update the score.");
        return;
      }
      const dataUrl = signatureCanvasRef.current.getTrimmedCanvas().toDataURL("image/png");
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      finalSignatureFile = new File([blob], "signature.png", { type: "image/png" });
    } else {
      if (!signatureFile) {
        toast.error("Signature file is required to update the score.");
        return;
      }
      finalSignatureFile = signatureFile;
    }

    const formData = new FormData();
    formData.append("score", newScore);
    formData.append("modification_comment", modificationComment);
    formData.append("signature", finalSignatureFile);

    onSubmit({
      reviewId: attempt.review_id || attempt.id,
      formData,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-background text-foreground rounded-xl shadow-2xl w-full max-w-md border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h2 className="text-base font-bold">Update Activity Score</h2>
            <p className="text-xs text-muted-foreground">{attempt.label || "Attempt"}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition cursor-pointer p-1 rounded-md hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Please provide the updated score for this cleaning inspection.
            Updates will re-evaluate SLA status and log an audit trail.
          </p>

          <div>
            <label className="block text-xs font-semibold mb-1 text-foreground">
              New Score (0-10) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm bg-muted/30 focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="e.g. 8.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-foreground">
              Modification Comment *
            </label>
            <textarea
              value={modificationComment}
              onChange={(e) => setModificationComment(e.target.value)}
              className="w-full border rounded-lg p-2.5 text-sm bg-muted/30 focus:ring-2 focus:ring-primary focus:outline-none min-h-[75px]"
              placeholder="Reason for updating score..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-foreground">
              Signature *
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                  signatureType === "draw"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted text-muted-foreground"
                }`}
                onClick={() => setSignatureType("draw")}
              >
                Draw
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                  signatureType === "upload"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted text-muted-foreground"
                }`}
                onClick={() => setSignatureType("upload")}
              >
                Upload
              </button>
            </div>

            {signatureType === "draw" ? (
              <div className="border rounded-lg bg-white text-black flex flex-col">
                <SignatureCanvas
                  ref={signatureCanvasRef}
                  penColor="black"
                  canvasProps={{ className: "w-full h-28 cursor-crosshair rounded-t-lg" }}
                />
                <div className="flex justify-end p-1 border-t bg-gray-50 rounded-b-lg">
                  <button
                    type="button"
                    onClick={() => signatureCanvasRef.current?.clear()}
                    className="text-xs text-red-600 hover:text-red-700 px-2 py-0.5 cursor-pointer font-medium"
                  >
                    Clear Signature
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSignatureFile(e.target.files[0])}
                  className="w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t bg-muted/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold border rounded-lg hover:bg-muted cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-primary hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "Saving..." : "Save Score"}
          </button>
        </div>
      </div>
    </div>
  );
}
