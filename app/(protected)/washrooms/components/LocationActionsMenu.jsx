"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Users, Trash, Edit, Delete } from "lucide-react";
import { useSelector } from "react-redux";

import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { MODULES } from "@/shared/constants/permissions";
export default function LocationActionsMenu({
  item,
  onClose,
  onDelete,
  onEdit,
  location_id,
  canDeleteLocation,
  canEditLocation,
}) {
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
