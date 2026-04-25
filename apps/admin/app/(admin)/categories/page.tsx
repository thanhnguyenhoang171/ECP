'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function CategoriesPage() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto bg-muted p-3 rounded-full w-fit mb-4">
            <Package className="h-10 w-10 text-muted-foreground opacity-20" />
          </div>
          <CardTitle>Quản lý danh mục</CardTitle>
          <CardDescription>Trang quản lý danh mục sản phẩm đang được phát triển.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground italic">
          Vui lòng quay lại sau!
        </CardContent>
      </Card>
    </div>
  );
}
