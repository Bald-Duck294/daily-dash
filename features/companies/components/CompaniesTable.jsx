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

import { Edit, Trash2 } from "lucide-react";
import { formatDate } from "../utils/formatDate";
import { useRouter } from "next/navigation";

export default function CompaniesTable({ companies, onDelete, onView }) {
  const router = useRouter();

  return (
    <div
      className="
        overflow-hidden rounded-xl
        border border-[var(--sidebar-border)]
        bg-[var(--background)]
      "
    >
      <table className="w-full text-sm">
        {/* ===== TABLE HEADER (NOT CLICKABLE) ===== */}
        <thead className="border-b border-[var(--sidebar-border)]">
          <tr className="text-left text-[var(--sidebar-muted)]">
            <th className="p-3">#</th>
            <th className="p-3">Name 1</th>
            <th className="p-3">Email</th>
            <th className="p-3">Status</th>
            <th className="p-3">Created</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        {/* ===== TABLE BODY (ROWS CLICKABLE) ===== */}
        <tbody>
          {companies.map((c, i) => (
            <tr
              key={c.id}
              onClick={() => onView(c.id)}
              className="
                border-t border-[var(--sidebar-border)]
                hover:bg-[var(--sidebar-hover)]
                cursor-pointer
                transition
              "
            >
              <td className="p-3">{i + 1}</td>

              <td className="p-3 font-medium text-[var(--foreground)]">
                {c.name}
              </td>

              <td className="p-3 text-[var(--sidebar-muted)]">
                {c.contact_email}
              </td>

              <td className="p-3">
                <span
                  className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${c.status
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-red-500/15 text-red-500"
                    }
                  `}
                >
                  {c.status ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="p-3 text-[var(--sidebar-muted)]">
                {formatDate(c.created_at)}
              </td>

              {/* ===== ACTIONS (STOP ROW CLICK) ===== */}
              <td className="p-3 flex gap-3">
                <Edit
                  size={16}
                  className="cursor-pointer text-[var(--sidebar-muted)] hover:text-[var(--foreground)]"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/companies/${c.id}`);
                  }}
                />

                <Trash2
                  size={16}
                  className="cursor-pointer text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(c.id);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
