// "use client";

// import { Bar, Line } from "react-chartjs-2";
// import { useRef, useEffect, useState } from "react";
// import "./Charts.css";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler,
// } from "chart.js";

// // Register ChartJS components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler,
// );

// // Helper function to get CSS variable value as HSL string
// const getCSSVariable = (variableName) => {
//   if (typeof window === "undefined") return "";
//   const root = document.documentElement;
//   const value = getComputedStyle(root).getPropertyValue(variableName).trim();
//   // If value is just HSL numbers (e.g., "192 58% 67%"), wrap it in hsl()
//   if (
//     value &&
//     !value.startsWith("hsl(") &&
//     !value.startsWith("#") &&
//     !/^\d+\.?\d*$/.test(value)
//   ) {
//     return `hsl(${value})`;
//   }
//   return value || "";
// };

// // Helper to get numeric CSS variable (for opacity, etc.)
// const getNumericCSSVariable = (variableName, defaultValue = "0") => {
//   if (typeof window === "undefined") return defaultValue;
//   const root = document.documentElement;
//   const value = getComputedStyle(root).getPropertyValue(variableName).trim();
//   return value || defaultValue;
// };

// // Helper to get chart colors based on theme
// const getChartColors = () => {
//   return {
//     primary: getCSSVariable("--chart-primary"),
//     primaryDark: getCSSVariable("--chart-primary-dark"),
//     secondary: getCSSVariable("--chart-secondary"),
//     accent: getCSSVariable("--chart-accent"),
//     tooltipBg: getCSSVariable("--chart-tooltip-bg"),
//     tooltipTitle: getCSSVariable("--chart-tooltip-title"),
//     tooltipBody: getCSSVariable("--chart-tooltip-body"),
//     tooltipBorder: getCSSVariable("--chart-tooltip-border"),
//     grid: getCSSVariable("--chart-grid"),
//     text: getCSSVariable("--chart-text"),
//     chartBg: getCSSVariable("--chart-bg"),
//     chartBorder: getCSSVariable("--chart-border"),
//     gradientStart: getCSSVariable("--chart-gradient-start"),
//     gradientEnd: getCSSVariable("--chart-gradient-end"),
//     gradientOpacityStart: getNumericCSSVariable(
//       "--chart-gradient-opacity-start",
//       "0.2",
//     ),
//     gradientOpacityEnd: getNumericCSSVariable(
//       "--chart-gradient-opacity-end",
//       "0.4",
//     ),
//   };
// };

// // Washroom Cleanliness Impact Chart
// export function WashroomCleanlinessChart() {
//   const [chartColors, setChartColors] = useState(getChartColors());

//   useEffect(() => {
//     // Update colors when theme changes
//     const updateColors = () => setChartColors(getChartColors());
//     updateColors();

//     // Watch for theme changes
//     const observer = new MutationObserver(updateColors);
//     observer.observe(document.documentElement, {
//       attributes: true,
//       attributeFilter: ["class"],
//     });

//     return () => observer.disconnect();
//   }, []);

//   const data = {
//     labels: ["Budhawar Bazaar", "Narendra Nagar", "Sakkardara Bridge"],
//     datasets: [
//       {
//         label: "Before Cleaning",
//         data: [4.2, 3.8, 4.5],
//         backgroundColor: "rgba(242, 153, 74, 0.5)", // Orange with 50% opacity
//         borderColor: "#F2994A", // Orange line
//         borderWidth: 2,
//         borderRadius: 6,
//         barPercentage: 0.6,
//         gradient: {
//           backgroundColor: (context) => {
//             const chart = context.chart;
//             const { ctx, chartArea } = chart;
//             if (!chartArea) return null;

