'use client';

import React from 'react';
import { ScanBarcode } from "lucide-react";
import { PageHeader, Breadcrumbs } from '@/components/common';
import { Card, CardContent } from '@/components/ui/card';
import BarcodeScanner from './BarcodeScanner';

export default function BarcodeScansView() {
  const breadcrumbItems = [
    { label: 'Quét mã vạch', icon: ScanBarcode },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      <PageHeader 
        title="Quét mã vạch"
        description="Nhập/Xuất hàng nhanh chóng bằng cách quét mã vạch hoặc mã QR."
      />
      
      <div className="max-w-2xl mx-auto">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-6">
            <BarcodeScanner />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

