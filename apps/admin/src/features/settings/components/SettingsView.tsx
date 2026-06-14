'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  CreditCard, 
  Truck, 
  Globe, 
  Save, 
  Loader2, 
  Building,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { PageHeader, Breadcrumbs, Badge } from '@/components/common';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<'general' | 'payment' | 'shipping' | 'seo'>('general');
  const [isSaving, setIsSaving] = useState(false);

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    storeName: 'CACAO E-commerce',
    storeEmail: 'contact@cacao.com',
    storePhone: '0912345678',
    address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    currency: 'VND',
    language: 'vi',
  });

  // Payment Gateways State
  const [paymentSettings, setPaymentSettings] = useState({
    cod: { enabled: true },
    momo: { enabled: true, partnerCode: 'MOMO_PARTNER_2026', accessKey: 'MOMOAcessKey_998877' },
    zalopay: { enabled: false, appId: 'ZALOPAY_APP_12', accessKey: 'ZalopayKey_112233' },
    onepay: { enabled: true, merchantId: 'ONEPAY_MERCHANT', accessCode: 'OnepayCode_445566' },
  });

  // Shipping Partners State
  const [shippingSettings, setShippingSettings] = useState({
    ghn: { enabled: true, token: 'GHN-Token-8899', baseFee: 30000 },
    ghtk: { enabled: true, token: 'GHTK-Token-1122', baseFee: 25000 },
    viettel: { enabled: false, token: 'VTPOST-Token-4455', baseFee: 28000 },
  });

  // SEO Settings State
  const [seoSettings, setSeoSettings] = useState({
    metaTitle: 'CACAO E-commerce | Hệ thống mua sắm cà phê & ca cao cao cấp',
    metaDescription: 'Cung cấp các sản phẩm cà phê, bột ca cao nguyên chất, socola nghệ thuật chất lượng cao xuất xứ Việt Nam.',
    metaKeywords: 'ca cao, ca cao nguyen chat, socola viet nam, ca phe sach, cacao bot',
  });

  const handleSave = (section: string) => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success(`Đã lưu cấu hình phần [${section}] thành công!`);
    }, 1000);
  };

  const breadcrumbItems = [
    { label: 'Cài đặt hệ thống', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="p-2 flex flex-col gap-1 text-left">
              <button
                onClick={() => setActiveTab('general')}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                  activeTab === 'general'
                    ? "bg-primary text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Building size={16} />
                Cấu hình chung
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                  activeTab === 'payment'
                    ? "bg-primary text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <CreditCard size={16} />
                Cổng thanh toán
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                  activeTab === 'shipping'
                    ? "bg-primary text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Truck size={16} />
                Đối tác vận chuyển
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                  activeTab === 'seo'
                    ? "bg-primary text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Globe size={16} />
                SEO Website
              </button>
            </CardContent>
          </Card>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'general' && (
            <Card className="border-slate-200/80 shadow-sm text-left">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg">Cấu hình chung</CardTitle>
                <CardDescription className="text-xs">Thiết lập thông tin liên hệ và vận hành cốt lõi của cửa hàng.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Tên cửa hàng / Doanh nghiệp</Label>
                    <Input 
                      value={generalSettings.storeName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, storeName: e.target.value })}
                      className="h-10 text-sm focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Email liên hệ khách hàng</Label>
                    <Input 
                      type="email"
                      value={generalSettings.storeEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, storeEmail: e.target.value })}
                      className="h-10 text-sm focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Hotline hỗ trợ vận hành</Label>
                    <Input 
                      value={generalSettings.storePhone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, storePhone: e.target.value })}
                      className="h-10 text-sm focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Địa chỉ kho bãi chính</Label>
                    <Input 
                      value={generalSettings.address}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                      className="h-10 text-sm focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Đơn vị tiền tệ chính</Label>
                    <Select 
                      value={generalSettings.currency} 
                      onValueChange={(val) => setGeneralSettings({ ...generalSettings, currency: val })}
                    >
                      <SelectTrigger className="h-10 text-sm bg-white border-slate-200">
                        <SelectValue placeholder="Chọn đơn vị tiền tệ" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="VND" className="cursor-pointer">Việt Nam Đồng (VND - ₫)</SelectItem>
                        <SelectItem value="USD" className="cursor-pointer">Đô-la Mỹ (USD - $)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-700">Ngôn ngữ giao diện</Label>
                    <Select 
                      value={generalSettings.language} 
                      onValueChange={(val) => setGeneralSettings({ ...generalSettings, language: val })}
                    >
                      <SelectTrigger className="h-10 text-sm bg-white border-slate-200">
                        <SelectValue placeholder="Chọn ngôn ngữ" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="vi" className="cursor-pointer">Tiếng Việt (Vietnamese)</SelectItem>
                        <SelectItem value="en" className="cursor-pointer">Tiếng Anh (English)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button 
                    onClick={() => handleSave('Cấu hình chung')}
                    disabled={isSaving}
                    className="font-bold flex items-center gap-1.5 h-10 px-5 shadow-sm"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Lưu thay đổi
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'payment' && (
            <Card className="border-slate-200/80 shadow-sm text-left">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg">Cổng thanh toán</CardTitle>
                <CardDescription className="text-xs">Bật/Tắt và định cấu hình API cho các cổng thanh toán trực tuyến.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                {/* COD */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-slate-50/50">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">Thanh toán khi nhận hàng (COD)</span>
                      <Badge variant="outline" className="bg-slate-100 text-slate-600 border-none font-bold text-[9px] uppercase tracking-wider">Mặc định</Badge>
                    </div>
                    <p className="text-xs text-slate-400">Khách hàng sẽ thanh toán tiền mặt trực tiếp cho shipper khi nhận được hàng.</p>
                  </div>
                  <Switch 
                    checked={paymentSettings.cod.enabled}
                    onCheckedChange={(checked) => setPaymentSettings({
                      ...paymentSettings,
                      cod: { enabled: checked }
                    })}
                  />
                </div>

                {/* MoMo */}
                <div className="p-4 rounded-xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">Ví điện tử MoMo</span>
                        <Badge className="bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-100 border-none font-bold text-[9px] uppercase tracking-wider">Khuyên dùng</Badge>
                      </div>
                      <p className="text-xs text-slate-400">Khách hàng thanh toán qua app Momo bằng cách quét mã QR Code hoặc chuyển khoản nhanh.</p>
                    </div>
                    <Switch 
                      checked={paymentSettings.momo.enabled}
                      onCheckedChange={(checked) => setPaymentSettings({
                        ...paymentSettings,
                        momo: { ...paymentSettings.momo, enabled: checked }
                      })}
                    />
                  </div>
                  {paymentSettings.momo.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pl-2 border-l-2 border-fuchsia-200 animate-page-fade-in">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <Lock size={10} /> Partner Code
                        </Label>
                        <Input 
                          value={paymentSettings.momo.partnerCode}
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            momo: { ...paymentSettings.momo, partnerCode: e.target.value }
                          })}
                          className="h-9 font-mono text-xs focus-visible:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <Lock size={10} /> Access Key
                        </Label>
                        <Input 
                          type="password"
                          value={paymentSettings.momo.accessKey}
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            momo: { ...paymentSettings.momo, accessKey: e.target.value }
                          })}
                          className="h-9 font-mono text-xs focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ZaloPay */}
                <div className="p-4 rounded-xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-sm font-bold text-slate-800">Ví điện tử ZaloPay</span>
                      <p className="text-xs text-slate-400">Tích hợp ví ZaloPay trực tiếp vào luồng thanh toán giỏ hàng.</p>
                    </div>
                    <Switch 
                      checked={paymentSettings.zalopay.enabled}
                      onCheckedChange={(checked) => setPaymentSettings({
                        ...paymentSettings,
                        zalopay: { ...paymentSettings.zalopay, enabled: checked }
                      })}
                    />
                  </div>
                  {paymentSettings.zalopay.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pl-2 border-l-2 border-blue-200 animate-page-fade-in">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <Lock size={10} /> App ID
                        </Label>
                        <Input 
                          value={paymentSettings.zalopay.appId}
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            zalopay: { ...paymentSettings.zalopay, appId: e.target.value }
                          })}
                          className="h-9 font-mono text-xs focus-visible:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <Lock size={10} /> Access Key / Secret Key
                        </Label>
                        <Input 
                          type="password"
                          value={paymentSettings.zalopay.accessKey}
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            zalopay: { ...paymentSettings.zalopay, accessKey: e.target.value }
                          })}
                          className="h-9 font-mono text-xs focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* OnePay ATM/Visa */}
                <div className="p-4 rounded-xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-sm font-bold text-slate-800">Cổng thẻ Quốc tế & ATM (OnePay)</span>
                      <p className="text-xs text-slate-400">Cho phép khách hàng thanh toán qua thẻ tín dụng Visa/MasterCard hoặc ATM nội địa của toàn bộ ngân hàng.</p>
                    </div>
                    <Switch 
                      checked={paymentSettings.onepay.enabled}
                      onCheckedChange={(checked) => setPaymentSettings({
                        ...paymentSettings,
                        onepay: { ...paymentSettings.onepay, enabled: checked }
                      })}
                    />
                  </div>
                  {paymentSettings.onepay.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pl-2 border-l-2 border-indigo-200 animate-page-fade-in">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <Lock size={10} /> Merchant ID
                        </Label>
                        <Input 
                          value={paymentSettings.onepay.merchantId}
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            onepay: { ...paymentSettings.onepay, merchantId: e.target.value }
                          })}
                          className="h-9 font-mono text-xs focus-visible:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <Lock size={10} /> Access Code
                        </Label>
                        <Input 
                          type="password"
                          value={paymentSettings.onepay.accessCode}
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            onepay: { ...paymentSettings.onepay, accessCode: e.target.value }
                          })}
                          className="h-9 font-mono text-xs focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button 
                    onClick={() => handleSave('Cổng thanh toán')}
                    disabled={isSaving}
                    className="font-bold flex items-center gap-1.5 h-10 px-5 shadow-sm"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Lưu thay đổi
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'shipping' && (
            <Card className="border-slate-200/80 shadow-sm text-left">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg">Đối tác vận chuyển</CardTitle>
                <CardDescription className="text-xs">Cấu hình các hãng logistics liên kết và thiết lập biểu phí mặc định.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                {/* Giao hàng nhanh (GHN) */}
                <div className="p-4 rounded-xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-sm font-bold text-slate-800">Giao Hàng Nhanh (GHN)</span>
                      <p className="text-xs text-slate-400">Tự động đẩy đơn, tính phí vận chuyển dựa trên trọng lượng hàng hóa thông qua API.</p>
                    </div>
                    <Switch 
                      checked={shippingSettings.ghn.enabled}
                      onCheckedChange={(checked) => setShippingSettings({
                        ...shippingSettings,
                        ghn: { ...shippingSettings.ghn, enabled: checked }
                      })}
                    />
                  </div>
                  {shippingSettings.ghn.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pl-2 border-l-2 border-orange-200 animate-page-fade-in">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <Lock size={10} /> API Token
                        </Label>
                        <Input 
                          type="password"
                          value={shippingSettings.ghn.token}
                          onChange={(e) => setShippingSettings({
                            ...shippingSettings,
                            ghn: { ...shippingSettings.ghn, token: e.target.value }
                          })}
                          className="h-9 font-mono text-xs focus-visible:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase">Phí đồng giá mặc định (₫)</Label>
                        <Input 
                          type="number"
                          value={shippingSettings.ghn.baseFee}
                          onChange={(e) => setShippingSettings({
                            ...shippingSettings,
                            ghn: { ...shippingSettings.ghn, baseFee: parseInt(e.target.value) || 0 }
                          })}
                          className="h-9 font-mono text-xs focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Giao hàng tiết kiệm (GHTK) */}
                <div className="p-4 rounded-xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-sm font-bold text-slate-800">Giao Hàng Tiết Kiệm (GHTK)</span>
                      <p className="text-xs text-slate-400">Hãng vận chuyển tối ưu giá cước đường bộ, thích hợp giao hàng nội ngoại thành giá rẻ.</p>
                    </div>
                    <Switch 
                      checked={shippingSettings.ghtk.enabled}
                      onCheckedChange={(checked) => setShippingSettings({
                        ...shippingSettings,
                        ghtk: { ...shippingSettings.ghtk, enabled: checked }
                      })}
                    />
                  </div>
                  {shippingSettings.ghtk.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pl-2 border-l-2 border-emerald-200 animate-page-fade-in">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <Lock size={10} /> API Secret Token
                        </Label>
                        <Input 
                          type="password"
                          value={shippingSettings.ghtk.token}
                          onChange={(e) => setShippingSettings({
                            ...shippingSettings,
                            ghtk: { ...shippingSettings.ghtk, token: e.target.value }
                          })}
                          className="h-9 font-mono text-xs focus-visible:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase">Phí đồng giá mặc định (₫)</Label>
                        <Input 
                          type="number"
                          value={shippingSettings.ghtk.baseFee}
                          onChange={(e) => setShippingSettings({
                            ...shippingSettings,
                            ghtk: { ...shippingSettings.ghtk, baseFee: parseInt(e.target.value) || 0 }
                          })}
                          className="h-9 font-mono text-xs focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Viettel Post */}
                <div className="p-4 rounded-xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-sm font-bold text-slate-800">Viettel Post</span>
                      <p className="text-xs text-slate-400">Mạng lưới giao hàng uy tín phủ rộng khắp 63 tỉnh thành đến tận các huyện đảo, vùng sâu.</p>
                    </div>
                    <Switch 
                      checked={shippingSettings.viettel.enabled}
                      onCheckedChange={(checked) => setShippingSettings({
                        ...shippingSettings,
                        viettel: { ...shippingSettings.viettel, enabled: checked }
                      })}
                    />
                  </div>
                  {shippingSettings.viettel.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 pl-2 border-l-2 border-rose-200 animate-page-fade-in">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <Lock size={10} /> API Client Token
                        </Label>
                        <Input 
                          type="password"
                          value={shippingSettings.viettel.token}
                          onChange={(e) => setShippingSettings({
                            ...shippingSettings,
                            viettel: { ...shippingSettings.viettel, token: e.target.value }
                          })}
                          className="h-9 font-mono text-xs focus-visible:ring-primary/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold text-slate-500 uppercase">Phí đồng giá mặc định (₫)</Label>
                        <Input 
                          type="number"
                          value={shippingSettings.viettel.baseFee}
                          onChange={(e) => setShippingSettings({
                            ...shippingSettings,
                            viettel: { ...shippingSettings.viettel, baseFee: parseInt(e.target.value) || 0 }
                          })}
                          className="h-9 font-mono text-xs focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button 
                    onClick={() => handleSave('Đối tác vận chuyển')}
                    disabled={isSaving}
                    className="font-bold flex items-center gap-1.5 h-10 px-5 shadow-sm"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Lưu thay đổi
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'seo' && (
            <Card className="border-slate-200/80 shadow-sm text-left">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg">SEO Website</CardTitle>
                <CardDescription className="text-xs">Cài đặt từ khóa và mô tả trang chủ mặc định để tối ưu hóa công cụ tìm kiếm Google.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Meta Title mặc định (Tiêu đề trang)</Label>
                  <Input 
                    value={seoSettings.metaTitle}
                    onChange={(e) => setSeoSettings({ ...seoSettings, metaTitle: e.target.value })}
                    className="h-10 text-sm focus-visible:ring-primary/20"
                  />
                  <p className="text-[10px] text-slate-400">Độ dài lý tưởng: 50 - 60 ký tự. Tiêu đề hiển thị trên tab trình duyệt và kết quả tìm kiếm.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Meta Description mặc định (Mô tả trang)</Label>
                  <textarea 
                    value={seoSettings.metaDescription}
                    onChange={(e) => setSeoSettings({ ...seoSettings, metaDescription: e.target.value })}
                    rows={4}
                    className="w-full rounded-md border border-slate-200 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                  <p className="text-[10px] text-slate-400">Độ dài lý tưởng: 150 - 160 ký tự. Tóm tắt nội dung hiển thị dưới đường dẫn Google.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Meta Keywords (Từ khóa ngăn cách bằng dấu phẩy)</Label>
                  <Input 
                    value={seoSettings.metaKeywords}
                    onChange={(e) => setSeoSettings({ ...seoSettings, metaKeywords: e.target.value })}
                    className="h-10 text-sm focus-visible:ring-primary/20"
                  />
                </div>

                {/* Google Search Live Preview */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3 mt-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Xem trước kết quả tìm kiếm Google (Snippet Preview)</h4>
                  <div className="space-y-1 font-sans">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
                      <span>https://cacao.com</span>
                      <ChevronRight size={10} className="text-slate-400" />
                    </div>
                    <h5 className="text-lg text-[#1a0dab] hover:underline cursor-pointer font-medium leading-tight truncate">
                      {seoSettings.metaTitle || 'Chưa nhập tiêu đề'}
                    </h5>
                    <p className="text-xs text-[#4d5156] leading-normal line-clamp-2">
                      {seoSettings.metaDescription || 'Chưa nhập mô tả nội dung...'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button 
                    onClick={() => handleSave('SEO Website')}
                    disabled={isSaving}
                    className="font-bold flex items-center gap-1.5 h-10 px-5 shadow-sm"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Lưu thay đổi
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
