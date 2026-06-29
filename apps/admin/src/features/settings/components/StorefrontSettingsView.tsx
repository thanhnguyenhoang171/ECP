'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Layout, 
  Image as ImageIcon, 
  Type, 
  Palette, 
  Save, 
  Plus, 
  Trash2, 
  Eye,
  Monitor,
  CheckCircle2
} from 'lucide-react';
import { 
  PageHeader, 
  DataCard, 
  Badge 
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function StorefrontSettingsView() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      toast.success('Đã cập nhật cấu hình giao diện thành công');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cấu hình Giao diện"
        breadcrumbs={[
          { label: 'Hệ thống', href: '/settings' },
          { label: 'Storefront', active: true }
        ]}
        action={
          <Button onClick={handleSave} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
            <Save size={18} className="mr-2" /> Lưu thay đổi
          </Button>
        }
      />

      <Tabs defaultValue="header" className="w-full">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl mb-6">
          <TabsTrigger value="header" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg px-6 py-2">
            <Layout size={16} className="mr-2" /> Header & Logo
          </TabsTrigger>
          <TabsTrigger value="banners" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg px-6 py-2">
            <ImageIcon size={16} className="mr-2" /> Banner Sliders
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg px-6 py-2">
            <Palette size={16} className="mr-2" /> Màu sắc & Nền
          </TabsTrigger>
        </TabsList>

        {/* HEADER SETTINGS */}
        <TabsContent value="header">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <DataCard className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Monitor size={16} className="text-indigo-600" /> Logo Website
                  </h3>
                  <div className="flex items-start gap-6">
                    <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden relative">
                       <Image src="/logo/z7862984783113_196fdab6026e07fc4a13a745f502233b.jpg" alt="Logo" fill className="object-cover" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-xs text-slate-500">Kích thước khuyến nghị: 200x200px. Định dạng: PNG, SVG, JPG.</p>
                      <Button variant="outline" size="sm">Thay đổi Logo</Button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Type size={16} className="text-indigo-600" /> Thanh thông báo (Announcement Bar)
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold">Hiển thị thông báo</Label>
                      <p className="text-xs text-slate-500">Hiển thị một dải thông báo ở đầu website.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label>Nội dung thông báo</Label>
                    <Input placeholder="Ví dụ: Miễn phí vận chuyển cho đơn hàng từ 500k!" defaultValue="🔥 Khuyến mãi Hè: Giảm đến 50% cho tất cả sản phẩm Phụ kiện!" />
                  </div>
                </div>
              </DataCard>
            </div>
            
            <div className="space-y-6">
              <DataCard className="p-6 bg-slate-900 text-white border-none">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-indigo-400">
                  <Eye size={16} /> Xem trước nhanh
                </h4>
                <div className="space-y-4">
                  <div className="w-full h-8 bg-indigo-600 rounded flex items-center justify-center text-[10px] font-bold">
                    🔥 Khuyến mãi Hè: Giảm đến 50%...
                  </div>
                  <div className="w-full h-12 bg-white/10 rounded flex items-center justify-between px-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full" />
                    <div className="flex gap-2">
                      <div className="w-8 h-2 bg-white/20 rounded" />
                      <div className="w-8 h-2 bg-white/20 rounded" />
                    </div>
                  </div>
                </div>
              </DataCard>
            </div>
          </div>
        </TabsContent>

        {/* BANNER SETTINGS */}
        <TabsContent value="banners">
           <DataCard className="p-0 overflow-hidden">
             <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
               <h3 className="text-sm font-bold text-slate-900">Danh sách Banner Slideshow</h3>
               <Button size="sm" className="bg-slate-900 text-white h-8"><Plus size={14} className="mr-2" /> Thêm Banner</Button>
             </div>
             <div className="divide-y divide-slate-100">
                {[1, 2].map((i) => (
                  <div key={i} className="p-6 flex items-start gap-6 group hover:bg-slate-50/50 transition-colors">
                     <div className="w-48 h-28 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0 relative">
                       <Image src={`/background/${i === 1 ? 'abstract' : 'dark-space'}.jpg`} fill className="object-cover" alt="Banner" />
                     </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge className={i === 1 ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"}>
                          {i === 1 ? 'Đang hiển thị' : 'Bản nháp'}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600"><Save size={14} /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-600"><Trash2 size={14} /></Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase text-slate-400">Tiêu đề Banner</Label>
                          <Input className="h-8 text-xs" defaultValue={i === 1 ? "Siêu Sale Mùa Hè" : "Bộ sưu tập mới"} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase text-slate-400">Đường dẫn (Link)</Label>
                          <Input className="h-8 text-xs" defaultValue="/catalog/summer-sale" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
           </DataCard>
        </TabsContent>

        {/* APPEARANCE SETTINGS */}
        <TabsContent value="appearance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DataCard className="p-6 space-y-6">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Palette size={16} className="text-indigo-600" /> Tông màu chủ đạo
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {['#4F46E5', '#0EA5E9', '#10B981', '#F43F5E'].map((color) => (
                  <div key={color} className="flex flex-col items-center gap-2">
                    <div 
                      className={cn(
                        "w-12 h-12 rounded-full cursor-pointer border-2 transition-all",
                        color === '#4F46E5' ? "border-indigo-600 ring-2 ring-indigo-100" : "border-transparent"
                      )} 
                      style={{ backgroundColor: color }} 
                    />
                    <span className="text-[10px] font-bold text-slate-500">{color}</span>
                  </div>
                ))}
              </div>
            </DataCard>

            <DataCard className="p-6 space-y-6">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon size={16} className="text-indigo-600" /> Hình nền Website
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <Label className="font-bold">Sử dụng hình nền</Label>
                    <Switch defaultChecked />
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                    {['abstract.jpg', 'default.jpg', 'moutain.jpg'].map((img) => (
                      <div key={img} className="relative rounded-lg overflow-hidden h-20 border-2 border-transparent hover:border-indigo-600 cursor-pointer transition-all">
                        <Image src={`/background/${img}`} fill className="object-cover" alt="Background option" />
                        <div className="absolute inset-0 bg-black/20" />
                        {img === 'abstract.jpg' && <CheckCircle2 className="absolute top-1 right-1 text-white" size={14} />}
                      </div>
                    ))}
                 </div>
              </div>
            </DataCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
