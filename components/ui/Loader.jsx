"use client";

export default function Loader({
    label = "Loading",
    fullscreen = false,
}) {
    return (
        <div
            role="status"
            aria-live="polite"
            className={`
        flex items-center justify-center
        ${fullscreen ? "fixed inset-0 z-50" : "w-full py-10"}
        bg-[var(--background)]/80
        backdrop-blur-sm
      `}
        >
            <div className="flex flex-col items-center gap-4">
                {/* Spinner */}
                <div className="relative h-12 w-12">
                    <div
                        className="
              absolute inset-0 rounded-full
              border-4 border-[var(--sidebar-border)]
            "
                    />
                    <div
                        className="
              absolute inset-0 rounded-full
              border-4 border-transparent
              border-t-[var(--sidebar-active)]
              animate-spin
            "
                    />
                </div>

                {/* Text */}
                <span className="text-sm font-medium text-[var(--sidebar-muted)]">
                    {label}
                </span>
            </div>
        </div>
    );
}
