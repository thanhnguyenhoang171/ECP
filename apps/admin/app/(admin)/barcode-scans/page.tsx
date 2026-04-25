'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScanBarcode } from "lucide-react";

export default function BarcodeScansPage() {
  return (
    <div className="flex items-center justify-center min-h-[400px] animate-in fade-in zoom-in duration-500">
      <Card className="w-full max-w-md border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto bg-purple-50 p-3 rounded-full w-fit mb-4">
            <ScanBarcode className="h-10 w-10 text-purple-500 opacity-80" />
          </div>
          <CardTitle>Quét mã vạch</CardTitle>
          <CardDescription>Tính năng quét mã vạch qua Camera/Máy quét.</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground italic">
          Đang kết nối thiết bị...
        </CardContent>
      </Card>
    </div>
  );
}
