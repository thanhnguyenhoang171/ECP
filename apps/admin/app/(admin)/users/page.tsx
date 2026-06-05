import React from 'react';
import UsersView from '@/features/users/components/UsersView';
import { PageResponse } from '@/types/pagination';
import { User } from '@/features/users/types/user.interface';
import { serverFetch } from '@/lib/serverFetch';
import { toApiPage, syncPagination } from '@/lib/utils';
import { BackendUserResponse, mapBackendUserToFrontend, UserStatistics } from '@/features/users/api/user.api';

// Hàm fetch dữ liệu tại Server với Caching
async function getUsers(
  page: number,
  size: number,
  sort: string,
): Promise<PageResponse<User>> {
  try {
    const apiPage = toApiPage(page);
    const res = await serverFetch(
      `v1/users?page=${apiPage}&size=${size}&sort=${sort}`,
      {
        cache: 'no-store', // Admin mong muốn dữ liệu mới nhất khi F5
        next: {
          tags: ['users-list'],
        },
      } as any,
    );

    if (!res.ok) throw new Error('Failed to fetch users');

    const result: PageResponse<BackendUserResponse> = await res.json();
    
    // Ánh xạ dữ liệu từ backend sang cấu trúc frontend
    const mappedData: User[] = (result.data || []).map(mapBackendUserToFrontend);
    
    const mappedResult: PageResponse<User> = {
      ...result,
      data: mappedData,
    };
    
    return syncPagination<PageResponse<User>>(mappedResult);
  } catch (error) {
    console.error('Server fetch users error:', error);
    return {
      success: false,
      message: 'Error fetching data from server',
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalElements: 0,
        pageSize: size,
        last: true,
        first: true,
      },
    };
  }
}

// Hàm fetch thống kê người dùng tại Server
async function getStatistics(): Promise<UserStatistics> {
  try {
    const res = await serverFetch('v1/users/statistics', {
      cache: 'no-store',
      next: {
        tags: ['users-statistics'],
      },
    } as any);

    if (!res.ok) throw new Error('Failed to fetch user statistics');

    const result = await res.json();
    return result.success ? result.data : { totalUsers: 0, onlineUsers: 0, offlineUsers: 0, managementUsers: 0 };
  } catch (error) {
    console.error('Server fetch statistics error:', error);
    return {
      totalUsers: 0,
      onlineUsers: 0,
      offlineUsers: 0,
      managementUsers: 0,
    };
  }
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const size = Number(params.size) || 10;
  const sort = (params.sort as string) || 'createdAt,desc';

  const [usersResponse, statisticsResponse] = await Promise.all([
    getUsers(page, size, sort),
    getStatistics(),
  ]);

  return <UsersView initialData={usersResponse} initialStats={statisticsResponse} />;
}

