export const ARTIFACT_NAMES = new Set([
  "requirements",
  "execution-plan",
  "weather",
  "transport",
  "accommodation",
  "activities",
  "food",
  "packing",
  "budget",
  "validation",
  "daily-plan",
  "iteration-plan",
  "travel-guide",
]);

export const VALIDATION_ARTIFACT = "validation";

export const WORKFLOW_STATE_FILENAME = "workflow-state.json";

export const TRAVEL_GUIDE_FILE_REGEX = /^travel-guide\.html$/i;

export const StepStatus = Object.freeze({
  COMPLETED: "completed",
  PASSED: "passed",
  FAILED: "failed",
});

export const DocumentStatus = Object.freeze({
  DRAFT: "draft",
  APPROVED: "approved",
  REJECTED: "rejected",
});
