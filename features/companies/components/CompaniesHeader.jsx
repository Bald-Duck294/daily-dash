import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CompaniesHeader() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={() => router.back()}
        className="
          p-2 rounded-lg
          hover:bg-[var(--sidebar-hover)]
          transition
        "
      >
        <ArrowLeft size={18} />
      </button>

      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Organizations
        </h1>
        <p className="text-sm text-[var(--sidebar-muted)]">
          Manage registered organizations
        </p>
      </div>
    </div>
  );
}
