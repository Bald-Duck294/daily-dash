export default function RolePermissions({
  modules = [],
  formData,
  setFormData,
  error,
}) {
  const permissions = formData.permissions || [];

  const togglePermission = (perm) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const toggleModule = (module) => {
    const modulePerms = module.permissions || [];
    const allSelected = modulePerms.every((p) => permissions.includes(p));

    setFormData((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !modulePerms.includes(p))
        : [
            ...new Set([...prev.permissions, ...modulePerms]),
          ],
    }));
  };

  const isModuleFullySelected = (module) =>
    (module.permissions || []).every((p) => permissions.includes(p));

  const isModulePartiallySelected = (module) =>
    (module.permissions || []).some((p) => permissions.includes(p)) &&
    !isModuleFullySelected(module);

  return (
    <div className="bg-card border border-border rounded-xl">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">
          Permissions <span className="text-destructive">*</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          Select permissions for this role
        </p>
        {error && (
          <p className="text-destructive text-xs mt-1">{error}</p>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {modules.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No permissions available
          </p>
        )}

        {modules.map((module) => {
          const full = isModuleFullySelected(module);
          const partial = isModulePartiallySelected(module);

          return (
            <div
              key={module.key}
              className="border border-border rounded-lg overflow-hidden"
            >
              {/* Module Header */}
              <button
                type="button"
                onClick={() => toggleModule(module)}
                className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors
                  ${
                    full
                      ? "bg-primary/10 border-b border-primary/20"
                      : "bg-muted hover:bg-muted/80 border-b border-border"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={full}
                    readOnly
                    className="accent-primary"
                  />
                  <div>
                    <p className="font-medium text-foreground">
                      {module.label}
                    </p>
                    {module.description && (
                      <p className="text-xs text-muted-foreground">
                        {module.description}
                      </p>
                    )}
                  </div>
                </div>

                {partial && (
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                    Partial
                  </span>
                )}
              </button>

              {/* Permissions */}
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(module.permissions || []).map((perm) => {
                  const checked = permissions.includes(perm);
                  const label = perm.split(".")[1]?.replace("_", " ");

                  return (
                    <label
                      key={perm}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors
                        ${
                          checked
                            ? "bg-primary/10 border-primary/30"
                            : "bg-background border-border hover:bg-muted"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePermission(perm)}
                        className="accent-primary"
                      />
                      <span className="text-sm capitalize text-foreground">
                        {label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
