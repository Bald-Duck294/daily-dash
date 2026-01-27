"use client";

export default function Error({ error, reset }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--foreground)] px-4">
      <div className="w-full max-w-md rounded-xl border border-black/10 bg-[var(--sidebar-bg)] p-6 text-center shadow-lg">
        <h2 className="mb-2 text-xl font-semibold">
          Something went wrong
        </h2>

        <p className="mb-4 text-sm opacity-80">
          {error?.message || "An unexpected error occurred."}
        </p>

        <button
          onClick={() => reset()}
          className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
