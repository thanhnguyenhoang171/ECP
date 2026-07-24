import { PageResponse } from "@/types/pagination";
import { AuditLog } from "../types/audit-logs.interface";
import { clientFetch } from "@/lib/clientFetch";
import { toApiPage, syncPagination } from "@/lib/utils";

export const auditLogsApi = {
  getPaged: async (params: {
    page: number;
    size: number;
    sort?: string;
    action?: string;
    username?: string;
  }): Promise<PageResponse<AuditLog>> => {
    const query = new URLSearchParams();

    // Pageable params
    query.append('page', toApiPage(params.page).toString());
    query.append('size', params.size.toString());

    if (params.sort) query.append('sort', params.sort);
    if (params.action) query.append('action', params.action);
    if (params.username) query.append('username', params.username);

    const res = await clientFetch(`v1/audit-logs?${query.toString()}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      return {
        success: false,
        data: [],
        pagination: {
          currentPage: params.page,
          totalPages: 0,
          totalElements: 0,
          pageSize: params.size,
          first: true,
          last: true
        }
      };
    }

    const body = await res.json();
    const inner = body?.data?.data ? body.data : body;
    const items = Array.isArray(inner?.data) 
      ? inner.data 
      : Array.isArray(body?.data) 
        ? body.data 
        : Array.isArray(body) 
          ? body 
          : [];

    const pagination = inner?.pagination || body?.pagination || {
      currentPage: params.page,
      totalPages: 1,
      totalElements: items.length,
      pageSize: params.size,
      first: true,
      last: true
    };

    return syncPagination<PageResponse<AuditLog>>({
      success: body?.success ?? true,
      message: body?.message || inner?.message,
      data: items,
      pagination
    });
  },
};
