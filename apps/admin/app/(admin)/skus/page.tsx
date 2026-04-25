'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tags } from "lucide-react";

export default function SkusPage() {
  return (
    <div className="flex items-center justify-center min-h-[400px] animate-in fade-in zoom-in duration-500">
      <Card className="w-full max-w-md border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-50 p-3 rounded-full w-fit mb-4">
            <Tags className="h-10 w-10 text-blue-500 opacity-80" />
          </div>
          <CardTitle>Quản lý SKUs</CardTitle>
          <CardDescription>Tính năng quản lý đơn vị lưu kho đang được hoàn thiện.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground italic">
          Vui lòng quay lại sau!
        </CardContent>
      </Card>
    </div>
  );
}
