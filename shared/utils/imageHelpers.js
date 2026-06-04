export const groupPhotosByRecordId = (photos) => {
  const grouped = photos.reduce((acc, photo) => {
    const id = photo.cleaning_record_id;
    if (!acc[id]) {
      acc[id] = { cleaning_record_id: id, before: null, after: null };
    }
    if (photo.image_type === "before") {
      acc[id].before = photo;
    } else if (photo.image_type === "after") {
      acc[id].after = photo;
    }
    return acc;
  }, {});

  // Only return groups that have both images if strictly pairing, 
  // or return all groups to show whatever is available. We'll return all groups here.
  return Object.values(grouped);
};

export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};