import { PageResponse } from "@/types/pagination";
import { AuditLog } from "../types/audit-logs.interface";
import { clientFetch } from "@/lib/clientFetch";

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
    query.append('page', params.page.toString());
    query.append('size', params.size.toString());

    if (params.sort) query.append('sort', params.sort);

    // Filter params
    if (params.action) query.append('action', params.action);
    if (params.username) query.append('username', params.username);
 

    const res = await clientFetch(`v1/audit-logs?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },
};
