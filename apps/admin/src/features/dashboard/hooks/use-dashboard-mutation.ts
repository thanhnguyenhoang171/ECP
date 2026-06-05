import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";
import { toast } from "sonner";

export function usePurgeDatabase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => dashboardApi.purgeDatabase(),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Xoá toàn bộ dữ liệu thành công');
        // Làm mới toàn bộ cache của toàn bộ ứng dụng để đảm bảo dữ liệu được cập nhật sau khi xoá
        queryClient.clear();
      } else {
        // toast.error is handled globally by clientFetch
        toast.error('Xoá dữ liệu thất bại');
      }
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      // toast.error is handled globally by clientFetch
      toast.error('Xoá dữ liệu thất bại');  
    },
  });
}

