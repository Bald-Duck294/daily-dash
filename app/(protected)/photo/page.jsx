import React from "react";
// Adjust the alias path based on your setup
import PhotoManagement from "@/features/photo/components/PhotoManagementModal";

export const metadata = {
  title: "Photo Management | Super Admin",
  description: "View, filter, and download facility cleaning photos.",
};

export default function PhotoManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PhotoManagement />
    </div>
  );
}