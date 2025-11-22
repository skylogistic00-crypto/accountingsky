// utils/roleAccess.ts

export const CAN_EDIT_ROLES = [
  "super_admin",
  "warehouse_manager",
  "accounting_manager",
];

export const CAN_DELETE_ROLES = [
  "super_admin",
  "warehouse_manager",
  "accounting_manager",
];

export const CAN_VIEW_ROLES = [
  "super_admin",
  "warehouse_manager",
  //  "accounting_staff",
  //"warehouse_staff",
  // "read_only",
];

// Fungsi helper global
export function canEdit(role: string | null) {
  return CAN_EDIT_ROLES.includes(role || "");
}

export function canDelete(role: string | null) {
  return CAN_DELETE_ROLES.includes(role || "");
}

export function canView(role: string | null) {
  return CAN_VIEW_ROLES.includes(role || "");
}

export const CAN_CLICK_ROLES = [
  "super_admin",
  "warehouse_manager",
  "accounting_manager",
  "customs_specialist",
  "accounting_staff",
  "warehouse_staff",
];

export function canClick(role: string | null) {
  return CAN_CLICK_ROLES.includes(role || "");
}

// Roles yang bisa approve purchase request
export const CAN_APPROVE_PR_ROLES = [
  "super_admin",
  "accounting_manager",
  "warehouse_manager",
];

export function canApprovePR(role: string | null) {
  return CAN_APPROVE_PR_ROLES.includes(role || "");
}

// Roles yang bisa complete purchase request
export const CAN_COMPLETE_PR_ROLES = [
  "super_admin",
  "warehouse_manager",
  "warehouse_staff",
];

export function canCompletePR(role: string | null) {
  return CAN_COMPLETE_PR_ROLES.includes(role || "");
}
