"use client";
import React, { useState, useMemo } from "react";
import { useCleanerReviewPhotos } from "@/features/photo/photo.queries";
import { groupPhotosByRecordId } from "@/shared/utils/imageHelpers";
import PhotoFilters from "./PhotoFilters";
import PhotoCard from "./PhotoCard";
import BeforeAfterComparison from "./BeforeAfterComparison";
import ImagePreviewModal from "./ImagePreviewModal";
import BulkDownloadToolbar from "./BulkDownloadToolbar";
import { Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";

export default function PhotoManagement() {
  // 1. ADDED: page and limit to the initial filter state
  const [filters, setFilters] = useState({
    search: "",
    company: "all",
    location: "all",
    imageType: "all",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 20
  });

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState(null);

  const { 
    data: queryResult, 
    isLoading, 
    isFetching, // Helpful to show background loading state during page transitions
    isError, 
    error 
  } = useCleanerReviewPhotos(filters);

  const photos = queryResult?.data || [];
  
  // 2. ADDED: Extract the pagination object from the query result
  const pagination = queryResult?.pagination || { 
    current_page: 1, 
    total_pages: 1, 
    total_records: 0 
  };

  const pairedPhotos = useMemo(() => {
    if (filters.imageType === "pairs") return groupPhotosByRecordId(photos);
    return [];
  }, [photos, filters.imageType]);

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allIds = new Set(photos.map(p => p.id));
    setSelectedIds(allIds);
  };

  const handleClearSelection = () => setSelectedIds(new Set());

  const handleNavigatePreview = (direction) => {
    if (previewPhotoIndex === null) return;
    let newIndex = direction === "next" ? previewPhotoIndex + 1 : previewPhotoIndex - 1;
    if (newIndex < 0) newIndex = photos.length - 1;
    if (newIndex >= photos.length) newIndex = 0;
    setPreviewPhotoIndex(newIndex);
  };

  // 3. ADDED: Pagination Handlers
  const handleNextPage = () => {
    if (filters.page < pagination.total_pages) {
      setFilters(prev => ({ ...prev, page: prev.page + 1 }));
      // Optional: Scroll to top of the grid when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (filters.page > 1) {
      setFilters(prev => ({ ...prev, page: prev.page - 1 }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 min-h-full pb-24">
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Super Admin Photo Management</h1>
            {/* UPDATED to show total records across all pages */}
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Records: {pagination.total_records}</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 relative">
        <div className="max-w-7xl mx-auto">
          <PhotoFilters filters={filters} setFilters={setFilters} />

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-800 aspect-[4/3] rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800 mt-6">
              {error?.message || "Failed to load images. Please try again."}
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-20 text-gray-500 dark:text-gray-400 flex flex-col items-center border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800/50 mt-6">
              <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No images found</p>
              <p className="text-sm mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              {/* Photo Grid (Dims slightly while fetching new pages) */}
              <div className={`transition-opacity duration-200 ${isFetching ? 'opacity-50' : 'opacity-100'} ${filters.imageType === "pairs" ? "flex flex-col gap-6" : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"}`}>
                {filters.imageType === "pairs" ? (
                  pairedPhotos.map((pair) => (
                    <BeforeAfterComparison 
                      key={pair.cleaning_record_id} 
                      pair={pair} 
                      selectedIds={selectedIds}
                      onToggleSelect={handleToggleSelect}
                      onClickView={(photo) => setPreviewPhotoIndex(photos.findIndex(p => p.id === photo.id))}
                    />
                  ))
                ) : (
                  photos.map((photo, index) => (
                    <PhotoCard 
                      key={photo.id} 
                      photo={photo} 
                      isSelected={selectedIds.has(photo.id)}
                      onToggleSelect={handleToggleSelect}
                      onClickView={() => setPreviewPhotoIndex(index)}
                    />
                  ))
                )}
              </div>

              {/* 4. ADDED: Pagination Controls */}
              {pagination.total_pages > 1 && (
                <div className="flex flex-col md:flex-row justify-between items-center mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Showing Page {pagination.current_page} of {pagination.total_pages}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handlePrevPage} 
                      disabled={filters.page <= 1 || isFetching}
                      className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    
                    <button 
                      onClick={handleNextPage} 
                      disabled={filters.page >= pagination.total_pages || isFetching}
                      className="flex items-center gap-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Utilities */}
      <BulkDownloadToolbar 
        selectedCount={selectedIds.size}
        selectedPhotos={photos.filter(p => selectedIds.has(p.id))}
        onClear={handleClearSelection}
        onSelectAll={handleSelectAll}
      />

      {previewPhotoIndex !== null && (
        <ImagePreviewModal 
          photo={photos[previewPhotoIndex]} 
          photosList={photos}
          onClose={() => setPreviewPhotoIndex(null)}
          onNavigate={handleNavigatePreview}
        />
      )}
    </div>
  );
}