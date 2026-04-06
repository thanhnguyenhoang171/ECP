import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, theme, Drawer } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import nprogress from 'nprogress';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

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
    
    if (openDrawer) {
      setOpenDrawer(false);
    }

    return () => {
      clearTimeout(timer);
      nprogress.done();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      localStorage.removeItem('access_token');
      navigate('/login');
    } else {
      navigate(key);
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: 'Sản phẩm',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Người dùng',
    },
    {
      key: 'divider-1',
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined className="text-red-500" />,
      label: <span className="text-red-500 font-medium">Đăng xuất</span>,
    },
  ];

  const SidebarContent = (
    <div className="h-full flex flex-col">
      <div className="h-16 flex items-center justify-center font-bold text-xl text-blue-600 border-b border-gray-100 shrink-0">
        {(collapsed && !isMobile) ? 'ECP' : 'Admin ECP'}
      </div>
      <div className="flex-1 overflow-y-auto">
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={menuItems}
          className="border-none"
        />
      </div>
    </div>
  );

  return (
    <Layout className="h-screen overflow-hidden">
      {/* Sidebar Desktop */}
      {!isMobile && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed} 
          theme="light" 
          className="shadow-md h-screen relative z-30"
          width={240}
        >
          {SidebarContent}
        </Sider>
      )}

      {/* Drawer Mobile */}
      <Drawer
        placement="left"
        onClose={() => setOpenDrawer(false)}
        open={openDrawer}
        closable={false}
        width={240}
        styles={{ body: { padding: 0 } }}
      >
        {SidebarContent}
      </Drawer>

      <Layout className="h-screen flex flex-col overflow-hidden relative">
        <Header 
          style={{ padding: 0, background: colorBgContainer }} 
          className="flex justify-between px-4 items-center shadow-sm h-16 shrink-0 z-20"
        >
          <div className="flex items-center">
            {isMobile ? (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setOpenDrawer(true)}
                className="text-lg w-12 h-12"
              />
            ) : (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="text-lg w-12 h-12"
              />
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-bold text-gray-800">Admin User</div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Quản trị viên</div>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
              AD
            </div>
          </div>
        </Header>
        
        <Content
          className="overflow-y-auto bg-gray-50/50 p-4 sm:p-6"
        >
          <div 
            style={{
              padding: isMobile ? 16 : 24,
              minHeight: '100%',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
            className="shadow-sm border border-gray-100"
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;