"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Trash,
  Edit,
  Delete,
  Download,
  ExternalLink,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { MODULES } from "@/shared/constants/permissions";
import { getFeedbackFormUrl } from "@/shared/constants/formConstants";
export default function LocationActionsMenu({
  item,
  onClose,
  onDelete,
  onEdit,
  onDownloadQR,
  location_id,
  canDeleteLocation,
  canEditLocation,
}) {
  console.log(item, "item");
  const router = useRouter();
  const { companyId } = useCompanyId();

  const { canView } = usePermissions();
  const canViewAssignments = canView(MODULES.ASSIGNMENTS);

  const user = useSelector((state) => state.auth.user);
  const userRoleId = user?.role_id;
  const canViewSupervisor = userRoleId === 1 || userRoleId === 2;

  const handleViewCleaners = (e) => {
    e.preventDefault();
    e.stopPropagation(); // ✅ Stop propagation to parent
    console.log("handle view cleaners");
    router.push(
      `/assignments/cleaner?companyId=${companyId}&locationId=${item.id}&locationName=${encodeURIComponent(
        item.name,
      )}`,
    );
    onClose();
  };

  const handleViewSupervisor = (e) => {
    e.preventDefault();
    e.stopPropagation(); // ✅ Stop propagation to parent
    router.push(
      `/assignments/supervisor?companyId=${companyId}&locationId=${item.id}&locationName=${encodeURIComponent(
        item.name,
      )}`,
    );
    onClose();
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (onDelete) {
      onDelete(item);
    }
    onClose();
  };

  const handleOpenForm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const locId = location_id || item?.id;
    const compId = companyId || item?.company_id;
    const formUrl = getFeedbackFormUrl(locId, compId);
    window.open(formUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  const handleCopyFormUrl = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const locId = location_id || item?.id;
    const compId = companyId || item?.company_id;
    const formUrl = getFeedbackFormUrl(locId, compId);

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(formUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = formUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      toast.success("Feedback URL copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy URL");
    }
    onClose();
  };

  return (
    <div
      className="absolute right-0 mt-1 w-48 rounded-lg py-1 z-10"
      style={{
        background: "var(--washroom-surface)",
        border: "1px solid var(--washroom-border)",
        boxShadow: "var(--washroom-shadow)",
      }}
    >
      {/* View Cleaners */}
      {canViewAssignments && (
        <button
          onMouseDown={handleViewCleaners}
          className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors"
          style={{ color: "var(--washroom-text)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background =
              "var(--washroom-table-row-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <Users
            className="h-4 w-4"
            style={{ color: "var(--washroom-primary)" }}
          />
          View Cleaners
        </button>
      )}

      {/* View Supervisor */}
      {canViewSupervisor && (
        <button
          onMouseDown={handleViewSupervisor}
          className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors"
          style={{
            color: "var(--washroom-text)",
            borderTop: "1px solid var(--washroom-border)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background =
              "var(--washroom-table-row-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <Users
            className="h-4 w-4"
            style={{ color: "var(--washroom-status-active-text)" }}
          />
          View Supervisor
        </button>
      )}

      {/* Edit Washroom */}
      {(canViewSupervisor || canEditLocation) && (
        <button
          onMouseDown={() =>
            router.push(
              `/washrooms/item/${location_id}/edit?companyId=${companyId}`,
            )
          }
          className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors"
          style={{ color: "var(--washroom-text)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background =
              "var(--washroom-table-row-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <Edit
            className="h-4 w-4"
            style={{ color: "var(--washroom-primary)" }}
          />
          Edit Washroom
        </button>
      )}

      {/* Download QR Code */}
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onDownloadQR) {
            onDownloadQR(item);
          } else {
            console.warn("QR download handler not provided");
          }
          onClose();
        }}
        className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors"
        style={{ color: "var(--washroom-text)" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--washroom-table-row-hover)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <Download
          className="h-4 w-4"
          style={{ color: "var(--washroom-primary)" }}
        />
        Download QR Code
      </button>

      {/* Feedback Form Link */}
      <button
        onMouseDown={handleOpenForm}
        className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors"
        style={{ color: "var(--washroom-text)" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--washroom-table-row-hover)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <ExternalLink
          className="h-4 w-4"
          style={{ color: "var(--washroom-primary)" }}
        />
        Feedback Form
      </button>

      {/* Copy Feedback URL */}
      <button
        onMouseDown={handleCopyFormUrl}
        className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors"
        style={{ color: "var(--washroom-text)" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--washroom-table-row-hover)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <Copy
          className="h-4 w-4"
          style={{ color: "var(--washroom-primary)" }}
        />
        Copy Feedback URL
      </button>

      {/* Delete Washroom */}
      {(canViewSupervisor || canDeleteLocation) && (
        <button
          onMouseDown={handleDelete}
          className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors"
          style={{ color: "var(--washroom-status-inactive-text)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background =
              "var(--washroom-status-inactive-bg)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <Delete
            className="h-4 w-4"
            style={{ color: "var(--washroom-status-dot-inactive)" }}
          />
          Delete Washroom
        </button>
      )}
    </div>
  );
}
