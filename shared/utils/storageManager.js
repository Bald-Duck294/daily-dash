/**
 * Centralized Storage Manager for Onboarding Persistence
 */

const TTL_MS = 45 * 24 * 60 * 60 * 1000; // 45 days in milliseconds
const WORKSPACE_VERSION = 1;
const COMPANY_SETUP_VERSION = 1;

// Helper to safely access localStorage (prevents SSR crashes)
const getLocalStorage = () => {
  if (typeof window !== "undefined") {
    return window.localStorage;
  }
  return null;
};

export const StorageManager = {
  /**
   * ─── LEGACY CLEANUP ─────────────────────────────────────────
   * Purge old static keys to ensure no conflicts or data leakage.
   */
  purgeLegacyDrafts: () => {
    const ls = getLocalStorage();
    if (!ls) return;
    ls.removeItem("safai_onboarding_draft");
    ls.removeItem("company_setup_draft");
  },

  /**
   * ─── WORKSPACE STEPPER ──────────────────────────────────────
   */
  getWorkspaceKey: (companyId) => `safai_workspace_draft_v1_${companyId}`,

  saveWorkspaceDraft: (companyId, currentStep, workspaceDraft) => {
    const ls = getLocalStorage();
    if (!ls || !companyId) return;

    const payload = {
      version: WORKSPACE_VERSION,
      companyId: companyId,
      savedAt: Date.now(),
      currentStep: currentStep,
      data: workspaceDraft,
    };

    try {
      ls.setItem(
        StorageManager.getWorkspaceKey(companyId),
        JSON.stringify(payload)
      );
    } catch (e) {
      console.error("StorageManager: Failed to save workspace draft", e);
    }
  },

  loadWorkspaceDraft: (companyId) => {
    const ls = getLocalStorage();
    if (!ls || !companyId) return null;

    const key = StorageManager.getWorkspaceKey(companyId);
    const rawData = ls.getItem(key);

    if (!rawData) return null;

    try {
      const parsed = JSON.parse(rawData);

      // 1. Validate Schema
      if (
        parsed.version !== WORKSPACE_VERSION ||
        !parsed.savedAt ||
        !parsed.data ||
        typeof parsed.currentStep !== "number"
      ) {
        throw new Error("Invalid draft schema");
      }

      // 2. Validate Context
      if (parsed.companyId !== companyId) {
        throw new Error("Company ID mismatch");
      }

      // 3. Validate Expiration
      if (Date.now() - parsed.savedAt > TTL_MS) {
        throw new Error("Draft expired");
      }

      return {
        currentStep: parsed.currentStep,
        workspaceDraft: parsed.data,
      };
    } catch (e) {
      console.warn(
        "StorageManager: Discarding corrupted/expired workspace draft",
        e
      );
      ls.removeItem(key);
      return null;
    }
  },

  clearWorkspaceDraft: (companyId) => {
    const ls = getLocalStorage();
    if (!ls || !companyId) return;
    ls.removeItem(StorageManager.getWorkspaceKey(companyId));
  },

  /**
   * ─── COMPANY SETUP ──────────────────────────────────────────
   */
  getCompanySetupKey: (userId) => `safai_company_setup_draft_v1_${userId}`,

  saveCompanySetupDraft: (userId, step, formData) => {
    const ls = getLocalStorage();
    if (!ls || !userId) return;

    const payload = {
      version: COMPANY_SETUP_VERSION,
      userId: userId,
      savedAt: Date.now(),
      currentStep: step,
      data: formData,
    };

    try {
      ls.setItem(
        StorageManager.getCompanySetupKey(userId),
        JSON.stringify(payload)
      );
    } catch (e) {
      console.error("StorageManager: Failed to save company setup draft", e);
    }
  },

  loadCompanySetupDraft: (userId) => {
    const ls = getLocalStorage();
    if (!ls || !userId) return null;

    const key = StorageManager.getCompanySetupKey(userId);
    const rawData = ls.getItem(key);

    if (!rawData) return null;

    try {
      const parsed = JSON.parse(rawData);

      // 1. Validate Schema
      if (
        parsed.version !== COMPANY_SETUP_VERSION ||
        !parsed.savedAt ||
        !parsed.data ||
        typeof parsed.currentStep !== "number"
      ) {
        throw new Error("Invalid draft schema");
      }

      // 2. Validate Context
      if (parsed.userId !== userId) {
        throw new Error("User ID mismatch");
      }

      // 3. Validate Expiration
      if (Date.now() - parsed.savedAt > TTL_MS) {
        throw new Error("Draft expired");
      }

      return {
        step: parsed.currentStep,
        formData: parsed.data,
      };
    } catch (e) {
      console.warn(
        "StorageManager: Discarding corrupted/expired company setup draft",
        e
      );
      ls.removeItem(key);
      return null;
    }
  },

  clearCompanySetupDraft: (userId) => {
    const ls = getLocalStorage();
    if (!ls || !userId) return;
    ls.removeItem(StorageManager.getCompanySetupKey(userId));
  },
};
