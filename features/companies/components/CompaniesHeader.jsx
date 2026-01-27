import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CompaniesHeader() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={() => router.back()}
        className="p-2 rounded-lg hover:bg-gray-200"
      >
        <ArrowLeft size={18} />
      </button>
      <div>
        <h1 className="text-2xl font-bold">Organizations</h1>
        <p className="text-sm text-gray-500">
          Manage registered organizations
        </p>
      </div>
    </div>
  );
}
