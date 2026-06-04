"use client";
import React, { useState } from "react";
import { Download, XSquare, CheckSquare, Loader2 } from "lucide-react";
import { downloadImagesAsZip } from "@/shared/utils/zipDownload";

export default function BulkDownloadToolbar({ selectedCount, selectedPhotos, onClear, onSelectAll }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  if (selectedCount === 0) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    setProgress(0);
    try {
      await downloadImagesAsZip(selectedPhotos, setProgress);
    } catch (error) {
      alert("Failed to download ZIP file.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-8 duration-300">
      <div className="bg-gray-900 dark:bg-gray-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-gray-700">
        <div className="flex flex-col">
          <span className="font-semibold text-lg">{selectedCount} Images Selected</span>
          {isDownloading && <span className="text-xs text-blue-400">Archiving... {progress}%</span>}
        </div>
        
        <div className="h-8 w-px bg-gray-700"></div>
        
        <div className="flex items-center gap-3">
          <button onClick={onSelectAll} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <CheckSquare className="w-4 h-4" /> Select All
          </button>
          <button onClick={onClear} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors text-red-400">
            <XSquare className="w-4 h-4" /> Clear
          </button>
          <button 
            onClick={handleDownload} 
            disabled={isDownloading}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg font-medium transition-colors ml-2"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download ZIP
          </button>
        </div>
      </div>
    </div>
  );
}