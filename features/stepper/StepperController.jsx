// "use client";
// import React, { useState, useEffect } from "react";
// import { useDeployWorkspace } from "./queries/workspace.queries";
// import { buildDeploymentPayload } from "./utils/payloadBuilder";

// import StepperNav from "./components/StepperNav";
// import HierarchyStep from "./components/setup/HierarchyStep";
// import WashroomsStep from "./components/setup/WashroomsStep";
// import UsersStep from "./components/setup/UsersStep";
// import AppPreviewStep from "./components/setup/AppPreviewStep";
// import DashboardStep from "./components/setup/DashboardStep";

// export default function StepperController() {
//   // ❌ Phase state removed. We always start at step 1.
//   const [currentStep, setCurrentStep] = useState(1);

//   // --- THE SINGLE SOURCE OF TRUTH ---
//   const [workspaceDraft, setWorkspaceDraft] = useState({
//     hierarchy: [],
//     washrooms: [],
//     users: [],
//   }); // ❌ discovery object removed

//   const deployMutation = useDeployWorkspace();

//   useEffect(() => {
//     console.log("📊 [STATE TRACKER] Workspace Draft Updated:", workspaceDraft);
//   }, [workspaceDraft]);

//   const updateDraft = (key, data) => {
//     setWorkspaceDraft((prev) => {
//       const newState = { ...prev, [key]: data };
//       console.log(`📝 [STEPPER] Draft Updated -> Key: [${key}]`, data);
//       return newState;
//     });
//   };

//   const handleNextStep = (stepData, dataKey) => {
//     if (dataKey) {
//       updateDraft(dataKey, stepData);
//     }
//     if (currentStep < 5) {
//       setCurrentStep((prev) => prev + 1);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   const handlePrevStep = () => {
//     if (currentStep > 1) {
//       setCurrentStep((prev) => prev - 1);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   const handleNavClick = (stepId) => {
//     setCurrentStep(stepId);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleDeploy = () => {
//     console.log("⚙️ [DEPLOY] Compiling final payload...");
//     const payload = buildDeploymentPayload(workspaceDraft);

//     deployMutation.mutate(payload, {
//       onSuccess: () => {
//         handleNextStep(null, null);
//       },
//     });
//   };

//   return (
//     <div className="w-full min-h-full bg-[#F5F7FA] flex flex-col">
//       <StepperNav currentStep={currentStep} onStepChange={handleNavClick} />

//       <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
//         {currentStep === 1 && (
//           <HierarchyStep
//             nodes={workspaceDraft.hierarchy}
//             // ❌ discoveryProfile prop removed
//             onNext={(nodes) => handleNextStep(nodes, "hierarchy")}
//           />
//         )}

//         {currentStep === 2 && (
//           <WashroomsStep
//             nodes={workspaceDraft.hierarchy}
//             washrooms={workspaceDraft.washrooms}
//             onNext={(washrooms) => handleNextStep(washrooms, "washrooms")}
//             onBack={handlePrevStep}
//           />
//         )}

//         {currentStep === 3 && (
//           <UsersStep
//             nodes={workspaceDraft.hierarchy}
//             washrooms={workspaceDraft.washrooms}
//             users={workspaceDraft.users}
//             onNext={(users) => handleNextStep(users, "users")}
//             onBack={handlePrevStep}
//           />
//         )}

//         {currentStep === 4 &&
//           (console.log("entered the  4th step", workspaceDraft.washrooms),
//           (
//             <AppPreviewStep
//               summary={{
//                 zones:
//                   workspaceDraft.hierarchy.filter((n) => n.type === "zone")
//                     .length || workspaceDraft.hierarchy.length,
//                 staff: workspaceDraft.users?.length || 0,
//                 washrooms: workspaceDraft.washrooms?.length || 0,
//                 cleaners:
//                   workspaceDraft.users?.filter((u) => u.role === "cleaner")
//                     .length || 0,
//               }}
//               isLoading={deployMutation.isPending}
//               washroom_data={workspaceDraft.washrooms || []}
//               onDeploy={handleDeploy}
//               onBack={handlePrevStep}
//             />
//           ))}

//         {currentStep === 5 && <DashboardStep onBack={handlePrevStep} />}
//       </main>
//     </div>
//   );
// }

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
import DashboardStep from "./components/setup/DashboardStep";

// 🚀 PERSISTENCE CONFIGURATION
const STORAGE_KEY = "safai_onboarding_draft";
const STORAGE_VERSION = 1;

export default function StepperController() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth) || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [workspaceDraft, setWorkspaceDraft] = useState({
    hierarchy: [],
    washrooms: [],
    users: [],
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const deployMutation = useDeployWorkspace();

  // ─── 1. THE HYDRATION LIFECYCLE (Strict Sequence) ───────────────
  useEffect(() => {
    // A. Wait for Auth User to be available
    if (!user) return;

    // B. Database vs LocalStorage Conflict Resolution
    // Assuming your user object contains the company details
    const companyData = user?.company || {};
    const isOnboardingDone = companyData?.is_onboarding_completed;

    if (isOnboardingDone) {
      // DB says it's done. Wipe corrupted/old drafts and send to dashboard.
      localStorage.removeItem(STORAGE_KEY);
      router.replace("/dashboard"); // or wherever your dashboard route is
      return;
    }

    // C. Safe Hydration from Local Storage
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);

        // Version Check: Ignore old structures if we updated the app
        if (parsed.version === STORAGE_VERSION) {
          if (parsed.currentStep) setCurrentStep(parsed.currentStep);
          if (parsed.workspaceDraft) setWorkspaceDraft(parsed.workspaceDraft);
        } else {
          // Version mismatch -> wipe old draft
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        // Corruption Check -> wipe corrupt draft immediately to prevent crash loops
        console.error("Corrupted draft found, clearing...");
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // D. Activation (Allows saving to begin)
    setIsLoaded(true);
  }, [user, router]);

  // ─── 2. LIFECYCLE-AWARE SAVING ──────────────────────────────────
  useEffect(() => {
    // DO NOT save if we haven't successfully hydrated yet. Overwriting danger!
    if (!isLoaded) return;

    const draft = {
      version: STORAGE_VERSION,
      savedAt: Date.now(),
      currentStep,
      workspaceDraft,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [currentStep, workspaceDraft, isLoaded]);

  // ─── STEP HANDLERS ──────────────────────────────────────────────
  const updateDraft = (key, data) => {
    setWorkspaceDraft((prev) => ({ ...prev, [key]: data }));
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
    const payload = buildDeploymentPayload(workspaceDraft);

    deployMutation.mutate(payload, {
      onSuccess: () => {
        // 🚀 3. CLEANUP ONLY ON SUCCESS
        localStorage.removeItem(STORAGE_KEY);
        handleNextStep(null, null);
      },
      onError: (err) => {
        // Handled internally by your mutation, draft remains untouched so user can retry!
        console.error("Deployment failed, draft preserved.", err);
      },
    });
  };

  // ─── 4. RENDER GUARD (Prevents Hydration Mismatch Flash) ────────
  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="animate-pulse flex items-center gap-3 text-[#1F4E79] font-bold">
          <span className="text-2xl">⏳</span> Restoring Workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F7FA] flex flex-col">
      <StepperNav currentStep={currentStep} onStepChange={handleNavClick} />

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {currentStep === 1 && (
          <HierarchyStep
            nodes={workspaceDraft.hierarchy}
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

        {currentStep === 4 && (
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
        )}

        {currentStep === 5 && <DashboardStep onBack={handlePrevStep} />}
      </main>
    </div>
  );
}
