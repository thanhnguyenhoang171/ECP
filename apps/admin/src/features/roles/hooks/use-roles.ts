'use client';

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { toast } from 'sonner';
import { roleApi } from '../api/role.api';
import { RoleRequest, Role, PermissionRequest, RoleAccess, Permission } from '../types/role.interface';
import { getApiErrorMessage } from '@/constants/errorMessages';

export function useRoleAccess(): UseQueryResult<RoleAccess, Error> {
  return useQuery({ queryKey: ['role-access'], queryFn: roleApi.getAccess, staleTime: 0 });
}

export function useUpdatePermission(): UseMutationResult<Permission, Error, { id: string; data: PermissionRequest }> {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }) => roleApi.updatePermission(id, data), onSuccess: () => {
    toast.success('Đã cập nhật quyền.');
    void client.invalidateQueries({ queryKey: ['permissions'] });
    void client.invalidateQueries({ queryKey: ['roles'] });
  }, onError: error => { toast.error(getApiErrorMessage(error, 'Không thể cập nhật quyền.')); } });
}

export function useDeletePermission(): UseMutationResult<void, Error, string> {
  const client = useQueryClient();
  return useMutation({ mutationFn: roleApi.deletePermission, onSuccess: () => {
    toast.success('Đã xoá quyền.');
    void client.invalidateQueries({ queryKey: ['permissions'] });
    void client.invalidateQueries({ queryKey: ['roles'] });
  }, onError: error => { toast.error(getApiErrorMessage(error, 'Không thể xoá quyền.')); } });
}

export function useRoles(initialData?: Role[]): UseQueryResult<Role[], Error> {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => roleApi.getAll(),
    placeholderData: initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRole(idOrCode?: string): UseQueryResult<Role, Error> {
  return useQuery({
    queryKey: ['roles', idOrCode],
    queryFn: () => (idOrCode ? roleApi.getByCode(idOrCode) : Promise.reject(new Error('Chưa cung cấp ID vai trò'))),
    enabled: !!idOrCode,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePermissions(): UseQueryResult<Permission[], Error> {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: () => roleApi.getAllPermissions(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreatePermission(): UseMutationResult<Permission, Error, PermissionRequest> {
  const queryClient = useQueryClient();

  return useMutation<Permission, Error, PermissionRequest>({
    mutationFn: (data: PermissionRequest) => roleApi.createPermission(data),
    onSuccess: (newPerm) => {
      toast.success(`Tạo quyền hạn "${newPerm.name}" thành công`);
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      void queryClient.invalidateQueries({ queryKey: ['role-access'] });
    },
    onError: (error: unknown) => {
      const msg = getApiErrorMessage(error, 'Tạo quyền hạn thất bại');
      toast.error(msg, { id: msg });
    },
  });
}

export function useCreateRole(): UseMutationResult<Role, Error, RoleRequest> {
  const queryClient = useQueryClient();

  return useMutation<Role, Error, RoleRequest>({
    mutationFn: (data: RoleRequest) => roleApi.create(data),
    onSuccess: (newRole) => {
      toast.success(`Tạo vai trò "${newRole.name}" thành công`);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      void queryClient.invalidateQueries({ queryKey: ['role-access'] });
    },
    onError: (error: unknown) => {
      const msg = getApiErrorMessage(error, 'Tạo vai trò thất bại');
      toast.error(msg, { id: msg });
    },
  });
}

export function useUpdateRole(): UseMutationResult<Role, Error, { id: string; data: RoleRequest }> {
  const queryClient = useQueryClient();

  return useMutation<Role, Error, { id: string; data: RoleRequest }>({
    mutationFn: ({ id, data }: { id: string; data: RoleRequest }) => roleApi.update(id, data),
    onSuccess: (updatedRole) => {
      toast.success(`Cập nhật vai trò "${updatedRole.name}" thành công`);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      void queryClient.invalidateQueries({ queryKey: ['role-access'] });
    },
    onError: (error: unknown) => {
      const msg = getApiErrorMessage(error, 'Cập nhật vai trò thất bại');
      toast.error(msg, { id: msg });
    },
  });
}

export function useDeleteRole(): UseMutationResult<{ success: boolean }, Error, string> {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (id: string) => roleApi.delete(id),
    onSuccess: () => {
      toast.success('Xóa vai trò thành công');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      void queryClient.invalidateQueries({ queryKey: ['role-access'] });
    },
    onError: (error: unknown) => {
      const msg = getApiErrorMessage(error, 'Xóa vai trò thất bại');
      toast.error(msg, { id: msg });
    },
  });
}
