export interface RoleAccess {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface Permission {
  system?: boolean;
  editable?: boolean;
  deletable?: boolean;
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
  editable?: boolean;
  deletable?: boolean;
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

