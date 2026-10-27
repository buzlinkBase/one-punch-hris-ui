export const MAX_GROUPS_PER_STEP = 5;

export const EMPTY_GROUP = {
  approverType: "Person" as const,
  approverEmployeeId: undefined,
  approverDepartmentId: undefined,
  approverPositionId: undefined,
  approverLevel: undefined,
  onUnresolved: "Block" as const,
  fallbackEmployeeId: undefined,
  minApprovals: 1,
};