//             const gradient = ctx.createLinearGradient(
//               0,
//               chartArea.bottom,
//               0,
//               chartArea.top,
//             );
//             gradient.addColorStop(0, "rgba(242, 153, 74, 0.08)");
//             gradient.addColorStop(1, "rgba(242, 153, 74, 0.3)");
//             return gradient;
//           },
//         },
//         categoryPercentage: 0.8,
//       },
//       {
//         label: "After Cleaning",
//         data: [9.1, 8.8, 9.4],
//         backgroundColor: "rgba(46, 196, 182, 0.4)", // Teal with 40% opacity
//         borderColor: "#2EC4B6", // Teal line
//         borderWidth: 2,
//         borderRadius: 6,
//         barPercentage: 0.6,
//         gradient: {
//           backgroundColor: (context) => {
//             const chart = context.chart;
//             const { ctx, chartArea } = chart;
//             if (!chartArea) return null;

//             const gradient = ctx.createLinearGradient(
//               0,
//               chartArea.bottom,
//               0,
//               chartArea.top,
//             );
//             gradient.addColorStop(0, "rgba(203, 243, 240, 0.3)"); // CBF3F0
//             gradient.addColorStop(0.6, "rgba(46, 196, 182, 0.4)"); // 2EC4B6
//             gradient.addColorStop(1, "rgba(255, 191, 105, 0.6)"); // FFBF69
//             return gradient;
//           },
//         },
//         categoryPercentage: 0.8,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: "top",
//         labels: {
//           boxWidth: 12,
//           padding: 16,
//           usePointStyle: true,
//           pointStyle: "circle",
//           color: chartColors.text || "hsl(215 16% 47%)",
//         },
//       },
//       title: {
//         display: true,
//         text: "Washroom Cleanliness Impact",
//         font: {
//           size: 16,
//           weight: 600,
//         },
//         padding: {
//           bottom: 16,
//         },
//         color: chartColors.text || "hsl(215 16% 47%)",
//       },
//       tooltip: {
//         backgroundColor: chartColors.tooltipBg || "hsl(0 0% 100%)",
//         titleColor: chartColors.tooltipTitle || "hsl(215 28% 17%)",
//         bodyColor: chartColors.tooltipBody || "hsl(215 16% 35%)",
//         borderColor: chartColors.tooltipBorder || "hsl(220 13% 91%)",
//         borderWidth: 1,
//         padding: 12,
//         boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
//         cornerRadius: 8,
//         displayColors: false,
//         callbacks: {
//           label: (context) => {
//             return `Score: ${context.raw}`;
//           },
//         },
//       },
//       datalabels: {
//         display: false,
//       },
//     },
//     scales: {
//       x: {
//         grid: {
//           display: false,
//         },
//         ticks: {
//           color: chartColors.text || "hsl(215 16% 47%)",
//         },
//       },
//       y: {
//         grid: {
//           color: chartColors.grid || "hsl(210 20% 96%)",
//           drawBorder: false,
//         },
//         ticks: {
//           color: chartColors.text || "hsl(215 16% 47%)",
//           stepSize: 2,
//           max: 10,
//         },
//       },
//     },
//   };

//   return (
//     <div className="bg-card dark:bg-card rounded-2xl border border-border dark:border-border shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:shadow-[0_14px_40px_rgba(0,0,0,0.65)] p-5 h-full">
//       <Bar
//         data={data}
//         options={options}
//         plugins={[
//           {
//             id: "customDataLabels",
//             afterDatasetsDraw(chart, args, options) {
//               const {
//                 ctx,
//                 data,
//                 chartArea: { top, bottom, left, right, width, height },
//               } = chart;

//               data.datasets.forEach((dataset, i) => {
//                 const meta = chart.getDatasetMeta(i);
//                 meta.data.forEach((bar, index) => {
//                   const data = dataset.data[index];
//                   // Use chart text color for first dataset, white for second
//                   ctx.fillStyle =
//                     i === 0
//                       ? chartColors.tooltipBody || "hsl(215 16% 35%)"
//                       : chartColors.tooltipBg || "white";
//                   ctx.font = "500 12px Inter";
//                   ctx.textAlign = "center";
//                   ctx.fillText(data, bar.x, bar.y - 8);
//                 });
//               });
//             },
//           },
//         ]}
//       />
//     </div>
//   );
// }

