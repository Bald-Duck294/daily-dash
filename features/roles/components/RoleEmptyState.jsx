import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function RoleEmptyState({ role, canAdd }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
        <UserPlus className="w-8 h-8" />
      </div>
      <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
        No {role}s found
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-sm mx-auto">
        There are currently no {role} accounts matching your selected filters or search query.
      </p>

      {canAdd && (
        <Link
          href={`/roles/${role}/add`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all shadow-xs hover:scale-105"
        >
          <UserPlus className="w-4 h-4" /> Add First {role.charAt(0).toUpperCase() + role.slice(1)}
        </Link>
      )}
    </div>
  );
}
