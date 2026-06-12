import React, { useState, useRef, useEffect } from "react";
import { Map, Building2, MousePointer2, Target } from "lucide-react";

// --- Helper for Node Colors ---
const getNodeStyles = (level, index) => {
  if (level === 0)
    return {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200",
      iconBg: "bg-blue-600",
      iconText: "text-white",
    };

  const colors = [
    { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", iconBg: "bg-slate-100", iconText: "text-slate-600" },
    { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", iconBg: "bg-green-100", iconText: "text-green-600" },
    { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", iconBg: "bg-orange-100", iconText: "text-orange-600" },
    { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", iconBg: "bg-teal-100", iconText: "text-teal-600" },
    { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200", iconBg: "bg-pink-100", iconText: "text-pink-600" },
  ];
  return colors[index % colors.length];
};

// --- Recursive Node Component ---
const TreeNode = ({ node, level = 0, index = 0 }) => {
  const styles = getNodeStyles(level, index);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center p-4 shrink-0 rounded-xl border ${styles.border} ${
          level === 0 ? "bg-white shadow-lg w-48" : `${styles.bg} shadow-sm w-36`
        } transition-transform hover:-translate-y-1`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 shrink-0 ${styles.iconBg} ${styles.iconText}`}
        >
          {level === 0 ? <Building2 size={20} /> : <Map size={18} />}
        </div>
        <h3 className="font-bold text-xs uppercase text-center tracking-tight text-slate-800 line-clamp-2">
          {node.name}
        </h3>
        <p className="text-[10px] font-semibold text-slate-500 mt-1 uppercase">
          {node.nodesCount || 0} Nodes
        </p>
      </div>

      {/* Connecting Lines & Children */}
      {hasChildren && (
        <div className="relative flex flex-col items-center pt-6">
          <div className="absolute top-0 w-px h-6 bg-indigo-200 -mt-6"></div>

          <div className="flex gap-4 md:gap-8 justify-center relative w-max">
            {node.children.map((child, idx) => (
              <div key={child.id || idx} className="relative flex flex-col items-center">
                {node.children.length > 1 && (
                  <div
                    className={`absolute top-0 h-px bg-indigo-200 ${
                      idx === 0
                        ? "w-1/2 right-0"
                        : idx === node.children.length - 1
                        ? "w-1/2 left-0"
                        : "w-full"
                    }`}
                  ></div>
                )}
                <div className="absolute top-0 w-px h-6 bg-indigo-200"></div>
                <div className="pt-6">
                  <TreeNode node={child} level={level + 1} index={idx} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Interactive Canvas Wrapper ---
export const VisualArchitectureMap = ({ data }) => {
  const containerRef = useRef(null);
  
  // Interactive Viewport States
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  
  const dragStart = useRef({ x: 0, y: 0 });
  
  // ✅ NEW: Pinch State tracking for Native Mobile Feel
  const pinchState = useRef(null);

  // 1. Handle Mouse Wheel Zooming (Desktop)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault(); 
      
      const zoomSensitivity = 0.002;
      const delta = e.deltaY * -zoomSensitivity;
      let newScale = scale + (scale * delta);
      newScale = Math.min(Math.max(0.15, newScale), 3);

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newX = x - ((x - position.x) / scale) * newScale;
      const newY = y - ((y - position.y) / scale) * newScale;

      setScale(newScale);
      setPosition({ x: newX, y: newY });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [scale, position]);

  // 2. Handle Mouse Drag Panning (Desktop)
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // 3. Handle Touch Events (Mobile Panning & Pinch-to-Zoom)
  const handleTouchStart = (e) => {
    const container = containerRef.current;
    if (!container) return;

    if (e.touches.length === 1) {
      // Single finger -> Panning
      setIsDragging(true);
      dragStart.current = { 
        x: e.touches[0].clientX - position.x, 
        y: e.touches[0].clientY - position.y 
      };
    } else if (e.touches.length === 2) {
      // Two fingers -> Pinch Zoom setup
      setIsDragging(false);
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      // Calculate initial distance between fingers
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      
      // Calculate initial midpoint between fingers
      const rect = container.getBoundingClientRect();
      const midX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
      const midY = (touch1.clientY + touch2.clientY) / 2 - rect.top;

      // Lock in the starting state for smooth ratio scaling
      pinchState.current = { 
        distance: dist, 
        scale: scale, 
        x: position.x, 
        y: position.y,
        midX: midX,
        midY: midY
      };
    }
  };

  const handleTouchMove = (e) => {
    const container = containerRef.current;
    if (!container) return;

    if (e.touches.length === 1 && isDragging) {
      // Panning
      setPosition({
        x: e.touches[0].clientX - dragStart.current.x,
        y: e.touches[0].clientY - dragStart.current.y,
      });
    } else if (e.touches.length === 2 && pinchState.current) {
      // Pinch Zooming
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      // Calculate current distance
      const currentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);

      // Scale by ratio (Current Distance / Initial Distance)
      const scaleRatio = currentDistance / pinchState.current.distance;
      let newScale = pinchState.current.scale * scaleRatio;
      newScale = Math.min(Math.max(0.15, newScale), 3); // clamp

      // Calculate current midpoint to allow simultaneous panning AND zooming
      const rect = container.getBoundingClientRect();
      const currentMidX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
      const currentMidY = (touch1.clientY + touch2.clientY) / 2 - rect.top;

      const { midX: startMidX, midY: startMidY, x: startX, y: startY, scale: startScale } = pinchState.current;
      
      const newX = currentMidX - ((startMidX - startX) / startScale) * newScale;
      const newY = currentMidY - ((startMidY - startY) / startScale) * newScale;

      setScale(newScale);
      setPosition({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = (e) => {
    // If we let go of one finger during a pinch, transition smoothly back into panning mode
    if (e.touches.length < 2) {
      pinchState.current = null;
    }
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = { 
        x: e.touches[0].clientX - position.x, 
        y: e.touches[0].clientY - position.y 
      };
    } else if (e.touches.length === 0) {
      setIsDragging(false);
    }
  };

  // 4. Reset Button logic
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 50, y: 50 });
  };

  if (!data || data.length === 0)
    return <div className="p-8 text-center text-slate-500">No architecture data available.</div>;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[400px] overflow-hidden touch-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Floating UI Controls */}
      <div className="absolute bottom-4 right-4 z-50 flex items-center gap-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 select-none">
        <span className="text-[10px] font-bold tracking-wide text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5 uppercase">
          <MousePointer2 size={12} /> Drag to Pan, Scroll to Zoom
        </span>
        <div className="hidden sm:block w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
        <button 
          onClick={handleReset} 
          className="flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <Target size={12} /> Reset Map
        </button>
      </div>

      {/* The Transformed Canvas Layer */}
      <div
        className="absolute origin-top-left will-change-transform"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isDragging || pinchState.current ? "none" : "transform 0.1s ease-out",
        }}
      >
        <div className="flex gap-8 md:gap-16 w-max pb-16">
          {data.map((rootNode, idx) => (
            <TreeNode key={rootNode.id || idx} node={rootNode} level={0} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};