// // Cleaner Performance Chart
// export function CleanerPerformanceChart() {
//   const [chartColors, setChartColors] = useState(getChartColors());

//   useEffect(() => {
//     // Update colors when theme changes
//     const updateColors = () => setChartColors(getChartColors());
//     updateColors();

//     // Watch for theme changes
//     const observer = new MutationObserver(updateColors);
//     observer.observe(document.documentElement, {
//       attributes: true,
//       attributeFilter: ["class"],
//     });

//     return () => observer.disconnect();
//   }, []);

//   // Helper to convert HSL string to rgba with opacity
//   const hslToRgba = (hslString, opacity) => {
//     if (!hslString || !hslString.includes("hsl(")) {
//       // Fallback to chart primary color
//       const fallbackColor =
//         chartColors.primary || chartColors.gradientStart || "hsl(192 58% 67%)";
//       if (fallbackColor.includes("hsl(")) {
//         return hslToRgba(fallbackColor, opacity);
//       }
//       return `rgba(127, 199, 217, ${opacity})`; // Default primary color in RGB
//     }
//     // Extract HSL values: hsl(192 58% 67%) -> ['192', '58', '67']
//     const match = hslString.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
//     if (!match) {
//       const fallbackColor = chartColors.primary || "hsl(192 58% 67%)";
//       return hslToRgba(fallbackColor, opacity);
//     }

//     const [, h, s, l] = match;
//     // Simple HSL to RGB conversion
//     const hNum = parseInt(h) / 360;
//     const sNum = parseInt(s) / 100;
//     const lNum = parseInt(l) / 100;

//     const c = (1 - Math.abs(2 * lNum - 1)) * sNum;
//     const x = c * (1 - Math.abs(((hNum * 6) % 2) - 1));
//     const m = lNum - c / 2;

//     let r, g, b;
//     if (hNum < 1 / 6) {
//       r = c;
//       g = x;
//       b = 0;
//     } else if (hNum < 2 / 6) {
//       r = x;
//       g = c;
//       b = 0;
//     } else if (hNum < 3 / 6) {
//       r = 0;
//       g = c;
//       b = x;
//     } else if (hNum < 4 / 6) {
//       r = 0;
//       g = x;
//       b = c;
//     } else if (hNum < 5 / 6) {
//       r = x;
//       g = 0;
//       b = c;
//     } else {
//       r = c;
//       g = 0;
//       b = x;
//     }

//     r = Math.round((r + m) * 255);
//     g = Math.round((g + m) * 255);
//     b = Math.round((b + m) * 255);

//     return `rgba(${r}, ${g}, ${b}, ${opacity})`;
//   };

//   const data = {
//     labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
//     datasets: [
//       {
//         label: "Tasks Completed",
//         data: [12, 15, 18, 14, 20, 22, 24],
//         borderColor: "#FF9F1C", // Primary orange line
//         backgroundColor: (context) => {
//           if (!context.chart.chartArea) return "rgba(255, 191, 105, 0.15)";
//           const {
//             ctx,
//             chartArea: { top, bottom },
//           } = context.chart;
//           const gradient = ctx.createLinearGradient(0, top, 0, bottom);
//           gradient.addColorStop(0, "rgba(255, 191, 105, 0.3)"); // FFBF69
//           gradient.addColorStop(0.7, "rgba(203, 243, 240, 0.3)"); // CBF3F0
//           gradient.addColorStop(1, "rgba(203, 243, 240, 0)"); // fade to transparent
//           return gradient;
//         },
//         borderWidth: 3,
//         borderCapStyle: "round",
//         borderJoinStyle: "round",
//         fill: true,
//         tension: 0.5,
//         pointBackgroundColor: "#FFFFFF",
//         pointBorderColor: "#FF9F1C",
//         pointBorderWidth: 3,
//         pointRadius: 5,
//         pointHoverRadius: 8,
//         pointHoverBackgroundColor: "#FFFFFF",
//         pointHoverBorderColor: "#FFBF69",
//         pointHoverBorderWidth: 3,
//       },
//     ],
//   };

