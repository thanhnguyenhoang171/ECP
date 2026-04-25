'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function CustomersPage() {
  return (
    <div className="flex items-center justify-center min-h-[400px] animate-in fade-in zoom-in duration-500">
      <Card className="w-full max-w-md border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto bg-indigo-50 p-3 rounded-full w-fit mb-4">
            <Users className="h-10 w-10 text-indigo-500 opacity-80" />
          </div>
          <CardTitle>Quản lý khách hàng</CardTitle>
          <CardDescription>Thông tin khách hàng và lịch sử mua hàng.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground italic">
          Đang cập nhật danh sách...
        </CardContent>
      </Card>
    </div>
  );
}
