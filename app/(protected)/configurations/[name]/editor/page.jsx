"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import Loader from "@/components/ui/Loader";
import { useCompanyId } from "@/providers/CompanyProvider";
import {
  useConfigById,
  useUpdateConfigByName,
} from "@/features/configurations/configurations.queries";

import UsageCategoryEditor from "./components/UsageCategoryEditor";
import AdditionalFeaturesEditor from "./components/AdditionalFeaturesEditor";

const INITIAL_USAGE_STATE = {
  type: "usage_category",
  version: 1,
  categories: [],
};
const INITIAL_FEATURES_STATE = {
  type: "additional_features",
  version: 1,
  categories: [],
};

export default function ConfigurationEditorRouter() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const configName = params.name;
  const configId = searchParams.get("id");
  const isViewMode = searchParams.get("mode") === "view";

  const { companyId } = useCompanyId();

  // 1. Fetch the data
  const { data: configRecord, isLoading } = useConfigById(configId);

  // 2. Fetch the mutation hook
  const { mutateAsync: updateConfig, isPending: isSaving } =
    useUpdateConfigByName();

  // 3. Block render until data is fully resolved
  if (isLoading)
    return <Loader size="large" message="Loading configuration schema..." />;

  // 4. Calculate the initial data straight from the response (No useEffect needed!)
  const initialData =
    configRecord?.description ||
    (configName === "LOCATION_ADDITIONAL_FEATURES"
      ? INITIAL_FEATURES_STATE
      : INITIAL_USAGE_STATE);

  // 5. Pass everything down to the child
  if (configName === "LOCATION_ADDITIONAL_FEATURES") {
    return (
      <AdditionalFeaturesEditor
        initialData={initialData}
        configName={configName}
        isViewMode={isViewMode}
        companyId={companyId}
        updateConfig={updateConfig}
        isSaving={isSaving}
        router={router}
      />
    );
  }

  return (
    <UsageCategoryEditor
      initialData={initialData}
      configName={configName}
      isViewMode={isViewMode}
      companyId={companyId}
      updateConfig={updateConfig}
      isSaving={isSaving}
      router={router}
    />
  );
}
