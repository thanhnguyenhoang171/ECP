'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Warehouse } from "lucide-react";

export default function WarehousesPage() {
  return (
    <div className="flex items-center justify-center min-h-[400px] animate-in fade-in zoom-in duration-500">
      <Card className="w-full max-w-md border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-50 p-3 rounded-full w-fit mb-4">
            <Warehouse className="h-10 w-10 text-blue-500 opacity-80" />
          </div>
          <CardTitle>Danh sách kho hàng</CardTitle>
          <CardDescription>Tính năng quản lý đa kho đang được triển khai.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground italic">
          Coming soon!
        </CardContent>
      </Card>
    </div>
  );
}
