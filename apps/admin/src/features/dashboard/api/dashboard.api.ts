import { clientFetch } from "@/lib/clientFetch";

export const dashboardApi = {
    // Xoá toàn bộ database
  purgeDatabase: async (): Promise<{ success: boolean; data: null }> => {
    const res = await clientFetch('v1/system/purge-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to purge data');
    return result;
  },

};
