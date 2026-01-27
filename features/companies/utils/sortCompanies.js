export function sortCompanies(data, key, direction) {
  return [...data].sort((a, b) => {
    let aVal = a[key];
    let bVal = b[key];

    if (typeof aVal === "string") aVal = aVal.toLowerCase();
    if (typeof bVal === "string") bVal = bVal.toLowerCase();

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
}
