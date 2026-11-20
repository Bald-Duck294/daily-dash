import axiosInstance from "@/shared/api/axios.instance";
import toast from "react-hot-toast";

/**
 * Downloads a single image.
 * Uses the backend proxy endpoint to circumvent Google Cloud Storage CORS restrictions.
 * Falls back to direct fetch or opening in a new tab if needed.
 */
export const downloadSingleImage = async (imageUrl, fileName) => {
  if (!imageUrl) {
    toast.error("Image URL is not available.");
    return;
  }

  const cleanFileName =
    fileName || imageUrl.split("/").pop() || "downloaded_image.webp";

  // Strategy 1: Backend proxy download (bypasses browser GCS CORS restrictions)
  try {
    const response = await axiosInstance.get("/photo/download", {
      params: { url: imageUrl, filename: cleanFileName },
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = cleanFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    return;
  } catch (backendError) {
    console.warn(
      "Backend proxy download failed, attempting direct browser fetch:",
      backendError,
    );
  }

  // Strategy 2: Direct browser fetch (if CORS allowed)
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Network response was not ok");

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = cleanFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    return;
  } catch (directError) {
    console.warn(
      "Direct browser fetch failed due to CORS. Opening image in new tab as fallback:",
      directError,
    );
  }

  // Strategy 3: Graceful fallback - open image in new tab so user can right-click and save
  try {
    window.open(imageUrl, "_blank", "noopener,noreferrer");
  } catch (fallbackError) {
    console.error("All download strategies failed:", fallbackError);
    toast.error("Failed to download image.");
  }
};
