"use client";
import React, { useState, useMemo } from "react";
import { useCleanerReviewPhotos } from "@/features/photo/photo.queries";
import PhotoFilters from "./PhotoFilters";
import PhotoCard from "./PhotoCard";
import ImagePreviewModal from "./ImagePreviewModal";
import BulkDownloadToolbar from "./BulkDownloadToolbar";
import { Image as ImageIcon, ChevronLeft, ChevronRight, Download } from "lucide-react";

export default function PhotoManagement() {
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
    isFetching,
    isError, 
    error 
  } = useCleanerReviewPhotos(filters);

  const photos = queryResult?.data || [];
  
  const pagination = queryResult?.pagination || { 
    current_page: 1, 
    total_pages: 1, 
    total_records: 0 
  };

  // Group photos dynamically by Record ID (or Date + Location) REGARDLESS of the filter selected
  const groupedPhotosList = useMemo(() => {
    if (!photos || photos.length === 0) return [];
    
    const groups = {};
    
    photos.forEach(photo => {
      // Create a unique key for each cleaning session
      const dateOnly = photo.uploaded_at ? photo.uploaded_at.split('T')[0] : 'unknown-date';
      const groupKey = photo.cleaning_record_id || `${photo.location_name}-${dateOnly}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          id: groupKey,
          samplePhoto: photo, // Keep one photo to extract the Header info (Date, Location, etc.)
          items: []
        };
      }
      groups[groupKey].items.push(photo);
    });
    
    return Object.values(groups);
  }, [photos]);

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

  const handleNextPage = () => {
    if (filters.page < pagination.total_pages) {
      setFilters(prev => ({ ...prev, page: prev.page + 1 }));
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
    <div className="flex flex-col bg-gray-50 dark:bg-gray-100 min-h-full pb-24">
      
      {/* Header */}
   {/* Updated Header containing Title, Stats, and Filters */}
   {/* Header */}
      <header className="bg-white dark:bg-white border-b border-gray-200 px-6 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-6 shrink-0">
        
        {/* Left Side: Title and Stats */}
        <div className="shrink-0">
          <h1 className="text-2xl font-bold text-gray-900">Photo Gallery Management</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <span>Total Photos: <strong className="text-gray-900 font-semibold">{pagination.total_records || "0"}</strong></span>
            <span>Organizations: <strong className="text-gray-900 font-semibold">84</strong></span>
            <span>Locations: <strong className="text-gray-900 font-semibold">312</strong></span>
          </div>
        </div>

        {/* Right Side: Filters */}
        <div className="w-full xl:w-auto xl:flex-1 max-w-5xl flex xl:justify-end">
          <div className="w-full">
            <PhotoFilters filters={filters} setFilters={setFilters} />
          </div>
        </div>
        
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 relative">
        <div className="max-w-[1800px] mx-auto">
          {/* <PhotoFilters filters={filters} setFilters={setFilters} /> */}

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 xl:grid-cols-10 gap-3 mt-6">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-300 aspect-[4/5] rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-red-500 bg-red-50 rounded-2xl border border-red-200 mt-6">
              {error?.message || "Failed to load images. Please try again."}
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-20 text-gray-500 flex flex-col items-center border border-dashed border-gray-300 rounded-2xl bg-white mt-6">
              <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No images found</p>
              <p className="text-sm mt-1">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className={`transition-opacity duration-200 ${isFetching ? 'opacity-50' : 'opacity-100'} mt-8`}>
              
              {/* Grouped View Layout (Matches Screenshot Exactly) */}
              <div className="flex flex-col gap-12">
                {groupedPhotosList.map((group, groupIndex) => {
                  const samplePhoto = group.samplePhoto;
                  
                  // Format Date & Time
                  const dateStr = samplePhoto.uploaded_at 
                    ? new Date(samplePhoto.uploaded_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(' ', ' ')
                    : "Unknown Date";

                  const timeStr = samplePhoto.uploaded_at 
                    ? new Date(samplePhoto.uploaded_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : "10:30 AM";

                  const ratingStr = samplePhoto.rating || "4.5/5";
                  const locationDisplay = samplePhoto.location_name || samplePhoto.company_name || 'Unknown Location';
                  
                  // MANUALLY SEPARATE BEFORE AND AFTER PHOTOS FOR THIS GROUP
                  const beforePhotos = group.items.filter(p => p.image_type?.toLowerCase() === 'before');
                  const afterPhotos = group.items.filter(p => p.image_type?.toLowerCase() === 'after');

                  return (
                    <div key={group.id || `group-${groupIndex}`} className="flex flex-col">
                      
                      {/* 1. Single Dynamic Header */}
                      <h2 className="text-[16px] font-bold text-gray-900 mb-6 tracking-tight">
                        {dateStr} - {locationDisplay} - Ratings: <span className="text-green-600">{ratingStr}</span> [{timeStr}]
                      </h2>
                      
                      <div className="flex flex-col gap-4">
                        {/* 2. Before Row (Top) */}
                        {beforePhotos.length > 0 && (
                          <div className="flex flex-col">
                            <h3 className="text-[15px] font-bold text-gray-900 mb-3">Before</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                              {beforePhotos.map((photo, photoIndex) => (
                                <PhotoCard 
                                  key={photo?.id || photo?._id || `before-${groupIndex}-${photoIndex}`} 
                                  photo={photo} 
                                  isSelected={selectedIds.has(photo?.id)}
                                  onToggleSelect={handleToggleSelect}
                                  onClickView={() => setPreviewPhotoIndex(photos.findIndex(p => p.id === photo.id))}
                                  hideLabel={true} 
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3. After Row (Bottom) */}
                        {afterPhotos.length > 0 && (
                          <div className="flex flex-col">
                            <h3 className="text-[15px] font-bold text-gray-900 mb-3">After</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                              {afterPhotos.map((photo, photoIndex) => (
                                <PhotoCard 
                                  key={photo?.id || photo?._id || `after-${groupIndex}-${photoIndex}`} 
                                  photo={photo} 
                                  isSelected={selectedIds.has(photo?.id)}
                                  onToggleSelect={handleToggleSelect}
                                  onClickView={() => setPreviewPhotoIndex(photos.findIndex(p => p.id === photo.id))}
                                  hideLabel={true} 
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {pagination.total_pages > 1 && (
                <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-6 border-t border-gray-200 gap-4">
                  <span className="text-sm text-gray-600 font-medium">
                    Showing Page {pagination.current_page} of {pagination.total_pages}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handlePrevPage} 
                      disabled={filters.page <= 1 || isFetching}
                      className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    
                    <button 
                      onClick={handleNextPage} 
                      disabled={filters.page >= pagination.total_pages || isFetching}
                      className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
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