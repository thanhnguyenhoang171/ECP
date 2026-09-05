'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { roleApi } from '../api/role.api';
import { RoleRequest, Role, PermissionRequest } from '../types/role.interface';

export function useRoles(initialData?: Role[]) {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => roleApi.getAll(),
    placeholderData: initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRole(idOrCode?: string) {
  return useQuery({
    queryKey: ['roles', idOrCode],
    queryFn: () => (idOrCode ? roleApi.getByCode(idOrCode) : Promise.reject(new Error('Chưa cung cấp ID vai trò'))),
    enabled: !!idOrCode,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => roleApi.getAllPermissions(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PermissionRequest) => roleApi.createPermission(data),
    onSuccess: (newPerm) => {
      toast.success(`Tạo quyền hạn "${newPerm.name}" thành công`);
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Tạo quyền hạn thất bại');
    },
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RoleRequest) => roleApi.create(data),
    onSuccess: (newRole) => {
      toast.success(`Tạo vai trò "${newRole.name}" thành công`);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Tạo vai trò thất bại');
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoleRequest }) => roleApi.update(id, data),
    onSuccess: (updatedRole) => {
      toast.success(`Cập nhật vai trò "${updatedRole.name}" thành công`);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Cập nhật vai trò thất bại');
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => roleApi.delete(id),
    onSuccess: () => {
      toast.success('Xóa vai trò thành công');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Xóa vai trò thất bại');
    },
  });
}
