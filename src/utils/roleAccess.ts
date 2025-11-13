// utils/roleAccess.ts

export const CAN_EDIT_ROLES = ["super_admin", "warehouse_manager"];

export const CAN_DELETE_ROLES = ["super_admin", "warehouse_manager"];

export const CAN_VIEW_ROLES = [
  "super_admin",
  "warehouse_manager",
  //"warehouse_staff",
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

export const CAN_CLICK_ROLES = ["super_admin", "warehouse_manager"];

export function canClick(role: string | null) {
  return CAN_CLICK_ROLES.includes(role || "");
}
