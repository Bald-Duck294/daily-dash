// import { formatDate } from "../utils/formatDate";

// export default function CompaniesCards({ companies }) {
//   return (
//     <div className="space-y-3">
//       {companies.map((c) => (
//         <div
//           key={c.id}
//           className="
//             rounded-xl p-4
//             border border-[var(--sidebar-border)]
//             bg-[var(--background)]
//           "
//         >
//           <h3 className="font-semibold text-[var(--foreground)]">
//             {c.name}
//           </h3>

//           <p className="text-sm text-[var(--sidebar-muted)]">
//             {c.contact_email}
//           </p>

//           <p className="text-xs mt-2 text-[var(--sidebar-muted)]">
//             Created: {formatDate(c.created_at)}
//           </p>
//         </div>
//       ))}
//     </div>
//   );
// }

"use client";

export default function CompaniesCards({
  companies,
  onDelete,
  onToggleStatus,
  onView,
}) {
  return (
    <div className="space-y-3">
      {companies.length === 0 ? (
        <div className="text-center py-12 text-[var(--sidebar-muted)]">
          No companies found
        </div>
      ) : (
        companies.map((company) => (
          <div
            key={company.id}
            className="
              bg-[var(--card)] 
              border border-[var(--sidebar-border)] 
              rounded-lg 
              p-4
              shadow-sm
              cursor-pointer
              hover:shadow-md
              active:shadow-lg
              active:bg-[var(--sidebar-hover)]
              transition-all
            "
            onClick={() => onView(company.id)}
            style={{ cursor: "pointer", touchAction: "manipulation" }}
          >
            {/* Company Name */}
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-[var(--sidebar-foreground)]">
                {company.name}
              </h3>
              <p className="text-sm text-[var(--sidebar-muted)] mt-1 break-all">
                {company.contact_email}
              </p>
            </div>

            {/* Status Badge */}
            <div className="mb-3">
              <span
                className={`
                  inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                  ${
                    company.is_active
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  }
                `}
              >
                {company.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-[var(--sidebar-border)]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus(company.id, company.is_active);
                }}
                className="
                  flex-1 
                  px-3 py-2.5 
                  text-sm font-medium 
                  rounded-md
                  border border-[var(--sidebar-border)]
                  hover:bg-[var(--sidebar-hover)]
                  active:bg-[var(--sidebar-accent)]
                  transition-colors
                "
                style={{ touchAction: "manipulation" }}
              >
                {company.is_active ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete ${company.name}?`)) {
                    onDelete(company.id);
                  }
                }}
                className="
                  flex-1 
                  px-3 py-2.5 
                  text-sm font-medium 
                  rounded-md
                  bg-red-500 text-white
                  hover:bg-red-600
                  active:bg-red-700
                  transition-colors
                "
                style={{ touchAction: "manipulation" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
