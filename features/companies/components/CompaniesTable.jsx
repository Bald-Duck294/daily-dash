// import { Edit, Trash2 } from "lucide-react";
// import { formatDate } from "../utils/formatDate";
// import { useRouter } from "next/navigation";

// export default function CompaniesTable({ companies, onDelete, onView }) {
//   const router = useRouter();

//   return (
//     <div
//       className="
//         overflow-hidden rounded-xl
//         border border-[var(--sidebar-border)]
//         bg-[var(--background)]
//       "
//     >
//       <table className="w-full text-sm">
//         {/* ===== TABLE HEADER (NOT CLICKABLE) ===== */}
//         <thead className="border-b border-[var(--sidebar-border)]">
//           <tr className="text-left text-[var(--sidebar-muted)]">
//             <th className="p-3">#</th>
//             <th className="p-3">Name 1</th>
//             <th className="p-3">Email</th>
//             <th className="p-3">Status</th>
//             <th className="p-3">Created</th>
//             <th className="p-3">Actions</th>
//           </tr>
//         </thead>

//         {/* ===== TABLE BODY (ROWS CLICKABLE) ===== */}
//         <tbody>
//           {companies.map((c, i) => (
//             <tr
//               key={c.id}
//               onClick={() => onView(c.id)}
//               className="
//                 border-t border-[var(--sidebar-border)]
//                 hover:bg-[var(--sidebar-hover)]
//                 cursor-pointer
//                 transition
//               "
//             >
//               <td className="p-3">{i + 1}</td>

//               <td className="p-3 font-medium text-[var(--foreground)]">
//                 {c.name}
//               </td>

//               <td className="p-3 text-[var(--sidebar-muted)]">
//                 {c.contact_email}
//               </td>

//               <td className="p-3">
//                 <span
//                   className={`
//                     px-2 py-1 rounded-full text-xs font-medium
//                     ${
//                       c.status
//                         ? "bg-emerald-500/15 text-emerald-500"
//                         : "bg-red-500/15 text-red-500"
//                     }
//                   `}
//                 >
//                   {c.status ? "Active" : "Inactive"}
//                 </span>
//               </td>

//               <td className="p-3 text-[var(--sidebar-muted)]">
//                 {formatDate(c.created_at)}
//               </td>

//               {/* ===== ACTIONS (STOP ROW CLICK) ===== */}
//               <td className="p-3 flex gap-3">
//                 <Edit
//                   size={16}
//                   className="cursor-pointer text-[var(--sidebar-muted)] hover:text-[var(--foreground)]"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     router.push(`/companies/${c.id}`);
//                   }}
//                 />

//                 <Trash2
//                   size={16}
//                   className="cursor-pointer text-red-500"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onDelete(c.id);
//                   }}
//                 />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

"use client";

export default function CompaniesTable({
  companies,
  onDelete,
  onToggleStatus,
  onView,
}) {
  const handleRowClick = (e, id) => {
    // Prevent row click when clicking on action buttons
    if (e.target.closest("button")) return;
    onView(id);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--sidebar-border)] bg-[var(--card)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--sidebar-accent)] border-b border-[var(--sidebar-border)]">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-[var(--sidebar-foreground)]">
              Company Name
            </th>
            <th className="px-4 py-3 text-left font-medium text-[var(--sidebar-foreground)]">
              Contact Email
            </th>
            <th className="px-4 py-3 text-left font-medium text-[var(--sidebar-foreground)]">
              Status
            </th>
            <th className="px-4 py-3 text-right font-medium text-[var(--sidebar-foreground)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--sidebar-border)]">
          {companies.length === 0 ? (
            <tr>
              <td
                colSpan="4"
                className="px-4 py-8 text-center text-[var(--sidebar-muted)]"
              >
                No companies found
              </td>
            </tr>
          ) : (
            companies.map((company) => (
              <tr
                key={company.id}
                onClick={(e) => handleRowClick(e, company.id)}
                className="
                  cursor-pointer
                  hover:bg-[var(--sidebar-hover)]
                  active:bg-[var(--sidebar-accent)]
                  transition-colors
                "
                style={{ cursor: "pointer", touchAction: "manipulation" }}
              >
                <td className="px-4 py-3 text-[var(--sidebar-foreground)]">
                  {company.name}
                </td>
                <td className="px-4 py-3 text-[var(--sidebar-muted)]">
                  {company.contact_email}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`
                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${
                        company.is_active
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }
                    `}
                  >
                    {company.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(company.id, company.is_active);
                      }}
                      className="
                        px-3 py-1 text-xs rounded
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
                        px-3 py-1 text-xs rounded
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
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
