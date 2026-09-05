export interface Permission {
  id: string;
  code: string;
  name: string;
  module: string;
  description?: string;
}

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: Permission[];
}

export interface RoleRequest {
  code: string;
  name: string;
  description?: string;
  permissionCodes: string[];
}

export interface PermissionRequest {
  code: string;
  name: string;
  module: string;
  description?: string;
}