//   // Find the index of the highest value
//   const maxValueIndex = data.datasets[0].data.indexOf(
//     Math.max(...data.datasets[0].data),
//   );
//   const tooltipRefs = useRef({});

//   // Set tooltip positions programmatically
//   useEffect(() => {
//     data.labels.forEach((label, i) => {
//       const ref = tooltipRefs.current[i];
//       if (ref && i === maxValueIndex) {
//         ref.style.setProperty(
//           "--left-percent",
//           `${(i / (data.labels.length - 1)) * 100}%`,
//         );
//         ref.style.setProperty("--transform-value", "translate(-50%, -100%)");
//       }
//     });
//   }, [data.labels, maxValueIndex]);

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         display: false,
//       },
//       title: {
//         display: true,
//         text: "Cleaner Performance This Week",
//         font: {
//           size: 16,
//           weight: 600,
//         },
//         padding: {
//           bottom: 16,
//         },
//         color: "#6B7280", // Axis text color
//       },
//       tooltip: {
//         backgroundColor: "#FFFFFF", // Tooltip BG
//         titleColor: "#000000",
//         bodyColor: "#000000",
//         borderColor: "#E5E7EB", // Tooltip border
//         borderWidth: 1,
//         padding: 12,
//         boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
//         cornerRadius: 8,
//         displayColors: false,
//         callbacks: {
//           label: (context) => {
//             return `${context.parsed.y} tasks`;
//           },
//         },
//       },
//     },
//     scales: {
//       x: {
//         grid: {
//           display: false,
//         },
//         ticks: {
//           color: "#6B7280", // Axis text color
//         },
//       },
//       y: {
//         grid: {
//           color: "#EEEAFE", // Grid lines
//           borderDash: [4, 4],
//           drawBorder: false,
//         },
//         ticks: {
//           color: "#6B7280", // Axis text color
//           stepSize: 5,
//         },
//         min: 0,
//         max: 30,
//       },
//     },
//   };

//   return (
//     <div className="bg-card dark:bg-card rounded-2xl border border-border dark:border-border shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:shadow-[0_14px_40px_rgba(0,0,0,0.65)] p-5 h-full relative">
//       <Line data={data} options={options} />
//       {data.labels.map((label, i) => (
//         <div
//           key={i}
//           ref={(el) => {
//             tooltipRefs.current[i] = el;
//           }}
//           className={`absolute ${i === maxValueIndex ? "block" : "hidden"} chart-tooltip-marker`}
//         >
//           <div className="bg-gradient-to-r from-[#FF9F1C] to-[#2EC4B6] text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center shadow-lg border-2 border-white/20">
//             <span className="mr-1.5">🔥</span> {data.datasets[0].data[i]} tasks
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

"use client";

import { Bar, Line } from "react-chartjs-2";
import { useRef, useEffect, useState } from "react";
import "./Charts.css"; // Ensure you have the CSS file from previous chat
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// ... (Keep your getCSSVariable and getChartColors helpers here) ...
const getCSSVariable = (variableName) => {
  if (typeof window === "undefined") return "";
  const root = document.documentElement;
  const value = getComputedStyle(root).getPropertyValue(variableName).trim();
  if (
    value &&
    !value.startsWith("hsl(") &&
    !value.startsWith("#") &&
    !/^\d+\.?\d*$/.test(value)
  ) {
    return `hsl(${value})`;
  }
  return value || "";
};

const getChartColors = () => {
  // ... Copy your getChartColors function from previous code ...
  return {
    text: getCSSVariable("--chart-text") || "#64748b",
    grid: getCSSVariable("--chart-grid") || "#f1f5f9",
    tooltipBg: "#ffffff",
    tooltipBody: "#1e293b",
  };
};

