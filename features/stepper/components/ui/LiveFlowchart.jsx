"use client";
import React, { useState } from "react";

const typeConfig = {
  building: { color: "bg-[#1F4E79]", border: "border-[#1F4E79]", icon: "🏢" },
  ward: { color: "bg-[#dc2626]", border: "border-[#dc2626]", icon: "🏥" },
  floor: { color: "bg-[#ea580c]", border: "border-[#ea580c]", icon: "📋" },
  zone: { color: "bg-[#9333ea]", border: "border-[#9333ea]", icon: "📍" },
  washroom: { color: "bg-[#0891b2]", border: "border-[#0891b2]", icon: "🚻" },
  cleaner: { color: "bg-[#10b981]", border: "border-[#10b981]", icon: "🧹" },
  supervisor: { color: "bg-[#f59e0b]", border: "border-[#f59e0b]", icon: "👁️" },
  admin: { color: "bg-[#64748b]", border: "border-[#64748b]", icon: "⚙️" },
};

const HierarchyNode = ({ name, type }) => {
  const config = typeConfig[type?.toLowerCase()] || typeConfig.building;
  return (
    <div className="bg-white rounded-[14px] shadow-[0_2px_12px_-4px_rgba(0,0,0,0.1)] border border-slate-200 w-[140px] md:w-[170px] flex flex-col items-center p-3 md:p-4 relative overflow-hidden group hover:border-slate-300 transition-all cursor-pointer">
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${config.color}`} />
      <div
        className={`w-8 h-8 md:w-9 md:h-9 rounded-full ${config.color} text-white flex items-center justify-center text-base md:text-lg mt-1 mb-2 shadow-sm`}
      >
        {config.icon}
      </div>
      <p
        className="font-bold text-[12px] md:text-[13px] text-slate-900 text-center w-full truncate px-1"
        title={name}
      >
        {name}
      </p>
      <p className="text-[10px] md:text-[11px] font-medium text-slate-500 capitalize mt-0.5">
        {type}
      </p>
    </div>
  );
};

const TreeNode = ({ node }) => {
  const hasChildren = node.children && node.children.length > 0;
  const multipleChildren = hasChildren && node.children.length > 1;

  return (
    <div className="flex flex-col items-center">
      <div className="relative z-10">
        <HierarchyNode name={node.name} type={node.type} />
      </div>
      {hasChildren && (
        <div className="relative flex justify-center pt-8 mt-[-1px]">
          <div className="absolute top-0 left-1/2 w-px h-8 bg-slate-300 -translate-x-1/2" />
          {node.children.map((child, index) => {
            const isFirst = index === 0;
            const isLast = index === node.children.length - 1;
            return (
              <div
                key={child.id}
                className="relative flex flex-col items-center px-2 md:px-4"
              >
                {multipleChildren && (
                  <div
                    className={`absolute top-0 h-px bg-slate-300 ${
                      isFirst
                        ? "left-1/2 right-0"
                        : isLast
                          ? "left-0 right-1/2"
                          : "left-0 right-0"
                    }`}
                  />
                )}
                <div className="absolute top-0 left-1/2 w-px h-8 bg-slate-300 -translate-x-1/2" />
                <div className="pt-8">
                  <TreeNode node={child} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function LiveFlowchart({
  treeData = [],
  title = "Architecture Map",
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Pan & Zoom Handlers (Mouse)
  const handleWheel = (e) => {
    e.preventDefault();
    const newScale = scale + (e.deltaY > 0 ? -0.1 : 0.1);
    setScale(Math.min(Math.max(0.4, newScale), 2));
  };
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  // Pan Handlers (Touch for Mobile)
  const handleTouchStart = (e) => {
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };
  const handleTouchMove = (e) => {
    if (isDragging) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 2));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.4));
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const MapCanvas = ({ showInlineControls }) => (
    <div
      className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing bg-[#f8fafc]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* Moving Grid Pattern */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)`,
          backgroundSize: `${40 * scale}px ${40 * scale}px`,
          backgroundPosition: `${position.x}px ${position.y}px`,
        }}
      />

      {/* Floating Inline Controls - MOVED TO BOTTOM RIGHT FOR MOBILE */}
      {showInlineControls && (
        <div className="absolute bottom-4 right-4 flex flex-row gap-2 z-20">
          <button
            onClick={zoomIn}
            className="w-10 h-10 md:w-8 md:h-8 bg-white border border-slate-200 rounded-lg shadow-md text-slate-600 font-bold hover:bg-slate-50 flex items-center justify-center"
          >
            +
          </button>
          <button
            onClick={zoomOut}
            className="w-10 h-10 md:w-8 md:h-8 bg-white border border-slate-200 rounded-lg shadow-md text-slate-600 font-bold hover:bg-slate-50 flex items-center justify-center"
          >
            -
          </button>
          <button
            onClick={resetZoom}
            className="w-10 h-10 md:w-8 md:h-8 bg-white border border-slate-200 rounded-lg shadow-md text-slate-600 font-bold hover:bg-slate-50 flex items-center justify-center"
          >
            ⊙
          </button>
        </div>
      )}

      {/* Center Prompt - MOVED TO TOP LEFT */}
      <div className="absolute top-4 left-4 bg-white/80 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 z-10 shadow-sm pointer-events-none">
        Drag to pan • Pinch to zoom
      </div>

      <div
        className="absolute top-1/2 left-1/2 origin-center"
        style={{
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`,
          transition: isDragging ? "none" : "transform 0.1s ease-out",
        }}
      >
        <div className="flex gap-6 md:gap-12 justify-center">
          {treeData.map((root) => (
            <TreeNode key={root.id} node={root} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-[400px] lg:h-[600px] overflow-hidden relative w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-5 border-b border-slate-100 bg-white z-10 gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <h3 className="font-black text-sm text-slate-700 uppercase tracking-widest">
              {title}
            </h3>
            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-emerald-200">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>{" "}
              LIVE
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search"
                className="pl-8 pr-3 py-2.5 md:py-2 text-xs border-[1.5px] border-slate-200 rounded-lg outline-none focus:border-[#1F4E79] w-full font-medium"
              />
            </div>
            <button
              onClick={() => setIsFullscreen(true)}
              className="flex items-center justify-center shrink-0 w-10 h-10 md:w-auto md:px-4 md:py-2 border-[1.5px] border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:border-[#1F4E79] hover:text-[#1F4E79] transition-colors bg-white shadow-sm"
            >
              <span className="md:hidden">⛶</span>
              <span className="hidden md:inline">⛶ View Full</span>
            </button>
          </div>
        </div>
        <MapCanvas showInlineControls={true} />
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm p-2 sm:p-8 flex justify-center items-center animate-in fade-in duration-200">
          <div className="bg-white w-full h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
            <div className="bg-white px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 z-10 shadow-sm gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Architecture Map
                </h2>
              </div>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center">
                  <button
                    onClick={zoomIn}
                    className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center hover:bg-white rounded text-slate-600 font-bold transition-colors"
                  >
                    +
                  </button>
                  <div className="w-px h-4 bg-slate-300 mx-1" />
                  <button
                    onClick={zoomOut}
                    className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center hover:bg-white rounded text-slate-600 font-bold transition-colors"
                  >
                    -
                  </button>
                  <div className="w-px h-4 bg-slate-300 mx-1" />
                  <button
                    onClick={resetZoom}
                    className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center hover:bg-white rounded text-slate-600 font-bold transition-colors"
                  >
                    ⊙
                  </button>
                </div>
                <div className="flex items-center sm:ml-2 pl-2 border-l border-slate-300">
                  <button
                    onClick={() => setIsFullscreen(false)}
                    className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500 rounded font-bold transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
            <MapCanvas showInlineControls={false} />
          </div>
        </div>
      )}
    </>
  );
}
