import { formatDate } from "./formatDate";

export function exportCompaniesCSV(companies) {
  const headers = [
    "Sr No",
    "Organization",
    "Email",
    "Status",
    "Created At",
    "Updated At",
  ];

  const rows = companies.map((c, i) => [
    i + 1,
    c.name || "",
    c.contact_email || "",
    c.status ? "Active" : "Inactive",
    formatDate(c.created_at),
    formatDate(c.updated_at),
  ]);

  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "companies.csv";
  link.click();
}