// 1. DYNAMIC WASHROOM CHART
export function WashroomCleanlinessChart({ data = [] }) {
  const [chartColors, setChartColors] = useState(getChartColors());

  useEffect(() => {
    const updateColors = () => setChartColors(getChartColors());
    updateColors();
    // Optional: Add observer if needed
  }, []);

  // Process Data
  const labels = data.map((item) => item.location_name);
  const avgScores = data.map((item) => item.average_score);
  const currentScores = data.map((item) => item.current_score);

  const chartData = {
    labels: labels.length > 0 ? labels : ["No Data"],
    datasets: [
      {
        label: "Current Score", // Teal (Primary focus)
        data: currentScores.length > 0 ? currentScores : [0],
        backgroundColor: "rgba(46, 196, 182, 0.6)",
        borderColor: "#2EC4B6",
        borderWidth: 2,
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      },
      {
        label: "Average Score", // Orange (Comparison)
        data: avgScores.length > 0 ? avgScores : [0],
        backgroundColor: "rgba(242, 153, 74, 0.4)",
        borderColor: "#F2994A",
        borderWidth: 2,
        borderRadius: 6,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          color: chartColors.text,
        },
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#1e293b",
        bodyColor: "#475569",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        callbacks: { label: (c) => `${c.dataset.label}: ${c.raw}` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: chartColors.text,
          autoSkip: false,
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        grid: { color: chartColors.grid, borderDash: [4, 4] },
        ticks: { color: chartColors.text },
        max: 10,
      },
    },
  };

  return (
    <div className="w-full h-full p-2">
      <Bar data={chartData} options={options} />
    </div>
  );
}

// 2. DYNAMIC CLEANER PERFORMANCE CHART
export function CleanerPerformanceChart({ data = [], todayCount = 0 }) {
  const [chartColors, setChartColors] = useState(getChartColors());
  const tooltipRef = useRef(null);

  useEffect(() => {
    const updateColors = () => setChartColors(getChartColors());
    updateColors();
  }, []);

  // Process Data
  // Expecting data: [{ date: "2024-02-01", label/day: "Mon", tasks/count: 12 }]
  const labels = data.map((d) => d.day || d.label);
  const taskCounts = data.map((d) => d.count || d.tasks);

  const chartData = {
    labels:
      labels.length > 0
        ? labels
        : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Tasks Completed",
        data: taskCounts.length > 0 ? taskCounts : [0, 0, 0, 0, 0, 0, 0],
        borderColor: "#FF9F1C",
        backgroundColor: (context) => {
          if (!context.chart.chartArea) return "rgba(255, 191, 105, 0.15)";
          const {
            ctx,
            chartArea: { top, bottom },
          } = context.chart;
          const gradient = ctx.createLinearGradient(0, top, 0, bottom);
          gradient.addColorStop(0, "rgba(255, 191, 105, 0.3)");
          gradient.addColorStop(1, "rgba(203, 243, 240, 0)");
          return gradient;
        },
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#FFFFFF",
        pointBorderColor: "#FF9F1C",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Position the "Fire" tooltip on the last data point
  const lastIndex = labels.length - 1;
  useEffect(() => {
    if (tooltipRef.current && lastIndex >= 0) {
      // Simple positioning logic: Place at the end
      tooltipRef.current.style.left = `95%`;
      tooltipRef.current.style.bottom = `${(taskCounts[lastIndex] / 30) * 100 + 10}%`; // Approx rough positioning based on Y axis max 30
    }
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        callbacks: { label: (c) => `${c.parsed.y} tasks` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#6B7280" } },
      y: {
        grid: { color: "#EEEAFE", borderDash: [4, 4] },
        ticks: { color: "#6B7280", stepSize: 5 },
        min: 0,
      }, // Removed hard max to allow growth
    },
  };

  return (
    <div className="w-full h-full relative p-2">
      <Line data={chartData} options={options} />
      {/* Custom Fire Badge for Today */}
      {todayCount > 0 && (
        <div className="absolute top-0 right-0 m-4 animate-bounce">
          <div className="bg-gradient-to-r from-[#FF9F1C] to-[#2EC4B6] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-white/20 flex items-center gap-1">
            <span>🔥</span> {todayCount} Today
          </div>
        </div>
      )}
    </div>
  );
}
