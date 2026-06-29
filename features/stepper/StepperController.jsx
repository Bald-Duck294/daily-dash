"use client";
import React, { useState, useEffect } from "react";
import { useDeployWorkspace } from "./queries/workspace.queries";
import { buildDeploymentPayload } from "./utils/payloadBuilder";

import StepperNav from "./components/StepperNav";
import HierarchyStep from "./components/setup/HierarchyStep";
import WashroomsStep from "./components/setup/WashroomsStep";
import UsersStep from "./components/setup/UsersStep";
import AppPreviewStep from "./components/setup/AppPreviewStep";
import DashboardStep from "./components/setup/DashboardStep";

export default function StepperController() {
  // ❌ Phase state removed. We always start at step 1.
  const [currentStep, setCurrentStep] = useState(1);

  // --- THE SINGLE SOURCE OF TRUTH ---
  const [workspaceDraft, setWorkspaceDraft] = useState({
    hierarchy: [],
    washrooms: [],
    users: [],
  }); // ❌ discovery object removed

  const deployMutation = useDeployWorkspace();

  useEffect(() => {
    console.log("📊 [STATE TRACKER] Workspace Draft Updated:", workspaceDraft);
  }, [workspaceDraft]);

  const updateDraft = (key, data) => {
    setWorkspaceDraft((prev) => {
      const newState = { ...prev, [key]: data };
      console.log(`📝 [STEPPER] Draft Updated -> Key: [${key}]`, data);
      return newState;
    });
  };

  const handleNextStep = (stepData, dataKey) => {
    if (dataKey) {
      updateDraft(dataKey, stepData);
    }
    if (currentStep < 5) {
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

  const handleNavClick = (stepId) => {
    setCurrentStep(stepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeploy = () => {
    console.log("⚙️ [DEPLOY] Compiling final payload...");
    const payload = buildDeploymentPayload(workspaceDraft);

    deployMutation.mutate(payload, {
      onSuccess: () => {
        handleNextStep(null, null);
      },
    });
  };

  return (
    <div className="w-full min-h-full bg-[#F5F7FA] flex flex-col">
      <StepperNav currentStep={currentStep} onStepChange={handleNavClick} />

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {currentStep === 1 && (
          <HierarchyStep
            nodes={workspaceDraft.hierarchy}
            // ❌ discoveryProfile prop removed
            onNext={(nodes) => handleNextStep(nodes, "hierarchy")}
          />
        )}

        {currentStep === 2 && (
          <WashroomsStep
            nodes={workspaceDraft.hierarchy}
            washrooms={workspaceDraft.washrooms}
            onNext={(washrooms) => handleNextStep(washrooms, "washrooms")}
            onBack={handlePrevStep}
          />
        )}

        {currentStep === 3 && (
          <UsersStep
            nodes={workspaceDraft.hierarchy}
            washrooms={workspaceDraft.washrooms}
            users={workspaceDraft.users}
            onNext={(users) => handleNextStep(users, "users")}
            onBack={handlePrevStep}
          />
        )}

        {currentStep === 4 &&
          (console.log("entered the  4th step", workspaceDraft.washrooms),
          (
            <AppPreviewStep
              summary={{
                zones:
                  workspaceDraft.hierarchy.filter((n) => n.type === "zone")
                    .length || workspaceDraft.hierarchy.length,
                staff: workspaceDraft.users?.length || 0,
                washrooms: workspaceDraft.washrooms?.length || 0,
                cleaners:
                  workspaceDraft.users?.filter((u) => u.role === "cleaner")
                    .length || 0,
              }}
              isLoading={deployMutation.isPending}
              washroom_data={workspaceDraft.washrooms || []}
              onDeploy={handleDeploy}
              onBack={handlePrevStep}
            />
          ))}

        {currentStep === 5 && <DashboardStep onBack={handlePrevStep} />}
      </main>
    </div>
  );
}
