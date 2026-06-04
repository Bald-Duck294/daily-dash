export const downloadSingleImage = async (imageUrl, fileName) => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Network response was not ok");
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "downloaded_image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading the image:", error);
    alert("Failed to download image.");
  }
};