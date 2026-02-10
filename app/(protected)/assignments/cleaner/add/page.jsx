import { Suspense } from "react";
import AddAssignmentContent from "./AddAssignmentContent";
import Loader from "@/components/ui/Loader";
export default function AddAssignmentPage() {
    return (
        <Suspense fallback={
            <div
                className="flex justify-center items-center h-screen"
                style={{ background: "var(--cleaner-bg)" }}
            >
                <div className="text-center">
                    <div
                        className="w-12 h-12 rounded-full animate-spin mx-auto mb-4"
                        style={{
                            border: "4px solid var(--cleaner-primary-text)",
                            borderTopColor: "transparent",
                        }}
                    />
                    <p
                        className="font-medium"
                        style={{ color: "var(--muted-foreground)" }}
                    >
                        Loading form...
                    </p>
                </div>
            </div>
        }>
            <AddAssignmentContent />
        </Suspense>
    );
}
