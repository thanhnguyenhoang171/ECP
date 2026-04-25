'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme, Drawer, Dropdown, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  BarcodeOutlined,
  TeamOutlined,
  HistoryOutlined,
  HomeOutlined,
  CreditCardOutlined,
  ContainerOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import nprogress from 'nprogress';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const NextAdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    nprogress.start();
    const timer = setTimeout(() => {
      nprogress.done();
    }, 200);
    if (openDrawer) setOpenDrawer(false);
    return () => {
      clearTimeout(timer);
      nprogress.done();
    };
  }, [pathname]);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      localStorage.removeItem('access_token');
      router.push('/login');
    } else {
      router.push(key);
    }
  };

  const menuItems: MenuProps['items'] = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: 'Tổng quan' },
    {
      key: 'products-group',
      icon: <ShoppingOutlined />,
      label: 'Sản phẩm & SKU',
      children: [
        { key: '/products', label: 'Sản phẩm' },
        { key: '/skus', label: 'SKUs', icon: <TagsOutlined /> },
        { key: '/categories', label: 'Danh mục', icon: <AppstoreOutlined /> },
      ],
    },
    {
      key: 'inventory-group',
      icon: <DatabaseOutlined />,
      label: 'Quản lý kho',
      children: [
        { key: '/stock', label: 'Tồn kho' },
        { key: '/warehouses', label: 'Kho hàng', icon: <HomeOutlined /> },
        { key: '/inventory-ledger', label: 'Sổ nhật ký', icon: <HistoryOutlined /> },
        { key: '/barcode-scans', label: 'Quét mã vạch', icon: <BarcodeOutlined /> },
      ],
    },
    {
      key: 'sales-group',
      icon: <ContainerOutlined />,
      label: 'Kinh doanh',
      children: [
        { key: '/orders', label: 'Đơn hàng' },
        { key: '/payments', label: 'Thanh toán', icon: <CreditCardOutlined /> },
        { key: '/customers', label: 'Khách hàng', icon: <TeamOutlined /> },
      ],
    },
    { key: '/users', icon: <UserOutlined />, label: 'Nhân viên' },
    { key: 'divider-1', type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined className="text-red-500" />,
      label: <span className="text-red-500 font-medium">Đăng xuất</span>,
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    { key: '/profile', icon: <UserOutlined />, label: 'Hồ sơ cá nhân' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined className="text-red-500" />, label: <span className="text-red-500 font-medium">Đăng xuất</span> },
  ];

  const SidebarContent = (
    <div className="h-full flex flex-col">
      <div className="h-16 flex items-center justify-center font-bold text-xl text-blue-600 border-b border-gray-100 shrink-0">
        {(collapsed && !isMobile) ? 'ECP' : 'Admin ECP'}
      </div>
      <div className="flex-1 overflow-y-auto">
        <Menu theme="light" mode="inline" selectedKeys={[pathname]} onClick={handleMenuClick} items={menuItems} className="border-none" />
      </div>
    </div>
  );

  return (
    <Layout className="h-screen overflow-hidden">
      {!isMobile && (
        <Sider trigger={null} collapsible collapsed={collapsed} theme="light" className="shadow-md h-screen relative z-30" width={240}>
          {SidebarContent}
        </Sider>
      )}
      <Drawer placement="left" onClose={() => setOpenDrawer(false)} open={openDrawer} closable={false} width={240} styles={{ body: { padding: 0 } }}>
        {SidebarContent}
      </Drawer>
      <Layout className="h-screen flex flex-col overflow-hidden relative">
        <Header style={{ paddingLeft: 16, paddingRight: 16, background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="shadow-sm h-16 shrink-0 z-20">
          <div className="flex items-center">
            {isMobile ? (
              <Button type="text" icon={<MenuOutlined />} onClick={() => setOpenDrawer(true)} className="text-lg w-10 h-10 flex items-center justify-center hover:bg-gray-50" />
            ) : (
              <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} className="text-lg w-10 h-10 flex items-center justify-center hover:bg-gray-50" />
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-bold text-gray-800">Admin User</span>
              <span className="text-[11px] text-blue-600 uppercase tracking-wider font-bold">Quản trị viên</span>
            </div>
            <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }} placement="bottomRight" arrow>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-200 cursor-pointer border-2 border-white">AD</div>
            </Dropdown>
          </div>
        </Header>
        <Content className="overflow-y-auto bg-gray-50/50 p-4 sm:p-6">
          <div style={{ padding: isMobile ? 16 : 24, minHeight: '100%', background: colorBgContainer, borderRadius: borderRadiusLG }} className="shadow-sm border border-gray-100">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default NextAdminLayout;
