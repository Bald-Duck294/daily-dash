import React, { useState, useRef } from "react";
import { X, Download, Loader2, Image as ImageIcon, FileText, Archive } from "lucide-react";
import { useDownloadLocationQRs } from "@/features/locations/locations.queries";
import toast from "react-hot-toast";
import WashroomStandeePoster from "./WashroomStandeePoster";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";

const QRDownloadOptionsModal = ({ isOpen, onClose, location }) => {
  const [downloadType, setDownloadType] = useState("png");
  const [isExporting, setIsExporting] = useState(false);
  const posterRef = useRef(null);
  const { mutate: downloadQRs, isPending } = useDownloadLocationQRs();

  if (!isOpen || !location) return null;

  const handleDownload = async () => {
    if (downloadType === "zip") {
      // Legacy ZIP export from backend
      downloadQRs(
        { id: location.id, downloadType: "both", name: location.name },
        {
          onSuccess: () => {
            toast.success("ZIP downloaded successfully!");
            onClose();
          },
          onError: (error) => {
            toast.error(error.message || "Failed to download ZIP");
          }
        }
      );
      return;
    }

    if (!posterRef.current) return;

    try {
      setIsExporting(true);
      toast.loading("Generating high-quality standee...", { id: "export-toast" });
      
      const element = posterRef.current;
      
      // We render at 3x scale for high resolution
      const dataUrl = await htmlToImage.toPng(element, { 
        quality: 1.0, 
        pixelRatio: 2,
        // Optional: filter out any UI controls if added later
      });

      const stationName = (location?.name || 'station').replace(/\s+/g, '_');
      const orgName = (location?.companies?.name || location?.company?.name || 'organization').replace(/\s+/g, '_');
      const filenameBase = `${stationName}_qr_code_${orgName}`;

      if (downloadType === "png") {
        const link = document.createElement("a");
        link.download = `${filenameBase}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("PNG downloaded successfully!", { id: "export-toast" });
      } else if (downloadType === "pdf") {
        // A4 size is 210x297 mm
        // We will scale our 736x1104 image to fit nicely within A4 while keeping ratio
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4"
        });
        
        // A4 dimensions: 210x297
        // Image ratio: 736 / 1104 = 0.666
        // Let's make it almost fill the page, e.g., 180mm width
        const pdfWidth = 190;
        const pdfHeight = (1448 / 1086) * pdfWidth; 
        
        const xOffset = (210 - pdfWidth) / 2;
        const yOffset = (297 - pdfHeight) / 2;

        pdf.addImage(dataUrl, 'PNG', xOffset, yOffset, pdfWidth, pdfHeight);
        pdf.save(`${filenameBase}.pdf`);
        toast.success("PDF downloaded successfully!", { id: "export-toast" });
      }
      
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate standee", { id: "export-toast" });
    } finally {
      setIsExporting(false);
    }
  };

  const isLoading = isPending || isExporting;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="w-full max-w-5xl rounded-2xl p-6 shadow-xl flex flex-col md:flex-row gap-8 items-start my-8 mt-12 md:mt-auto md:mb-auto"
        style={{
          background: "var(--washroom-surface)",
          border: "1px solid var(--washroom-border)",
        }}
      >
        {/* Hidden High-Res Template for Export */}
        <div className="fixed opacity-0 pointer-events-none -z-50" style={{ left: '-9999px', top: '-9999px' }}>
          <div style={{ width: '1086px', height: '1448px' }}>
            <WashroomStandeePoster ref={posterRef} location={location} />
          </div>
        </div>

        {/* Left Side: Live Preview */}
        <div className="flex-1 w-full bg-gray-50 dark:bg-gray-900 rounded-xl p-6 flex flex-col items-center justify-center border border-gray-200 dark:border-gray-800 relative">
          <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider w-full text-left">Live Preview</h3>
          
          {/* Responsive Preview Container */}
          <div className="w-full max-w-[368px] mx-auto shadow-sm rounded-md overflow-hidden">
             <WashroomStandeePoster location={location} />
          </div>
        </div>

        {/* Right Side: Options */}
        <div className="flex-1 w-full flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold" style={{ color: "var(--washroom-title)" }}>
              Download Standee
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={20} style={{ color: "var(--washroom-subtitle)" }} />
            </button>
          </div>

          <p className="mb-8 text-base" style={{ color: "var(--washroom-subtitle)" }}>
            Select export format for <strong>{location.name}</strong>:
          </p>

          <div className="space-y-4 mb-10 flex-1">
            <label className="flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                   style={{ borderColor: downloadType === 'png' ? 'var(--washroom-primary)' : 'var(--washroom-border)' }}>
              <input 
                type="radio" 
                name="downloadType" 
                value="png"
                checked={downloadType === "png"}
                onChange={() => setDownloadType("png")}
                className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon size={18} className="text-blue-500" />
                  <div className="font-bold text-lg" style={{ color: "var(--washroom-text)" }}>High-Res Image (PNG)</div>
                </div>
                <div className="text-sm" style={{ color: "var(--washroom-subtitle)" }}>Best for acrylic standees, laminations, and sharing digitally. Generates a 300 DPI ready image.</div>
              </div>
            </label>

            <label className="flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                   style={{ borderColor: downloadType === 'pdf' ? 'var(--washroom-primary)' : 'var(--washroom-border)' }}>
              <input 
                type="radio" 
                name="downloadType" 
                value="pdf"
                checked={downloadType === "pdf"}
                onChange={() => setDownloadType("pdf")}
                className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={18} className="text-red-500" />
                  <div className="font-bold text-lg" style={{ color: "var(--washroom-text)" }}>Print-Ready Document (PDF)</div>
                </div>
                <div className="text-sm" style={{ color: "var(--washroom-subtitle)" }}>Best for direct printing. Perfectly scaled for standard A4 paper size.</div>
              </div>
            </label>

            <label className="flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                   style={{ borderColor: downloadType === 'zip' ? 'var(--washroom-primary)' : 'var(--washroom-border)' }}>
              <input 
                type="radio" 
                name="downloadType" 
                value="zip"
                checked={downloadType === "zip"}
                onChange={() => setDownloadType("zip")}
                className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Archive size={18} className="text-gray-500" />
                  <div className="font-bold text-lg" style={{ color: "var(--washroom-text)" }}>Raw QR Codes (ZIP)</div>
                </div>
                <div className="text-sm" style={{ color: "var(--washroom-subtitle)" }}>Legacy option. Downloads raw QR code images for the washroom and its usage categories.</div>
              </div>
            </label>
          </div>

          <div className="flex gap-4 justify-end mt-auto pt-6 border-t dark:border-gray-800">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-semibold transition-colors"
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
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
              style={{ background: "var(--washroom-primary)" }}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isLoading ? "Generating..." : "Download Standee"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRDownloadOptionsModal;
