import JSZip from "jszip";
import { saveAs } from "file-saver";

export const downloadImagesAsZip = async (photos, setProgress = null) => {
  if (!photos || photos.length === 0) return;

  const zip = new JSZip();
  const folder = zip.folder("Washroom_Images");

  try {
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const response = await fetch(photo.image_url);
      if (!response.ok) throw new Error(`Failed to fetch ${photo.file_name}`);
      
      const blob = await response.blob();
      folder.file(photo.file_name, blob);

      if (setProgress) {
        setProgress(Math.round(((i + 1) / photos.length) * 100));
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "washroom_images.zip");
  } catch (error) {
    console.error("Error generating ZIP:", error);
    throw error;
  }
};