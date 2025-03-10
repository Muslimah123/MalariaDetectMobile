// constants/Roles.ts
export enum UserRole {
    LAB_TECHNICIAN = 'lab_technician',
    DOCTOR = 'doctor',
    ADMIN = 'admin'
  }
  
  export interface RolePermission {
    canViewPatientDetails: boolean;
    canEditPatientDetails: boolean;
    canCaptureImages: boolean;
    canUploadImages: boolean;
    canAnalyzeImages: boolean;
    canViewReports: boolean;
    canGenerateReports: boolean;
    canAccessAdminPanel: boolean;
    canManageUsers: boolean;
  }
  
  export const RolePermissions: Record<UserRole, RolePermission> = {
    [UserRole.LAB_TECHNICIAN]: {
      canViewPatientDetails: true,
      canEditPatientDetails: false,
      canCaptureImages: true,
      canUploadImages: true,
      canAnalyzeImages: true,
      canViewReports: false,
      canGenerateReports: false,
      canAccessAdminPanel: false,
      canManageUsers: false
    },
    [UserRole.DOCTOR]: {
      canViewPatientDetails: true,
      canEditPatientDetails: true,
      canCaptureImages: true,
      canUploadImages: true,
      canAnalyzeImages: true,
      canViewReports: true,
      canGenerateReports: true,
      canAccessAdminPanel: false,
      canManageUsers: false
    },
    [UserRole.ADMIN]: {
      canViewPatientDetails: true,
      canEditPatientDetails: true,
      canCaptureImages: true,
      canUploadImages: true,
      canAnalyzeImages: true,
      canViewReports: true,
      canGenerateReports: true,
      canAccessAdminPanel: true,
      canManageUsers: true
    }
  };