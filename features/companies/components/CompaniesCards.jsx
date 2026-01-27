import { formatDate } from "../utils/formatDate";

export default function CompaniesCards({ companies }) {
  return (
    <div className="space-y-3">
      {companies.map((c, i) => (
        <div key={c.id} className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">{c.name}</h3>
          <p className="text-sm text-gray-500">{c.contact_email}</p>
          <p className="text-xs mt-2">
            Created: {formatDate(c.created_at)}
          </p>
        </div>
      ))}
    </div>
  );
}
