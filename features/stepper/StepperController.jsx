"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useDeployWorkspace } from "./queries/workspace.queries";
import { buildDeploymentPayload } from "./utils/payloadBuilder";

import StepperNav from "./components/StepperNav";
import HierarchyStep from "./components/setup/HierarchyStep";
import WashroomsStep from "./components/setup/WashroomsStep";
import UsersStep from "./components/setup/UsersStep";
import AppPreviewStep from "./components/setup/AppPreviewStep";
import { StorageManager } from "@/shared/utils/storageManager";

export default function StepperController() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth) || {};

  const [isLoaded, setIsLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [workspaceDraft, setWorkspaceDraft] = useState({
    hierarchy: [],
    washrooms: [],
    users: [],
  });

  const deployMutation = useDeployWorkspace();

  // ─── 1. LOAD DRAFT ON MOUNT (With DB Verification) ─────────────
  useEffect(() => {
    StorageManager.purgeLegacyDrafts();
    if (!user) return;

    if (user?.company?.is_onboarding_completed) {
      if (user.company_id) {
        StorageManager.clearWorkspaceDraft(user.company_id);
      }
      router.replace(`/clientDashboard/${user.company_id}`);
      return;
    }

    if (user.company_id) {
      const parsed = StorageManager.loadWorkspaceDraft(user.company_id);
      if (parsed) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWorkspaceDraft({
          hierarchy: parsed.workspaceDraft?.hierarchy || [],
          washrooms: parsed.workspaceDraft?.washrooms || [],
          users: parsed.workspaceDraft?.users || [],
        });
        setCurrentStep(parsed.currentStep || 1);
      }
    }
    setIsLoaded(true);
  }, [user, router]);

  // ─── 2. SAVE DRAFT ON CHANGE ────────────────────────────────────
  useEffect(() => {
    if (isLoaded && currentStep < 5 && user?.company_id) {
      StorageManager.saveWorkspaceDraft(
        user.company_id,
        currentStep,
        workspaceDraft,
      );
    }
  }, [workspaceDraft, currentStep, isLoaded, user?.company_id]);

  const updateDraft = (key, data) => {
    setWorkspaceDraft((prev) => ({ ...prev, [key]: data }));
  };

  const handleNextStep = (stepData, dataKey) => {
    if (dataKey) updateDraft(dataKey, stepData);
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Triggered by AppPreviewStep
  const handleDeploy = () => {
    const payload = buildDeploymentPayload(workspaceDraft);
    deployMutation.mutate(payload, {
      onSuccess: () => {
        // CLEAR CACHE ONLY ON SUCCESS
        if (user?.company_id) {
          StorageManager.clearWorkspaceDraft(user.company_id);
        }
      },
    });
  };

  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="text-[#1F4E79] font-bold animate-pulse text-lg">
          Loading Workspace Setup...
        </div>
      </div>
    );
  }

  const hierarchy = workspaceDraft.hierarchy || [];
  const washrooms = workspaceDraft.washrooms || [];
  const users = workspaceDraft.users || [];

  return (
    <div className="w-full min-h-screen bg-[#F5F7FA] flex flex-col">
      {/* Hide StepperNav completely on Step 4 (App Preview) */}
      {currentStep < 4 && (
        <StepperNav
          currentStep={currentStep}
          onStepChange={(id) => {
            setCurrentStep(id);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {/* Dynamic padding: If step 4 (no nav), no top padding needed on main */}
      <main
        className={`flex-1 w-full max-w-7xl mx-auto ${currentStep < 4 ? "p-4 md:p-6 lg:p-8" : ""}`}
      >
        {currentStep === 1 && (
          <HierarchyStep
            nodes={hierarchy}
            companyProfile={user?.company || {}}
            onNext={(nodes) => handleNextStep(nodes, "hierarchy")}
          />
        )}
        {currentStep === 2 && (
          <WashroomsStep
            nodes={hierarchy}
            washrooms={washrooms}
            onNext={(data) => handleNextStep(data, "washrooms")}
            onBack={handlePrevStep}
          />
        )}
        {currentStep === 3 && (
          <UsersStep
            nodes={hierarchy}
            washrooms={washrooms}
            users={users}
            onNext={(data) => handleNextStep(data, "users")}
            onBack={handlePrevStep}
          />
        )}
        {currentStep === 4 &&
          (console.log("worspace draft", workspaceDraft),
          (
            <AppPreviewStep
              summary={{
                zones:
                  hierarchy.filter((n) => n.type === "zone").length ||
                  hierarchy.length,
                staff: users.length,
                washrooms: washrooms.length,
                cleaners: users.filter((u) => u.role === "cleaner").length,
              }}
              isLoading={deployMutation.isPending}
              isSuccess={deployMutation.isSuccess}
              isError={deployMutation.isError}
              error={deployMutation.error}
              resetMutation={deployMutation.reset}
              washroom_data={washrooms}
              onDeploy={handleDeploy}
              onBack={handlePrevStep}
              users={users}
            />
          ))}
      </main>
    </div>
  );
}
