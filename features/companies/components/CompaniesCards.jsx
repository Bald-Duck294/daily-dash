import { Edit, Trash2, RotateCcw, Mail, Calendar } from "lucide-react";
import { formatDate } from "../utils/formatDate";
import { useRouter } from "next/navigation";

const CARD_GRADIENTS = [
  "from-blue-50/80 via-slate-50/40 to-white dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900",
  "from-indigo-50/80 via-slate-50/40 to-white dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900",
  "from-cyan-50/80 via-slate-50/40 to-white dark:from-slate-900 dark:via-cyan-950/30 dark:to-slate-900",
  "from-emerald-50/80 via-slate-50/40 to-white dark:from-slate-900 dark:via-emerald-950/30 dark:to-slate-900",
];

export default function CompaniesCards({ companies, onDelete, onView, onReset, currentPage = 1, pageSize = 10 }) {
  const router = useRouter();

  return (
    <div className="space-y-3">
      {companies.map((c, i) => {
        const serialNum = (currentPage - 1) * pageSize + i + 1;
        const formattedSr = String(serialNum).padStart(2, "0");
        const gradientClass = CARD_GRADIENTS[i % CARD_GRADIENTS.length];

        return (
          <div
            key={c.id}
            onClick={() => onView(c.id)}
            className={`
              rounded-2xl p-4.5
              border border-slate-200/80 dark:border-slate-800
              bg-gradient-to-br ${gradientClass}
              shadow-2xs hover:shadow-md
              hover:-translate-y-0.5
              cursor-pointer
              transition-all duration-200 space-y-3.5
            `}
          >
            {/* Header & Sr No */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Elegant Serial Number without '#' */}
                <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/90 px-2.5 py-1 rounded-xl shadow-2xs shrink-0">
                  {formattedSr}
                </span>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                    {c.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{c.contact_email || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`
                  inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold border shrink-0
                  ${c.status
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                  }
                `}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${c.status ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                {c.status ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Meta & Actions Row */}
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono text-[11px]">{formatDate(c.created_at)}</span>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-3">
                <Edit
                  size={16}
                  className="cursor-pointer text-slate-400 hover:text-blue-600 transition-all hover:scale-125"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/companies/${c.id}`);
                  }}
                />

                <RotateCcw
                  size={16}
                  className="cursor-pointer text-amber-500 hover:text-amber-600 transition-all hover:scale-125"
                  title="Reset Workspace"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReset?.(c.id);
                  }}
                />

                <Trash2
                  size={16}
                  className="cursor-pointer text-rose-500 hover:text-rose-600 transition-all hover:scale-125"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(c.id);
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
